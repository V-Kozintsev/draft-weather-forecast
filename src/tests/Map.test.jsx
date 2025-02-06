// Map.test.jsx
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Map } from "../components";

jest.mock(
  "ymaps3",
  () => ({
    ready: Promise.resolve(),
    YMap: jest.fn(() => ({
      setCenter: jest.fn(),
      addChild: jest.fn(),
      destroy: jest.fn(),
    })),
    YMapDefaultSchemeLayer: jest.fn(),
  }),
  { virtual: true }
);

describe("Map Component", () => {
  afterEach(cleanup);

  it("renders without crashing", () => {
    const { container } = render(<Map longitude={30} latitude={50} />);
    expect(container).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle(`width: 100%`);
  });
});
