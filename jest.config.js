module.exports = {
  clearMocks: true,
  coveragePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/test/"],
  preset: "ts-jest",
  setupFilesAfterEnv: [
    "<rootDir>/test/prismaMock.ts",
    "<rootDir>/test/setup.ts",
  ],
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/test/"],
};
