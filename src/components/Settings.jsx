import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setTheme,
  setUnits,
  setUsername,
} from "../features/weather/weatherSlice";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const themeFromStore = useSelector((state) => state.weather.theme);
  const unitsFromStore = useSelector((state) => state.weather.units);
  const usernameFromStore = useSelector((state) => state.weather.username); // Получаем текущее имя пользователя

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [theme, setThemeLocal] = useState(themeFromStore);
  const [units, setUnitsLocal] = useState(unitsFromStore);
  const [username, setUsernameLocal] = useState(usernameFromStore); // Локальное состояние для имени пользователя

  const handleThemeChange = (e) => {
    setThemeLocal(e.target.value);
  };

  const handleUnitsChange = (e) => {
    setUnitsLocal(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsernameLocal(e.target.value); // Обновляем локальное состояние имени
  };

  const handleSaveSettings = () => {
    dispatch(setTheme(theme));
    dispatch(setUnits(units));
    dispatch(setUsername(username)); // Сохраняем обновленное имя в Redux
    console.log("Настройки сохранены!");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div id="settings-page" className="settings-page">
      <h2>Настройки</h2>
      <div className="settings-group">
        <label htmlFor="theme-select">Тема:</label>
        <select id="theme-select" value={theme} onChange={handleThemeChange}>
          <option value="light">Светлая</option>
          <option value="dark">Темная</option>
        </select>
      </div>
      <div className="settings-group">
        <label htmlFor="units-select">Единицы измерения:</label>
        <select id="units-select" value={units} onChange={handleUnitsChange}>
          <option value="celsius">Цельсий</option>
          <option value="fahrenheit">Фаренгейт</option>
        </select>
      </div>
      <div className="settings-group">
        <label htmlFor="username-input">Имя пользователя:</label>
        <input
          id="username-input"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          className="input-username" // Применяем те же стили // Обновляем имя пользователя в локальном состоянии
        />
      </div>
      <button type="button" id="save-settings" onClick={handleSaveSettings}>
        Сохранить
      </button>
      <button type="button" id="home-button" onClick={handleGoHome}>
        На главную
      </button>
    </div>
  );
};

export default Settings;
