module.exports = {
    globals: {
        'ts-jest': {
            packageJson: 'package.json',
        },
    },
    "roots": [
        "<rootDir>/src",
        "<rootDir>/test",
    ],
    "testMatch": [
        "**/__tests__/**/*.+(ts)",
        "**/?(*.)+(spec|test).+(ts)"
    ],
    "transform": {
        "^.+\\.(ts)$": "ts-jest"
    },
};

