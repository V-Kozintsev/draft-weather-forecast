// В файле WeeklyWeather.jsx
import React from "react";
import { useSelector } from "react-redux";

const WeeklyWeather = () => {
  const weeklyWeather = useSelector((state) => state.weather.weeklyWeather);

  if (!weeklyWeather.length) {
    return <div>Нет данных о недельном прогнозе...</div>;
  }

  return (
    <div className="weekly-weather">
      {weeklyWeather.map((day, index) => (
        <div key={index} className="day">
          <p>{new Date(day.date * 1000).toLocaleDateString()}</p>
          <p>{Math.round(day.temp)}°C</p>
          <img
            src={`http://openweathermap.org/img/wn/${day.icon}.png`}
            alt={day.description}
          />
          <p>{day.description}</p>
        </div>
      ))}
    </div>
  );
};

export default WeeklyWeather;
