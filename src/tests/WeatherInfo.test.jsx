// WeatherInfo.test.jsx

import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { WeatherInfo } from "../components";
import weatherReducer from "../features/weather/weatherSlice"; // Импортируйте ваш редюсер погоды

const mockStore = (initialState) => {
  return configureStore({
    reducer: { weather: weatherReducer },
    preloadedState: initialState,
  });
};

describe("WeatherInfo Component", () => {
  it("renders loading message when weather is not available", () => {
    const store = mockStore({ weather: { weather: null, units: "celsius" } });
    const { getByText } = render(
      <Provider store={store}>
        <WeatherInfo />
      </Provider>
    );

    expect(getByText(/загрузка/i)).toBeInTheDocument();
  });

  it("renders weather information when weather is available", () => {
    const weatherData = {
      city: "Москва",
      temp: 25,
      iconUrl: "http://example.com/weather-icon.png",
      windKph: 15,
      humidity: 60,
    };

    const store = mockStore({
      weather: { weather: weatherData, units: "celsius" },
    });
    const { getByText, getByAltText } = render(
      <Provider store={store}>
        <WeatherInfo />
      </Provider>
    );

    expect(getByText(/москва/i)).toBeInTheDocument();
    expect(getByText(/25°c/i)).toBeInTheDocument();
    expect(getByAltText(/иконка погоды/i)).toHaveAttribute(
      "src",
      weatherData.iconUrl
    );
    expect(getByText(/скорость ветра: 15 km\/h/i)).toBeInTheDocument();
    expect(getByText(/влажность: 60%/i)).toBeInTheDocument();
  });
});
