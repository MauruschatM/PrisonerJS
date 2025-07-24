import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid/configs/typescript";
import importPlugin from "eslint-plugin-import";
import preferArrow from "eslint-plugin-prefer-arrow";
import { defineConfig } from "eslint/config";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
		plugins: { js },
		extends: ["js/recommended"],
	},
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
	},
	tseslint.configs.recommended,
	{
		files: ["**/*.{ts,tsx}"],
		...solid,
		plugins: {
			...solid.plugins,
			import: importPlugin,
			"prefer-arrow": preferArrow,
		},
		rules: {
			// SolidJS-specific rules
			"solid/reactivity": "warn",
			"solid/no-destructure": "error",
			"solid/jsx-no-duplicate-props": "error",
			"solid/jsx-no-script-url": "error",
			"solid/jsx-no-undef": "error",
			"solid/no-innerhtml": ["error", { allowStatic: true }],
			"solid/prefer-for": "warn",
			"solid/style-prop": ["error", { styleProps: ["style", "css"] }],

			// Import rules
			"import/order": [
				"error",
				{
					groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
					"newlines-between": "always",
					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
				},
			],
			"import/no-unused-modules": "warn",
			"import/no-duplicates": "error",

			// Arrow function preferences
			"prefer-arrow/prefer-arrow-functions": [
				"warn",
				{
					disallowPrototype: true,
					singleReturnOnly: false,
					classPropertiesAllowed: false,
				},
			],

			// General TypeScript/SolidJS best practices
			// "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			// "@typescript-eslint/no-explicit-any": "warn",
			// "@typescript-eslint/prefer-const": "error",
			// "no-console": ["warn", { allow: ["warn", "error"] }],
		},
	},
	{
		files: ["**/*.config.{js,ts,mjs}", "**/*.setup.{js,ts}", "**/vite.config.*"],
		rules: {
			"prefer-arrow/prefer-arrow-functions": "off",
			"@typescript-eslint/no-explicit-any": "off",
		},
	},
	{
		files: ["**/*.test.{js,ts,tsx}", "**/*.spec.{js,ts,tsx}"],
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"no-console": "off",
		},
	},
]);
