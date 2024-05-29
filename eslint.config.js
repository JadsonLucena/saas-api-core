import eslint from '@eslint/js';
import globals from "globals";
import jestPlugin from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ['./build/**', './node_modules/**', './coverage/**'],
  },
  eslint.configs.recommended,
  // ...tseslint.configs.recommended
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jest: jestPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      globals: {
        ...globals.node
      }
    },
    ignores: [
      'build/'
    ],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off'
    },
  },
  {
    // disable type-aware linting on JS files
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    // enable jest rules on test files
    files: ['test/**'],
    ...jestPlugin.configs['flat/recommended'],
  },
);