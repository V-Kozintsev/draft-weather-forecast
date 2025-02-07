import React from "react";
import { useSelector } from "react-redux";

const WeatherInfo = () => {
  const weather = useSelector((state) => state.weather.weather);
  const units = useSelector((state) => state.weather.units);

  console.log("WeatherInfo: weather =", weather);
  console.log("WeatherInfo: units =", units);

  if (!weather) {
    return <div className="displayWeatherInfo">Загрузка...</div>;
  }

  const temperature = weather.temp; // Получаем температуру из weather
  const unitSymbol = units === "fahrenheit" ? "F" : "C"; // Определяем символ единицы

  return (
    <div className="displayWeatherInfo">
      <p className="weather-description" id="city">
        {weather.city}
      </p>
      <p className="weather-description" id="temp">
        {temperature}°{unitSymbol}
      </p>
      {weather.iconUrl && (
        <img id="weather-icon" src={weather.iconUrl} alt="Иконка погоды" />
      )}
      <p className="weather-description">
        Скорость ветра: {weather.windKph} km/h
      </p>
      <p className="weather-description">Влажность: {weather.humidity}%</p>
    </div>
  );
};

export default WeatherInfo;
