import { type Air, type City, type Forecast, isCity } from "./weather";

interface ForecastResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
}
interface GeocodingResponse {
  results?: {
    id: number;
    name: string;
    admin1?: string;
    country?: string;
    latitude: number;
    longitude: number;
  }[];
}
interface AirResponse {
  current: { european_aqi: number; pm2_5: number; time: string };
}

/** @param {string} event - Этап запроса. @param {Record<string, unknown>} detail - Безопасные метаданные без координат и запросов пользователя. */
export function debug(
  event: string,
  detail: Record<string, unknown> = {},
): void {
  if (readStorage("atmos-debug", false))
    console.info(`[Atmos API] ${event}`, detail);
}

/** @param {string} key - Ключ хранилища. @param {T} fallback - Значение при недоступном или повреждённом хранилище. @returns {T} Прочитанные данные. */
export function readStorage<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

/** @param {string} key - Ключ хранилища. @param {unknown} value - Значение для сохранения. */
export function saveStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    debug("storage unavailable");
  }
}

/** @param {string} url - Адрес Open-Meteo. @param {AbortSignal} signal - Отмена запроса. @returns {Promise<T>} Ответ API после проверки статуса. */
async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(12000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const kind = new URL(url).hostname.split(".")[0];
  debug("request", { service: kind });
  try {
    const response = await fetch(url, { signal: combined });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error("API response rejected");
    debug("received", { service: kind, status: response.status });
    return data;
  } catch (error) {
    debug("failed", {
      service: kind,
      reason: error instanceof Error ? error.name : "unknown",
    });
    throw error;
  }
}

/** @param {string} query - Название города. @param {AbortSignal} signal - Отмена предыдущего поиска. @returns {Promise<City[]>} Города с регионом для различения совпадений. */
export async function searchCities(
  query: string,
  signal: AbortSignal,
): Promise<City[]> {
  const data = await request<GeocodingResponse>(
    `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: query, count: "6", language: "ru", format: "json" })}`,
    signal,
  );
  return (data.results || [])
    .map((c) => ({
      id: String(c.id),
      name: c.name,
      country: [c.admin1, c.country].filter(Boolean).join(", "),
      latitude: c.latitude,
      longitude: c.longitude,
    }))
    .filter(isCity);
}

/** @param {City} city - Координаты города. @param {AbortSignal} signal - Отмена устаревшего запроса. @returns {Promise<Forecast>} Нормализованные текущие, почасовые и дневные данные. */
export async function fetchForecast(
  city: City,
  signal: AbortSignal,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    timezone: "auto",
    forecast_days: "7",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure",
    hourly:
      "temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
  });
  const data = await request<ForecastResponse>(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );
  const { current: c, hourly: h, daily: d } = data;
  if (
    !c ||
    !Number.isFinite(c.temperature_2m) ||
    ![
      c.apparent_temperature,
      c.relative_humidity_2m,
      c.wind_speed_10m,
      c.wind_direction_10m,
      c.surface_pressure,
      c.weather_code,
    ].every(Number.isFinite) ||
    typeof c.time !== "string" ||
    !Array.isArray(h?.time) ||
    !Array.isArray(d?.time) ||
    d.time.length !== 7 ||
    ![
      h.temperature_2m,
      h.apparent_temperature,
      h.precipitation_probability,
      h.weather_code,
      h.wind_speed_10m,
      h.is_day,
    ].every(
      (values) =>
        Array.isArray(values) &&
        values.length === h.time.length &&
        values.every(Number.isFinite),
    ) ||
    ![
      d.temperature_2m_min,
      d.temperature_2m_max,
      d.precipitation_probability_max,
      d.weather_code,
    ].every(
      (values) =>
        Array.isArray(values) &&
        values.length === 7 &&
        values.every(Number.isFinite),
    )
  )
    throw new Error("Invalid forecast");
  const result: Forecast = {
    city,
    timezone: data.timezone,
    fetchedAt: Date.now(),
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      feels: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m,
      direction: c.wind_direction_10m,
      pressure: c.surface_pressure,
      code: c.weather_code,
      day: !!c.is_day,
    },
    hours: h.time.map((time: string, i: number) => ({
      time,
      temperature: h.temperature_2m[i],
      feels: h.apparent_temperature[i],
      rain: h.precipitation_probability[i],
      code: h.weather_code[i],
      wind: h.wind_speed_10m[i],
      day: !!h.is_day[i],
    })),
    days: d.time.map((date: string, i: number) => ({
      date,
      min: d.temperature_2m_min[i],
      max: d.temperature_2m_max[i],
      rain: d.precipitation_probability_max[i],
      code: d.weather_code[i],
      sunrise: d.sunrise?.[i] || "",
      sunset: d.sunset?.[i] || "",
      uv: d.uv_index_max?.[i] ?? NaN,
    })),
  };
  return result;
}

/** @param {City} city - Город прогноза. @param {AbortSignal} signal - Отмена запроса. @returns {Promise<Air>} Европейский индекс качества воздуха из модели CAMS. */
export async function fetchAir(city: City, signal: AbortSignal): Promise<Air> {
  const data = await request<AirResponse>(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${new URLSearchParams({ latitude: String(city.latitude), longitude: String(city.longitude), current: "european_aqi,pm2_5", timezone: "auto" })}`,
    signal,
  );
  if (
    !Number.isFinite(data.current?.european_aqi) ||
    !Number.isFinite(data.current?.pm2_5) ||
    typeof data.current?.time !== "string"
  )
    throw new Error("Air data unavailable");
  return {
    aqi: data.current.european_aqi,
    pm25: data.current.pm2_5,
    time: data.current.time,
  };
}

/** @param {City} city - Выбранный город. @returns {Forecast | undefined} Проверенный снимок не старше 24 часов. */
export function cachedForecast(city: City): Forecast | undefined {
  const cached = readStorage<Forecast | null>("atmos-forecast", null);
  if (
    cached &&
    isCity(cached.city) &&
    cached.city.latitude === city.latitude &&
    cached.city.longitude === city.longitude &&
    Number.isFinite(cached.fetchedAt) &&
    Date.now() >= cached.fetchedAt &&
    Date.now() - cached.fetchedAt < 86400000 &&
    Number.isFinite(cached.current?.temperature) &&
    typeof cached.current?.time === "string" &&
    Array.isArray(cached.hours) &&
    cached.hours.length > 0 &&
    cached.hours.every(
      (h) => h && typeof h.time === "string" && Number.isFinite(h.temperature),
    ) &&
    Array.isArray(cached.days) &&
    cached.days.length === 7 &&
    cached.days.every(
      (d) =>
        d &&
        typeof d.date === "string" &&
        Number.isFinite(d.min) &&
        Number.isFinite(d.max) &&
        typeof d.sunrise === "string" &&
        typeof d.sunset === "string",
    )
  )
    return cached;
}
