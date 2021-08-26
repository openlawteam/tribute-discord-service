module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: [
    "<rootDir>/test/prismaMock.ts",
    "<rootDir>/test/setup.ts",
  ],
  testPathIgnorePatterns: ["<rootDir>/dist/"],
};
