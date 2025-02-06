//setupTests.js
import "@testing-library/jest-dom";

import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

/* global.ymaps3 = {
  ready: Promise.resolve(),
  YMap: jest.fn(() => ({
    setCenter: jest.fn(),
    addChild: jest.fn(),
    destroy: jest.fn(),
  })),
  YMapDefaultSchemeLayer: jest.fn(),
};
 */
