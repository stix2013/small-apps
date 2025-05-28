module.exports = {
    extends: [
        "plugin:jsdoc/recommended",
        "plugin:import/typescript",
        "@typescript-eslint/recommended",
    ],
    plugins: {
        "no-only-tests": require("eslint-plugin-no-only-tests"),
    },
    languageOptions: {
        globals: {
            NodeJS: true,
            $fetch: true,
        },
    },
    settings: {
        jsdoc: {
            ignoreInternal: true,
            tagNamePreference: {
                warning: "warning",
                note: "note",
            },
        },
    },
    rules: {
        "sort-imports": ["error", {
            ignoreDeclarationSort: true,
        }],
        "no-only-tests/no-only-tests": "error",
        "no-console": "off",
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/require-param-type": "off",
        "no-redeclare": "off",
        "@typescript-eslint/consistent-type-imports": ["error", {
            disallowTypeAnnotations: false,
        }],
        "@typescript-eslint/ban-ts-comment": ["error", {
            "ts-expect-error": "allow-with-description",
            "ts-ignore": true,
        }],
        "@typescript-eslint/prefer-ts-expect-error": "error",
        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],
    },
};
