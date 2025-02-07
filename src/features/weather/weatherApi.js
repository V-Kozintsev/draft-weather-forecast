// src/features/weather/weatherApi.js
export const fetchWeather = async (city) => {
  const apiKey = "f7f0f48145544647b19130539240210";
  const url = `https://api.example.com/weather?q=${city}&appid=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return {
    city: data.name,
    temp: data.main.temp,
    units: "celsius",
    iconUrl: `http://example.com/icons/${data.weather[0].icon}.png`,
    windKph: data.wind.speed,
    humidity: data.main.humidity,
    longitude: data.coord.lon,
    latitude: data.coord.lat,
  };
};
