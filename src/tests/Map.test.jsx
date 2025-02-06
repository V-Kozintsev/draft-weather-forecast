// src/tests/Map.test.jsx
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Map } from "../components";

describe("Map Component", () => {
  afterEach(cleanup);

  beforeEach(() => {
    jest.spyOn(globalThis.console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders without crashing", () => {
    const { container } = render(<Map longitude={30} latitude={50} />);
    expect(container).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle(`width: 100%`);
  });
});
