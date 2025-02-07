import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (city.trim() !== "") {
      navigate(`/weather/${city.trim()}`);
      setCity("");
    }
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        className="input-city"
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
        placeholder="Введите название города"
      />
      <button className="btn-search" type="submit">
        Показать
      </button>
    </form>
  );
};

export default SearchForm;
