//store.js
import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "../features/weather/weatherSlice"; // Укажите правильный путь к файлу

const store = configureStore({
  reducer: {
    weather: weatherReducer,
  },
});

export default store;
