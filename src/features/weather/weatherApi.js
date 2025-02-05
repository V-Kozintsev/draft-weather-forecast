// src/features/weather/weatherApi.js

export const fetchWeather = async (city) => {
  // Здесь должен быть код для выполнения API-запроса
  // и возврата данных о погоде
  // Пример (используйте ваш фактический API-запрос):
  const apiKey = "f7f0f48145544647b19130539240210"; // Замените на свой ключ API
  const url = `https://api.example.com/weather?q=${city}&appid=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return {
    city: data.name,
    temp: data.main.temp,
    units: "celsius", // или "fahrenheit" в зависимости от вашего API
    iconUrl: `http://example.com/icons/${data.weather[0].icon}.png`,
    windKph: data.wind.speed,
    humidity: data.main.humidity,
    longitude: data.coord.lon,
    latitude: data.coord.lat,
  };
};
