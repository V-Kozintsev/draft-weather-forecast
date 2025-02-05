import React from "react";
import { useNavigate } from "react-router-dom";

const About = ({ appVersion }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Переход на главную страницу
  };

  return (
    <div id="about-page">
      <h2>О приложении</h2>
      <p>
        Это простое приложение для отображения текущей погоды в любом городе
        мира и определения местоположения на карте.
      </p>
      <p>
        Версия: <span id="app-version">{appVersion}</span>
      </p>
      <p>Используемые технологии:</p>
      <ul>
        <li>HTML</li>
        <li>CSS</li>
        <li>JavaScript</li>
        <li>React</li>
        <li>Redux Toolkit</li>
        <li>WeatherAPI (для получения данных о погоде)</li>
        <li>Yandex Maps API (для отображения карты)</li>
      </ul>
      <p>Разработчик: Виктор</p>
      <p>
        Контакт:{" "}
        <a
          href="https://t.me/viktorkozintsev"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://t.me/viktorkozintsev
        </a>
      </p>
      <p>
        Репозиторий на{" "}
        <a
          href="https://github.com/V-Kozintsev"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </p>
      <button type="button" id="home-button" onClick={handleGoHome}>
        На главную
      </button>
    </div>
  );
};

export default About;
