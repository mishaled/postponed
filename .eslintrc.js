module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'simple-import-sort', 'eslint-plugin-import'],
    overrides: [
        {
            files: '*',
            rules: {
                'simple-import-sort/sort': 'off',
                'import/order': ['error', {'newlines-between': 'never'}],
            },
        },
    ],
};
