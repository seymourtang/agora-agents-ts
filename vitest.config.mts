import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        coverage: {
            provider: "v8",
            reporter: ["text", "json-summary", "html"],
            reportsDirectory: "./coverage",
            reportOnFailure: true,
            all: true,
            include: ["src/**/*.ts"],
            exclude: [
                "src/api/**",
                "src/Client.ts",
                "src/version.ts",
                "src/index.ts",
                "src/exports.ts",
            ],
        },
        projects: [
            {
                test: {
                    globals: true,
                    name: "unit",
                    environment: "node",
                    root: "./tests",
                    include: ["**/*.test.{js,ts,jsx,tsx}"],
                    exclude: ["wire/**"],
                    setupFiles: ["./setup.ts"],
                },
            },
            {
                test: {
                    globals: true,
                    name: "wire",
                    environment: "node",
                    root: "./tests/wire",
                    setupFiles: ["../setup.ts", "../mock-server/setup.ts"],
                },
            },
        ],
        passWithNoTests: true,
    },
});
