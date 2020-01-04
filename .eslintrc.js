module.exports = {
    "extends": "airbnb-base",
    "env": {
        "node": true,
        "mocha": true
    },
    "plugins": [
        "chai-friendly"
    ],
    "rules": {
        "indent": [
            "error",
            4,
            {
                "MemberExpression": 0
            }
        ],
        "quotes": [
            "error",
            "double"
        ],
        "arrow-parens": [
            "error",
            "always"
        ],
        "arrow-body-style": [
            "error",
            "always"
        ],
        "newline-per-chained-call": [
            "error"
        ],
        "comma-dangle": [
            "error",
            "never"
        ],
        "import/no-dynamic-require": [
            "off"
        ],
        "global-require": [
            "off"
        ],
        "brace-style": [
            "error",
            "1tbs", { "allowSingleLine": false }
        ],
        "no-unused-expressions": [
            "off"
        ],
        "chai-friendly/no-unused-expressions": [
            "error"
        ],
        "import/no-extraneous-dependencies": [
            "error",
            {
                "devDependencies": [
                    "test/**"
                ]
            }
        ]
    }
};