import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bestHour,
  CITIES,
  clock,
  condition,
  isCity,
  temperature,
  weekday,
  type Hour,
} from "./weather";
import {
  cachedForecast,
  fetchForecast,
  readStorage,
  saveStorage,
  searchCities,
} from "./api";

const storage = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
});
const hour: Hour = {
  time: "2026-09-29T12:00",
  temperature: 18,
  feels: 18,
  rain: 0,
  wind: 5,
  code: 0,
  day: true,
};
afterEach(() => {
  storage.clear();
  vi.restoreAllMocks();
});

describe("weather presentation", () => {
  it.each([
    [0, 32],
    [-40, -40],
    [20, 68],
    [30, 86],
  ])("converts %s°C without changing source data", (c, f) => {
    expect(temperature(c, true)).toBe(f);
    expect(temperature(c)).toBe(c);
  });
  it("preserves the city time instead of applying the browser timezone", () => {
    expect(clock("2026-09-29T06:28")).toBe("06:28");
    expect(weekday("2026-09-29")).toBe("вт");
  });
  it.each([
    [0, "Ясно"],
    [45, "Туман"],
    [61, "Дождь"],
    [71, "Снег"],
    [80, "Дождь"],
    [85, "Снег"],
    [95, "Гроза"],
  ])("maps WMO code %s correctly", (code, label) =>
    expect(condition(code)).toBe(label),
  );
  it("rejects invalid coordinates and corrupted stored cities", () => {
    expect(isCity(null)).toBe(false);
    expect(isCity({ ...CITIES[0], latitude: 91 })).toBe(false);
    expect(isCity({ ...CITIES[0], longitude: NaN })).toBe(false);
    expect(isCity(CITIES[0])).toBe(true);
  });
});
describe("activity selection", () => {
  it("excludes nights, rain, thunder and strong wind", () => {
    expect(
      bestHour(
        [
          { ...hour, day: false },
          { ...hour, rain: 80 },
          { ...hour, code: 95 },
          { ...hour, wind: 45 },
        ],
        "walk",
      ),
    ).toBeUndefined();
  });
  it("uses the stricter wind threshold for cycling", () => {
    expect(bestHour([{ ...hour, wind: 24 }], "cycle")).toBeUndefined();
    expect(bestHour([{ ...hour, wind: 24 }], "walk")).toBeDefined();
  });
  it("uses apparent temperature rather than measured temperature", () => {
    expect(
      bestHour([{ ...hour, temperature: 18, feels: -5 }], "run"),
    ).toBeUndefined();
  });
  it("selects the least rainy comfortable hour without mutating the array", () => {
    const hours = [
      { ...hour, rain: 20 },
      { ...hour, time: "2026-09-29T13:00" },
    ];
    expect(bestHour(hours, "run")?.time).toBe("2026-09-29T13:00");
    expect(hours[0].rain).toBe(20);
  });
});
describe("API and storage failure handling", () => {
  it("does not crash on invalid storage JSON", () => {
    storage.set("broken", "{");
    expect(readStorage("broken", [])).toEqual([]);
  });
  it("rejects an expired or different-city cache", () => {
    saveStorage("atmos-forecast", {
      city: CITIES[0],
      fetchedAt: Date.now() - 86400001,
    });
    expect(cachedForecast(CITIES[0])).toBeUndefined();
    expect(cachedForecast(CITIES[1])).toBeUndefined();
  });
  it("rejects rate limiting instead of treating the error as weather", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    );
    await expect(
      fetchForecast(CITIES[0], new AbortController().signal),
    ).rejects.toThrow("HTTP 429");
  });
  it("rejects a malformed forecast", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ current: {} }),
        }),
    );
    await expect(
      fetchForecast(CITIES[0], new AbortController().signal),
    ).rejects.toThrow("Invalid forecast");
  });
  it("encodes the search query, passes abort signal and filters malformed coordinates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        results: [
          {
            id: 1,
            name: "Москва",
            country: "Россия",
            latitude: 55,
            longitude: 37,
          },
          { id: 2, name: "Broken", latitude: 999, longitude: 0 },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    const result = await searchCities("Москва &", controller.signal);
    expect(result).toHaveLength(1);
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get("name")).toBe(
      "Москва &",
    );
    controller.abort();
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
