import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { About } from "../components";
import { useNavigate } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("About Component", () => {
  test("renders About component with app version", () => {
    render(
      <MemoryRouter>
        <About appVersion="1.0.0" />
      </MemoryRouter>
    );
    expect(screen.getByText("О приложении")).toBeInTheDocument();
    expect(screen.getByText(/Версия:/)).toBeInTheDocument();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
  });

  test("navigates to homepage when button is clicked", () => {
    const navigate = jest.fn();
    useNavigate.mockImplementation(() => navigate);
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <About appVersion="1.0.0" />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText("На главную"));
    expect(navigate).toHaveBeenCalledWith("/");
  });
});
