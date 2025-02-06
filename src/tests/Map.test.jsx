// Map.test.jsx
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Map } from "../components";

describe("Map Component", () => {
  afterEach(cleanup);

  it("renders without crashing", () => {
    const { container } = render(<Map longitude={30} latitude={50} />);
    expect(container).toBeInTheDocument();
    expect(container.firstChild).toHaveStyle(`width: 100%`);
  });
});
