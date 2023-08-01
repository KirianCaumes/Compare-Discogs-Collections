module.exports = {
    env: {
        es6: true,
        jest: true,
    },
    extends: [
        'airbnb-base',
        'plugin:jsdoc/recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: [
        'jsdoc',
    ],
    reportUnusedDisableDirectives: true,
    rules: {
        indent: [
            'warn',
            4,
            {
                SwitchCase: 1,
            },
        ],
        semi: ['warn', 'never'],
        'jsdoc/require-jsdoc': ['warn', {
            checkConstructors: false,
            contexts: [
                'ClassDeclaration', 'FunctionDeclaration', 'MethodDefinition',
                { context: 'TSPropertySignature', inlineCommentBlock: true }],
        }],
        'jsdoc/require-description': ['warn', {
            checkConstructors: false,
            contexts: [
                'TSPropertySignature', 'ClassDeclaration', 'ArrowFunctionExpression', 'FunctionDeclaration', 'FunctionExpression', 'MethodDefinition',
            ],
        }],
        'jsdoc/require-param-description': ['warn', { contexts: ['any'] }],
        'jsdoc/require-param': ['warn', { checkDestructuredRoots: false }],
        'jsdoc/valid-types': ['off'],
        'jsdoc/no-undefined-types': ['error', { definedTypes: ['ApiCollectionResultType', 'ApiWantlistResultType', 'BodyType'] }],
        // 'capitalized-comments': ['warn', 'always'], // Not always usefull as it also fix comment with code
        'no-underscore-dangle': ['error', { allow: ['_id', '_attributes', '__value__', '_text'] }],
        curly: ['warn', 'multi', 'consistent'],
        'template-curly-spacing': 'off', // Issue: https://stackoverflow.com/questions/48391913/eslint-error-cannot-read-property-range-of-null
        'max-len': ['warn', { code: 160 }],
        'comma-dangle': ['warn', 'always-multiline'],
        'nonblock-statement-body-position': ['warn', 'below'],
        'arrow-parens': ['warn', 'as-needed'],
        'function-paren-newline': ['error', 'consistent'],
        'no-extra-boolean-cast': ['error', { enforceForLogicalOperands: true }],
        'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }], // Must be at the end
    },
}
