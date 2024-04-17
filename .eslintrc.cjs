/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	env: {
		webextensions: true
	},
	parserOptions: {
		ecmaVersion: 'latest'
	},
	plugins: [
		'n',
		'vue',
		'import',
		'promise',
		'perfectionist',
		'@stylistic'
	],
	overrides: [
		{
			rules: { '@stylistic/indent': 'off' },
			files: ['*.vue']
		}
	],
	extends: [

		// Base ESLint recommended rules
		'eslint:recommended',

		// Node.js plugin recommended rules
		'plugin:n/recommended',

		// Vue 3 plugin recommended rules
		'plugin:vue/vue3-recommended',

		// Import plugin recommended rules
		'plugin:import/recommended',
		'plugin:import/typescript',

		// Promise plugin recommended rules
		'plugin:promise/recommended',

		// Perfectionist plugin recommended rules
		'plugin:perfectionist/recommended-line-length',

		// Vue-TypeScript configuration
		'@vue/eslint-config-typescript/recommended',

		// Standard recommended rules
		'standard',

		// Disable legacy rules
		'plugin:@stylistic/disable-legacy'
	],
	rules: {

		// Enforce Allman indentation style
		'@stylistic/brace-style': ['error', 'allman', { allowSingleLine: true }],

		// Enforce the usage of single quotes for strings
		'@stylistic/quotes': ['error', 'single', { avoidEscape: true }],

		// Enforce space between function name and parenthesis
		'@stylistic/space-before-function-paren': ['error', 'always'],

		// Disallow multiple empty lines
		'@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],

		// Enforce tabs for indentation
		'@stylistic/indent': ['error', 'tab', { SwitchCase: 1 }],

		// Enforce quotes around property names only when necessary
		'@stylistic/quote-props': ['error', 'as-needed'],

		// Enforce parentheses around arrow function arguments
		'@stylistic/arrow-parens': ['error', 'always'],

		// Disallow mixed spaces and tabs for indentation
		'@stylistic/no-mixed-spaces-and-tabs': 'error',

		// Disallow trailing commas
		'@stylistic/comma-dangle': ['error', 'never'],

		// Disallow newlines at the end of files
		'@stylistic/eol-last': ['error', 'never'],

		// Enforce semicolon usage
		'@stylistic/semi': ['error', 'always'],

		// Disallow unnecesary semicolons
		'@stylistic/no-extra-semi': 'error',

		// Vue: Enforce tabs for indentation in script tags
		'vue/script-indent': ['error', 'tab', { baseIndent: 1 }],

		// Vue: Enforce tabs for indentation in template tags
		'vue/html-indent': ['error', 'tab', { baseIndent: 1 }],

		// Vue: Disable multiline HTML elements content
		'vue/multiline-html-element-content-newline': 'off',

		// Vue: Use snake case for prop names
		'vue/prop-name-casing': ['error', 'snake_case'],

		// Vue: Disable multi word component names
		'vue/multi-word-component-names': 'off',

		// Disable sorting of vue attributes
		'perfectionist/sort-vue-attributes': 'off',

		// Disable class sorting rules
		'perfectionist/sort-classes': 'off',

		// Disable object sorting rules
		'perfectionist/sort-objects': 'off',

		// Warn on unused variables
		'@typescript-eslint/no-unused-vars': 'warn',

		// Disallow braces for single line blocks
		curly: ['error', 'multi-or-nest'],

		// Disable conflicting import rules
		'import/no-unresolved': 'off',
		'n/no-missing-import': 'off',

		// Disable unused variable rules
		'no-unused-vars': 'off',

		// Disable camelcase enforcement
		camelcase: 'off'
	}
};