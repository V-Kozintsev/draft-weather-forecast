//index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { HashRouter, Routes, Route } from "react-router-dom";

import store from "./store/store";
import * as YMap from "ymaps3";

const initializeYMap = async () => {
  await YMap.ready;
  ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="weather/:city" element={<App />} /> {}
          <Route path="*" element={<App />} /> {}
        </Routes>
      </HashRouter>
    </Provider>
  );
};

initializeYMap();
