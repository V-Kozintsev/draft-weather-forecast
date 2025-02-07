import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { History } from "../components";
import weatherReducer, {
  deleteHistory,
} from "../features/weather/weatherSlice";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

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
    render(
      <Provider store={store}>
        <MemoryRouter>
          <History />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Москва: 25°C")).toBeInTheDocument();
    expect(screen.getByText("Нью-Йорк: 77°F")).toBeInTheDocument();
  });

  it("renders empty history message when history is empty", () => {
    const initialState = {
      weather: {
        history: [],
      },
    };

    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MemoryRouter>
          <History />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("История пуста")).toBeInTheDocument();
  });

  it("dispatches deleteHistory action when delete button is clicked", () => {
    const initialState = {
      weather: {
        history: [{ city: "Москва", temp: 25, units: "celsius" }],
      },
    };
    const store = mockStore(initialState);
    store.dispatch = jest.fn(); // Mock dispatch function

    render(
      <Provider store={store}>
        <MemoryRouter>
          <History />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText("Удалить историю"));
    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(deleteHistory());
  });
});
