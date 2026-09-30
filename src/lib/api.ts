import * as SunCalc from "suncalc";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import tzlookup from "tz-lookup";
import { type City, type Forecast, isCity } from "./weather";

interface MetPoint {
  time: string;
  data: {
    instant: { details: {
      air_temperature: number;
      apparent_air_temperature?: number;
      relative_humidity?: number;
      air_pressure_at_sea_level?: number;
      wind_speed?: number;
      wind_from_direction?: number;
      ultraviolet_index_clear_sky?: number;
    } };
    next_1_hours?: { summary?: { symbol_code?: string }; details?: { precipitation_amount?: number } };
    next_6_hours?: { summary?: { symbol_code?: string }; details?: { precipitation_amount?: number } };
    next_12_hours?: { summary?: { symbol_code?: string }; details?: { precipitation_amount?: number } };
  };
}
interface MetResponse { properties?: { timeseries?: MetPoint[] } }
type CityRow = [string, string, string, number, number, string];
let cityRows: Promise<CityRow[]> | undefined;
const metCache = new Map<string, { value: unknown; expires: number }>();
const regionNames = new Intl.DisplayNames(["ru"], { type: "region" });

/** @param {string} event - Этап запроса. @param {Record<string, unknown>} detail - Безопасные метаданные. */
export function debug(event: string, detail: Record<string, unknown> = {}): void {
  if (readStorage("atmos-debug", false)) console.info(`[Atmos API] ${event}`, detail);
}

/** @param {string} key - Ключ хранилища. @param {T} fallback - Резервное значение. @returns {T} Прочитанные данные. */
export function readStorage<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}

/** @param {string} key - Ключ хранилища. @param {unknown} value - Данные для сохранения. */
export function saveStorage(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { debug("storage unavailable"); }
}

/** @param {string} url - Адрес источника. @param {AbortSignal} signal - Отмена запроса. @returns {Promise<T>} Проверенный JSON. */
async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  if (signal?.aborted) throw signal.reason;
  const cached = metCache.get(url);
  if (cached && cached.expires > Date.now()) {
    debug("cache hit", { service: "api.met.no" });
    return cached.value as T;
  }
  const timeout = AbortSignal.timeout(12000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const service = url.startsWith("https://") ? new URL(url).hostname : "local";
  debug("request", { service });
  try {
    if (service === "api.met.no" && Capacitor.isNativePlatform()) {
      const response = await CapacitorHttp.get({ url, headers: { "User-Agent": "Atmos/2.2.1 (https://github.com/V-Kozintsev/atmos-weather)" }, connectTimeout: 12000, readTimeout: 12000 });
      if (signal?.aborted) throw signal.reason;
      if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
      const data = response.data as T;
      const expiry = Date.parse(response.headers.Expires ?? response.headers.expires ?? "");
      metCache.set(url, { value: data, expires: Number.isFinite(expiry) && expiry > Date.now() ? expiry : Date.now() + 10 * 60 * 1000 });
      debug("received", { service, status: response.status });
      return data;
    }
    const response = await fetch(url, { signal: combined });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as T;
    if (service === "api.met.no") {
      const expiry = Date.parse(response.headers?.get("Expires") || "");
      metCache.set(url, { value: data, expires: Number.isFinite(expiry) && expiry > Date.now() ? expiry : Date.now() + 10 * 60 * 1000 });
    }
    debug("received", { service, status: response.status });
    return data;
  } catch (error) {
    debug("failed", { service, reason: error instanceof Error ? error.name : "unknown" });
    throw error;
  }
}

/** @param {string} query - Название города. @param {AbortSignal} signal - Отмена поиска. @returns {Promise<City[]>} Совпадения из GeoNames. */
export async function searchCities(query: string, signal: AbortSignal): Promise<City[]> {
  cityRows ??= request<CityRow[]>(`${import.meta.env.BASE_URL}cities.json`).catch((error: unknown) => { cityRows = undefined; throw error; });
  const rows = await cityRows;
  if (signal.aborted) throw signal.reason;
  const normalized = query.trim().toLocaleLowerCase("ru-RU");
  return rows.filter((row) => row[5].includes(normalized)).slice(0, 6)
    .map(([id, name, country, latitude, longitude]) => ({ id, name, country: regionNames.of(country) ?? country, latitude, longitude }));
}

/** @param {Date} date - Время UTC. @param {string} timezone - Часовой пояс города. @returns {string} Локальные дата и время. */
function localTime(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const value = (type: string): string => parts.find((part) => part.type === type)?.value || "00";
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
}

/** @param {string} date - Локальная дата. @param {number} latitude - Широта. @param {number} longitude - Долгота. @param {string} timezone - Часовой пояс. @param {"sunrise" | "sunset"} kind - Событие. @returns {string} Время события или пустая строка. */
function sunTime(date: string, latitude: number, longitude: number, timezone: string, kind: "sunrise" | "sunset"): string {
  for (const offset of [-1, 0, 1]) {
    const midday = new Date(`${date}T12:00:00Z`);
    midday.setUTCDate(midday.getUTCDate() + offset);
    const time = SunCalc.getTimes(midday, latitude, longitude)[kind];
    if (time && Number.isFinite(time.getTime()) && localTime(time, timezone).startsWith(date)) return localTime(time, timezone);
  }
  return "";
}

/** @param {string | undefined} symbol - Символ MET Norway. @returns {number} Код WMO для существующих иконок. */
function weatherCode(symbol?: string): number {
  const name = symbol?.replace(/_(day|night|polartwilight)$/, "") || "";
  if (name.includes("thunder")) return 95;
  if (name.includes("snow")) return 71;
  if (name.includes("sleet")) return 77;
  if (name.includes("rain")) return 63;
  if (name.includes("fog")) return 45;
  if (name === "cloudy") return 3;
  if (name === "partlycloudy") return 2;
  if (name === "fair") return 1;
  return 0;
}

/** @param {MetPoint} point - Точка прогноза. @returns {number} Осадки за ближайший доступный интервал в мм. */
function precipitation(point: MetPoint): number {
  return Math.max(0, point.data.next_1_hours?.details?.precipitation_amount ?? point.data.next_6_hours?.details?.precipitation_amount ?? point.data.next_12_hours?.details?.precipitation_amount ?? 0);
}

/** @param {City} city - Координаты города. @param {AbortSignal} signal - Отмена запроса. @returns {Promise<Forecast>} Прогноз MET Norway на неделю. */
export async function fetchForecast(city: City, signal: AbortSignal): Promise<Forecast> {
  const latitude = Math.round(city.latitude * 10000) / 10000;
  const longitude = Math.round(city.longitude * 10000) / 10000;
  const params = new URLSearchParams({ lat: String(latitude), lon: String(longitude) });
  const data = await request<MetResponse>(`https://api.met.no/weatherapi/locationforecast/2.0/complete?${params}`, signal);
  const points = data.properties?.timeseries;
  if (!Array.isArray(points) || points.length < 7 || !points.every((point) => Number.isFinite(point.data?.instant?.details?.air_temperature) && !Number.isNaN(Date.parse(point.time)))) throw new Error("Invalid forecast");
  const timezone = tzlookup(latitude, longitude);
  const hours = points.map((point) => {
    const details = point.data.instant.details;
    const symbol = point.data.next_1_hours?.summary?.symbol_code ?? point.data.next_6_hours?.summary?.symbol_code ?? point.data.next_12_hours?.summary?.symbol_code;
    return { time: localTime(new Date(point.time), timezone), temperature: details.air_temperature, feels: details.apparent_air_temperature ?? details.air_temperature, rain: precipitation(point), wind: (details.wind_speed ?? 0) * 3.6, code: weatherCode(symbol), day: symbol?.endsWith("_day") ?? true };
  });
  const startDate = hours[0].time.slice(0, 10);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(`${startDate}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + index);
    return day.toISOString().slice(0, 10);
  });
  const days = dates.map((date) => {
    const dayHours = hours.filter((hour) => hour.time.startsWith(date));
    if (!dayHours.length) throw new Error("Incomplete forecast");
    const daytime = dayHours.find((hour) => hour.day) ?? dayHours[0];
    const uvValues = points.filter((point) => localTime(new Date(point.time), timezone).startsWith(date)).map((point) => point.data.instant.details.ultraviolet_index_clear_sky).filter((value): value is number => Number.isFinite(value));
    return { date, min: Math.min(...dayHours.map((hour) => hour.temperature)), max: Math.max(...dayHours.map((hour) => hour.temperature)), rain: dayHours.reduce((total, hour) => total + hour.rain, 0), code: daytime.code, sunrise: sunTime(date, latitude, longitude, timezone, "sunrise"), sunset: sunTime(date, latitude, longitude, timezone, "sunset"), uv: uvValues.length ? Math.max(...uvValues) : NaN };
  });
  const details = points[0].data.instant.details;
  return { city, timezone, fetchedAt: Date.now(), current: { time: hours[0].time, temperature: details.air_temperature, feels: details.apparent_air_temperature ?? details.air_temperature, humidity: Math.round(details.relative_humidity ?? 0), wind: (details.wind_speed ?? 0) * 3.6, direction: details.wind_from_direction ?? 0, pressure: details.air_pressure_at_sea_level ?? 1013, code: hours[0].code, day: hours[0].day }, hours, days };
}

/** @param {City} city - Выбранный город. @returns {Forecast | undefined} Снимок не старше суток. */
export function cachedForecast(city: City): Forecast | undefined {
  const cached = readStorage<Forecast | null>("atmos-forecast-met", null);
  if (cached && isCity(cached.city) && cached.city.latitude === city.latitude && cached.city.longitude === city.longitude && Number.isFinite(cached.fetchedAt) && Date.now() >= cached.fetchedAt && Date.now() - cached.fetchedAt < 86400000 && Number.isFinite(cached.current?.temperature) && typeof cached.current?.time === "string" && Array.isArray(cached.hours) && cached.hours.length > 0 && cached.hours.every((hour) => hour && typeof hour.time === "string" && Number.isFinite(hour.temperature)) && Array.isArray(cached.days) && cached.days.length === 7 && cached.days.every((day) => day && typeof day.date === "string" && Number.isFinite(day.min) && Number.isFinite(day.max) && typeof day.sunrise === "string" && typeof day.sunset === "string")) return cached;
}
