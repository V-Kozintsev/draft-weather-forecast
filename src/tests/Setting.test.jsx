import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { Settings } from "../components";
import rootReducer from "../features/weather/weatherSlice";

const renderWithRedux = (
  component,
  {
    initialState,
    store = configureStore({
      reducer: rootReducer,
      preloadedState: initialState,
    }),
  } = {}
) => {
  if (typeof TextEncoder === "undefined") {
    global.TextEncoder = require("text-encoding").TextEncoder;
  }
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{component}</MemoryRouter>
      </Provider>
    ),
    store,
  };
};

test("изменение настроек и сохранение их в Redux", () => {
  const initialState = {
    weather: {
      theme: "light",
      units: "celsius",
      username: "",
    },
  };

  const { getByLabelText, getByRole } = renderWithRedux(<Settings />, {
    initialState,
  });

  expect(getByLabelText(/Тема:/)).toHaveValue("light");
  expect(getByLabelText(/Единицы измерения:/)).toHaveValue("celsius");
  expect(getByLabelText(/Имя пользователя:/)).toHaveValue("");

  fireEvent.change(getByLabelText(/Тема:/), { target: { value: "dark" } });
  fireEvent.change(getByLabelText(/Единицы измерения:/), {
    target: { value: "fahrenheit" },
  });
  fireEvent.change(getByLabelText(/Имя пользователя:/), {
    target: { value: "newUser" },
  });

  fireEvent.click(getByRole("button", { name: /Сохранить/ }));

  expect(getByLabelText(/Тема:/)).toHaveValue("dark");
  expect(getByLabelText(/Единицы измерения:/)).toHaveValue("fahrenheit");
  expect(getByLabelText(/Имя пользователя:/)).toHaveValue("newUser");
});
