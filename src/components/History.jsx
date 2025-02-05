import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteHistory } from "../features/weather/weatherSlice";
import { useNavigate } from "react-router-dom";

const History = () => {
  const history = useSelector((state) => state.weather.history);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCityClick = (city) => {
    navigate(`/weather/${city}`);
  };

  const handleDeleteHistory = () => {
    dispatch(deleteHistory());
  };

  return (
    <div className="history">
      {history.length > 0 ? (
        history.map((item, index) => (
          <p key={index} onClick={() => handleCityClick(item.city)}>
            {`${item.city}: ${item.temp}°${item.units === "fahrenheit" ? "F" : "C"}`}
          </p>
        ))
      ) : (
        <p>История пуста</p>
      )}
      <button className="del-history-button" onClick={handleDeleteHistory}>
        Удалить историю
      </button>
    </div>
  );
};

export default History;
