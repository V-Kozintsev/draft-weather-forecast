// SearchForm.test.jsx

import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { SearchForm } from "../components";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("SearchForm", () => {
  let navigate;

  beforeEach(() => {
    navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders input and button", () => {
    const { getByPlaceholderText, getByRole } = render(
      <BrowserRouter>
        <SearchForm />
      </BrowserRouter>
    );

    expect(getByPlaceholderText("Введите название города")).toBeInTheDocument();
    expect(getByRole("button", { name: /Показать/i })).toBeInTheDocument();
  });

  test("submits form and navigates", () => {
    const { getByPlaceholderText, getByRole } = render(
      <BrowserRouter>
        <SearchForm />
      </BrowserRouter>
    );

    fireEvent.change(getByPlaceholderText("Введите название города"), {
      target: { value: "Москва" },
    });

    fireEvent.click(getByRole("button", { name: /Показать/i }));

    expect(navigate).toHaveBeenCalledWith("/weather/Москва");
  });
});
