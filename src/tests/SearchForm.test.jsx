// SearchForm.test.jsx

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SearchForm } from "../components";
import { useNavigate } from "react-router-dom";

// Мокаем useNavigate для тестов
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("SearchForm", () => {
  let navigate;

  beforeEach(() => {
    navigate = jest.fn(); // создаем мок для функции navigate
    useNavigate.mockReturnValue(navigate); // возвращаем мок при вызове useNavigate
  });

  afterEach(() => {
    jest.clearAllMocks(); // очищаем вызовы после каждого теста
  });

  test("renders input and button", () => {
    const { getByPlaceholderText, getByRole } = render(
      <BrowserRouter>
        <SearchForm />
      </BrowserRouter>
    );

    // Проверяем, что поле ввода и кнопка отображаются
    expect(getByPlaceholderText("Введите название города")).toBeInTheDocument();
    expect(getByRole("button", { name: /Показать/i })).toBeInTheDocument();
  });

  test("submits form and navigates", () => {
    const { getByPlaceholderText, getByRole } = render(
      <BrowserRouter>
        <SearchForm />
      </BrowserRouter>
    );

    // Вводим текст в поле
    fireEvent.change(getByPlaceholderText("Введите название города"), {
      target: { value: "Москва" },
    });

    // Отправляем форму
    fireEvent.click(getByRole("button", { name: /Показать/i }));

    // Проверяем, что navigate был вызван с правильным адресом
    expect(navigate).toHaveBeenCalledWith("/weather/Москва");
  });
});
