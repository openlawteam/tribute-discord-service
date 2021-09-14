module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  setupFilesAfterEnv: [
    "<rootDir>/test/prismaMock.ts",
    "<rootDir>/test/setup.ts",
  ],
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/"],
};
