import { useEffect, useState } from "react";
import {
  cachedForecast,
  debug,
  fetchForecast,
  saveStorage,
} from "./api";
import type { City, Forecast } from "./weather";

/** @param {City} city - Выбранный город. @returns {object} Данные, состояние сети и ручное обновление с защитой от гонок запросов. */
export function useWeather(city: City) {
  const [forecast, setForecast] = useState<Forecast>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setRevision((r) => r + 1), 900000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    const cached = cachedForecast(city);
    setForecast(cached);
    setStale(!!cached);
    setLoading(true);
    setError("");
    debug("loading");
    fetchForecast(city, abort.signal)
      .then((data) => {
        if (abort.signal.aborted) return;
        setForecast(data);
        setStale(false);
        saveStorage("atmos-forecast-met", data);
        debug("ready");
      })
      .catch(() => {
        if (!abort.signal.aborted) {
          setError(
            cached
              ? "Сеть недоступна. Показан сохранённый прогноз."
              : "Не удалось получить прогноз. Проверьте соединение и попробуйте ещё раз.",
          );
          debug("forecast unavailable", { cached: !!cached });
        }
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [city.latitude, city.longitude, revision]);
  const matchesCity =
    forecast?.city.latitude === city.latitude &&
    forecast?.city.longitude === city.longitude;
  return {
    forecast: matchesCity ? forecast : undefined,
    loading,
    error,
    stale,
    refresh: () => setRevision((r) => r + 1),
  };
}
