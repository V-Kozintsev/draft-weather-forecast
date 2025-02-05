import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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
    const { getByText } = render(
      <MemoryRouter initialEntries={["/about"]}>
        <About appVersion="1.0.0" />
      </MemoryRouter>
    );

    fireEvent.click(getByText("На главную"));
  });
});
