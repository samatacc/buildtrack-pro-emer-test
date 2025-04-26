module.exports = {
  extends: [
    'next/core-web-vitals'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn',
    'semi': ['error', 'always'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'indent': ['warn', 2],
    'comma-dangle': ['warn', 'always-multiline'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  }
};
