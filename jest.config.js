export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  moduleNameMapper: {
    "^jquery$": "jquery"
  },
  setupFilesAfterEnv: ["./tests/setup.js"],
  moduleFileExtensions: ["js", "json", "jsx", "node"],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
