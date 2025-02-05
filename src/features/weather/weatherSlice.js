import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const apiKey = "f7f0f48145544647b19130539240210";

// Async Thunk для получения погоды по координатам
export const fetchWeatherByCoords = createAsyncThunk(
  "weather/fetchWeatherByCoords",
  async ({ latitude, longitude, addToHistory }, { getState }) => {
    const units = getState().weather.units;
    const weatherApi = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`,
    );

    if (!weatherApi.ok) {
      throw new Error(
        `Ошибка HTTP: ${weatherApi.status} ${weatherApi.statusText}`,
      );
    }

    const result = await weatherApi.json();
    if (!result || !result.location || !result.current) {
      throw new Error("Неверный формат ответа от API");
    }

    let tempCelsius = Math.floor(result.current.temp_c);
    let temp;

    if (units === "fahrenheit") {
      temp = Math.floor((tempCelsius * 9) / 5 + 32);
    } else {
      temp = tempCelsius;
    }

    const city = result.location.name;
    const iconUrl = `https:${result.current.condition.icon}`;
    const windKph = result.current.wind_kph;
    const humidity = result.current.humidity;

    const weatherData = {
      temp,
      city,
      iconUrl,
      windKph,
      humidity,
      longitude,
      latitude,
      units, // Сохраняем units в weatherData
    };

    if (addToHistory) {
      return { ...weatherData, addToHistory };
    }

    return weatherData;
  },
);

// Async Thunk для получения погоды по городу
export const fetchWeatherByCity = createAsyncThunk(
  "weather/fetchWeatherByCity",
  async ({ city, addToHistory }, { getState }) => {
    const units = getState().weather.units;
    const weatherApi = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`,
    );

    if (!weatherApi.ok) {
      throw new Error(
        `Ошибка HTTP: ${weatherApi.status} ${weatherApi.statusText}`,
      );
    }

    const result = await weatherApi.json();
    if (!result || !result.location || !result.current) {
      throw new Error("Неверный формат ответа от API");
    }

    let tempCelsius = Math.floor(result.current.temp_c);
    let temp;

    if (units === "fahrenheit") {
      temp = Math.floor((tempCelsius * 9) / 5 + 32);
    } else {
      temp = tempCelsius;
    }

    const nameCity = result.location.name;
    const { lon, lat } = result.location;
    const iconUrl = `https:${result.current.condition.icon}`;
    const windKph = result.current.wind_kph;
    const humidity = result.current.humidity;

    const weatherData = {
      temp,
      city: nameCity,
      iconUrl,
      windKph,
      humidity,
      longitude: lon,
      latitude: lat,
      units, // Сохраняем units в weatherData
    };

    if (addToHistory) {
      return { ...weatherData, addToHistory };
    }

    return weatherData;
  },
);

const initialState = {
  weather: null,
  history: [],
  loading: false,
  error: null,
  theme: localStorage.getItem("theme") || "light",
  units: localStorage.getItem("units") || "celsius",
  username: localStorage.getItem("username") || "",
};

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    addCityToHistory: (state, action) => {
      const { city, temp, units, longitude, latitude } = action.payload;
      if (!state.history.some((item) => item.city === city)) {
        state.history.push({
          city: city,
          temp: temp,
          units: units,
          longitude,
          latitude,
        });
      }
    },
    deleteHistory: (state) => {
      state.history = [];
      localStorage.removeItem("weatherHistory");
    },
    loadHistoryFromStorage: (state) => {
      const storedHistory = localStorage.getItem("weatherHistory");
      if (storedHistory) {
        try {
          state.history = JSON.parse(storedHistory);
        } catch (e) {
          console.error("Ошибка при разборе истории из localStorage:", e);
          localStorage.removeItem("weatherHistory");
          state.history = [];
        }
      }
    },
    setUsername: (state, action) => {
      state.username = action.payload; // Сохраняем имя пользователя
      localStorage.setItem("username", action.payload); // Сохраняем в localStorage
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    setUnits: (state, action) => {
      const newUnits = action.payload;
      state.units = newUnits;
      localStorage.setItem("units", newUnits);

      // Проверяем, если history существует и является массивом
      if (Array.isArray(state.history)) {
        state.history = state.history.map((item) => {
          let temp = item.temp;
          if (newUnits === "fahrenheit" && item.units === "celsius") {
            temp = Math.round((item.temp * 9) / 5 + 32);
          } else if (newUnits === "celsius" && item.units === "fahrenheit") {
            temp = Math.round(((item.temp - 32) * 5) / 9);
          }
          return { ...item, temp: temp, units: newUnits };
        });
      } else {
        console.warn("History is not an array", state.history);
        state.history = []; // Восстанавливаем history если это необходимо
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherByCoords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherByCoords.fulfilled, (state, action) => {
        state.loading = false;
        state.weather = action.payload;
        if (action.payload.addToHistory) {
          const { city, temp, units, longitude, latitude } = action.payload;
          weatherSlice.caseReducers.addCityToHistory(state, {
            payload: { city, temp, units, longitude, latitude },
          });
        }
      })
      .addCase(fetchWeatherByCoords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchWeatherByCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherByCity.fulfilled, (state, action) => {
        state.loading = false;
        state.weather = action.payload;
        if (action.payload.addToHistory) {
          const { city, temp, units, longitude, latitude } = action.payload;
          weatherSlice.caseReducers.addCityToHistory(state, {
            payload: { city, temp, units, longitude, latitude },
          });
        }
      })
      .addCase(fetchWeatherByCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  addCityToHistory,
  deleteHistory,
  loadHistoryFromStorage,
  setTheme,
  setUnits,
  setUsername,
} = weatherSlice.actions;

// Remove this line - it's no longer needed
// export { fetchWeatherByCoords, fetchWeatherByCity };

export default weatherSlice.reducer;
