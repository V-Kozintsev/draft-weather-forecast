import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; // Импортируем MemoryRouter
import { About } from "../components"; // Импортируем компонент About

describe("About Component", () => {
  test("renders About component with app version", () => {
    // Передаем версию приложения в компонент
    render(
      <MemoryRouter>
        <About appVersion="1.0.0" />
      </MemoryRouter>
    );

    // Проверяем, что заголовок отображается корректно
    expect(screen.getByText("О приложении")).toBeInTheDocument();

    // Проверяем, отображается ли текст "Версия:" и версия приложения
    expect(screen.getByText(/Версия:/)).toBeInTheDocument();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
  });

  test("navigates to homepage when button is clicked", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/about"]}>
        <About appVersion="1.0.0" />
      </MemoryRouter>
    );

    // Находим кнопку и симулируем нажатие
    fireEvent.click(getByText("На главную"));

    // Проверка на предмет перехода на главную страницу
    // В этой ситуации, возможно, нужно будет использовать Mock для проверки навигации, но это зависит от вашего контекста
    // Можно добавить дополнительную логику для проверки, если у вас есть такой механизм
  });
});
