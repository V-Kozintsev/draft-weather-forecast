import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const mockYMaps = {
  ready: Promise.resolve(),
  YMap: jest.fn(() => ({
    setCenter: jest.fn(),
    addChild: jest.fn(),
    destroy: jest.fn(),
  })),
  YMapDefaultSchemeLayer: jest.fn(),
};
jest.mock("ymaps3", () => mockYMaps, { virual: true });
