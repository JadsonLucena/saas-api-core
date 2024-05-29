import { pathsToModuleNameMapper } from 'ts-jest'
import tsconfig from './tsconfig.json' with {
	type: "json"
}

export default {
	verbose: true,
	preset: "ts-jest",
	testEnvironment: "node",
	collectCoverage: true,
	collectCoverageFrom: [
		"./src/**/*.ts"
	],
	coverageReporters: [
		"lcov",
		"text",
		"html"
	],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100
		}
	},
	moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/src/' }),
}
