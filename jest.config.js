export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  moduleNameMapper: {
    "^jquery$": "jquery"
  }
};
