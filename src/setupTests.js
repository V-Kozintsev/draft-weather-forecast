import "@testing-library/jest-dom";

if (typeof TextEncoder === "undefined") {
  global.TextEncoder = (await import("text-encoding")).TextEncoder; // Используем import для TextEncoder
}
