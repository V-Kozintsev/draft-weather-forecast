// History.test.jsx

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { History } from "../components";
import weatherReducer from "../features/weather/weatherSlice";

const mockStore = (initialState) => {
  return configureStore({
    reducer: { weather: weatherReducer },
    preloadedState: initialState,
  });
};

describe("History Component", () => {
  it("renders history items when history is not empty", () => {
    const initialState = {
      weather: {
        history: [
          { city: "Москва", temp: 25, units: "celsius" },
          { city: "Нью-Йорк", temp: 77, units: "fahrenheit" },
        ],
      },
    };

    const store = mockStore(initialState);
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          {" "}
          {}
          <History />
        </MemoryRouter>
      </Provider>
    );

    expect(getByText("Москва: 25°C")).toBeInTheDocument();
    expect(getByText("Нью-Йорк: 77°F")).toBeInTheDocument();
  });

  it("renders empty history message when history is empty", () => {
    const initialState = {
      weather: {
        history: [],
      },
    };

    const store = mockStore(initialState);
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          {" "}
          {}
          <History />
        </MemoryRouter>
      </Provider>
    );

    expect(getByText("История пуста")).toBeInTheDocument();
  });
});
