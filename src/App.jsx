import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  About,
  History,
  Map,
  SearchForm,
  Settings,
  WeatherInfo,
} from "./components";
import {
  fetchWeatherByCoords,
  loadHistoryFromStorage,
  fetchWeatherByCity,
  setUsername,
} from "./features/weather/weatherSlice";
import { Link, useLocation, useParams } from "react-router-dom";
import packageJson from "../package.json";
import "./App.css";

const App = () => {
  const appVersion = packageJson.version;
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.weather.theme);
  const loading = useSelector((state) => state.weather.loading);
  const location = useLocation();
  const { city } = useParams();
  const history = useSelector((state) => state.weather.history);
  const weather = useSelector((state) => state.weather.weather);
  const username = useSelector((state) => state.weather.username);

  const [isFirstLoad, setIsFirstLoad] = useState(!username);
  const [usernameInput, setUsernameInput] = useState(username || "");

  useEffect(() => {
    dispatch(loadHistoryFromStorage());
    applyTheme(theme);
  }, [dispatch, theme]);

  useEffect(() => {
    localStorage.setItem("weatherHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (city) {
        dispatch(fetchWeatherByCity({ city: city, addToHistory: true }));
        localStorage.setItem("lastCity", city);
      } else {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const { latitude, longitude } = position.coords;
          dispatch(
            fetchWeatherByCoords({ latitude, longitude, addToHistory: false })
          );
          dispatch(fetchWeeklyWeatherByCoords({ latitude, longitude }));
        } catch (error) {
          const lastCity = localStorage.getItem("lastCity");
          if (lastCity) {
            dispatch(
              fetchWeatherByCity({ city: lastCity, addToHistory: true })
            );
          }
        }
      }
    };

    fetchWeather();
  }, [location, dispatch, city]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (theme) => {
    document.body.className = theme === "dark" ? "dark-theme" : "";
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      dispatch(setUsername(usernameInput.trim()));
      localStorage.setItem("username", usernameInput.trim());
      setIsFirstLoad(false);
    } else {
      alert("Имя не должно быть пустым!");
    }
  };

  if (isFirstLoad) {
    return (
      <div className="username-form">
        <form onSubmit={handleUsernameSubmit} className="form-container">
          <label>
            Введите ваше имя:
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
              className="input-username"
            />
          </label>
          <button type="submit" className="submit-button">
            Подтвердить
          </button>
        </form>
      </div>
    );
  }

  return (
    <div id="app">
      <h1>Добро пожаловать, {username || "Гость"}!</h1>
      <div className="button-wrapper">
        <Link to="/settings" className="button">
          Настройки
        </Link>
        <Link to="/about" className="button">
          О приложении
        </Link>
      </div>
      {loading ? (
        <div className="loader"></div>
      ) : location.pathname === "/settings" ? (
        <Settings />
      ) : location.pathname === "/about" ? (
        <About appVersion={appVersion} />
      ) : (
        <>
          <SearchForm />
          {weather && (
            <Map longitude={weather.longitude} latitude={weather.latitude} />
          )}
          <WeatherInfo />
          <History />
        </>
      )}
    </div>
  );
};

export default App;
