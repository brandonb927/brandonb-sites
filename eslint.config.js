export default [
  {
    ignores: ['*/_pages/sw.js'],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
      },
    },
    files: ['*/_assets/scripts/**/*.js'],
  },
]
