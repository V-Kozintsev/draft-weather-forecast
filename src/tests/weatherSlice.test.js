// weatherSlice.test.js
import { configureStore } from "@reduxjs/toolkit";
import weatherReducer, {
  fetchWeatherByCoords,
  fetchWeatherByCity,
  addCityToHistory,
  deleteHistory,
  setTheme,
  setUnits,
  setUsername,
} from "../features/weather/weatherSlice";

describe("weatherSlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        weather: weatherReducer,
      },
    });
  });

  test("should handle initial state", () => {
    const state = store.getState().weather;
    expect(state.weather).toBeNull();
    expect(state.history).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.theme).toBe("light");
    expect(state.units).toBe("celsius");
    expect(state.username).toBe("");
  });

  test("should handle addCityToHistory", () => {
    const newCity = {
      city: "Moscow",
      temp: 15,
      units: "celsius",
      longitude: 37.6173,
      latitude: 55.7558,
    };

    store.dispatch(addCityToHistory(newCity));
    const state = store.getState().weather;
    expect(state.history.length).toBe(1);
    expect(state.history[0]).toEqual(newCity);
  });

  test("should not add duplicate city to history", () => {
    const newCity = {
      city: "Moscow",
      temp: 15,
      units: "celsius",
      longitude: 37.6173,
      latitude: 55.7558,
    };

    store.dispatch(addCityToHistory(newCity));
    store.dispatch(addCityToHistory(newCity)); // добавляем снова

    const state = store.getState().weather;
    expect(state.history.length).toBe(1); // должно остаться 1
  });

  test("should handle deleteHistory", () => {
    const newCity = {
      city: "Moscow",
      temp: 15,
      units: "celsius",
      longitude: 37.6173,
      latitude: 55.7558,
    };

    store.dispatch(addCityToHistory(newCity));
    store.dispatch(deleteHistory());

    const state = store.getState().weather;
    expect(state.history).toEqual([]); // история должна быть пустой
  });

  test("should handle setTheme", () => {
    store.dispatch(setTheme("dark"));
    const state = store.getState().weather;
    expect(state.theme).toBe("dark"); // тема должна измениться на 'dark'
  });

  test("should handle setUnits", () => {
    store.dispatch(setUnits("fahrenheit"));
    const state = store.getState().weather;
    expect(state.units).toBe("fahrenheit"); // единицы измерения должны измениться на 'fahrenheit'
  });

  test("should handle setUsername", () => {
    store.dispatch(setUsername("JohnDoe"));
    const state = store.getState().weather;
    expect(state.username).toBe("JohnDoe"); // имя пользователя должно измениться
  });

  // Здесь мы будем тестировать асинхронные действия.

  // Тестируем обработку ошибок
  test("fetchWeatherByCoords should handle errors", async () => {
    const thunk = fetchWeatherByCoords({ latitude: 999, longitude: 999 });
    await store.dispatch(thunk);

    const state = store.getState().weather;
    expect(state.loading).toBe(false); // загрузка завершена
    expect(state.error).not.toBeNull(); // ошибка должна быть установлена
  });

  test("fetchWeatherByCity should handle errors", async () => {
    const thunk = fetchWeatherByCity({
      city: "InvalidCity",
      addToHistory: false,
    });
    await store.dispatch(thunk);

    const state = store.getState().weather;
    expect(state.loading).toBe(false); // загрузка завершена
    expect(state.error).not.toBeNull(); // ошибка должна быть установлена
  });
});
