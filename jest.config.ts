import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/", "<rootDir>/tests/"],
  moduleNameMapper: {
    "^@routes$": "<rootDir>/src/interfaces/api/routes/index.ts",
    "^@controllers$": "<rootDir>/src/interfaces/api/controllers/index.ts",
    "^@factories$": "<rootDir>/src/interfaces/api/factories/index.ts",
    "^@middlewares$": "<rootDir>/src/interfaces/api/middlewares/index.ts",
    "^@usecases$": "<rootDir>/src/domain/usecases/index.ts",
    "^@entities$": "<rootDir>/src/domain/entities/index.ts",
    "^@repositories-entities$": "<rootDir>/src/domain/repositories/index.ts",
    "^@database-entities$":
      "<rootDir>/src/infrastructure/database/entities/index.ts",
    "^@database-repositories$":
      "<rootDir>/src/infrastructure/repositories/index.ts",
    "^@database-connection$":
      "<rootDir>/src/infrastructure/repositories/connection/pg.ts",
    "^@dtos$": "<rootDir>/src/application/dtos/index.ts",
    "^@infra$": "<rootDir>/src/infrastructure/index.ts",
    "^@types$": "<rootDir>/src/utils/types/index.ts",
    "^@config/(.*)$": "<rootDir>/src/utils/shared/config/$1",
    "^@schemas$": "<rootDir>/src/utils/shared/schemas/index.ts",
    "^@parsers/(.*)$": "<rootDir>/src/utils/shared/parsers/$1",
    "^types$": "<rootDir>/src/utils/types/index.ts",
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/infrastructure/database/connection/**",
    "!src/index.ts",
    "!src/server.ts",
    "!src/main.ts",
  ],
  testMatch: ["**/*.spec.ts", "**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
};

export default config;
