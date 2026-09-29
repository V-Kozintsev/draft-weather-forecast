const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("atmosDesktop", {
  version: "2.1.0",
  getCompact: () => ipcRenderer.invoke("atmos:get-compact"),
  setCompact: (enabled) => ipcRenderer.send("atmos:set-compact", enabled === true),
  hide: () => ipcRenderer.send("atmos:hide"),
  updateWeather: (data) => ipcRenderer.send("atmos:weather-status", { city: data.city, temperature: data.temperature, description: data.description }),
  onCompact: (callback) => {
    const listener = (_event, enabled) => callback(enabled === true);
    ipcRenderer.on("atmos:compact-changed", listener);
    return () => ipcRenderer.removeListener("atmos:compact-changed", listener);
  },
});
