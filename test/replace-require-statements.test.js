'use strict';

const replaceRequireStatements = require('../lib/replace-require-statements');

test('basic module replacement', async () => {
    const sourceCode = "require('my-dep')";
    const dependencyMap = new Map([['my-dep', './../some/file/path.js']]);

    expect(replaceRequireStatements(sourceCode, dependencyMap)).toBe(
        "require('./../some/file/path.js')"
    );
});

test('relative paths ignored', async () => {
    const sourceCode = "require('./my-dep')";
    const dependencyMap = new Map([['./my-dep', './../some/file/path.js']]);

    expect(replaceRequireStatements(sourceCode, dependencyMap)).toBe(
        "require('./my-dep')"
    );
});

test('absolute paths ignored', async () => {
    const sourceCode = "require('/my-dep')";
    const dependencyMap = new Map([['/my-dep', './../some/file/path.js']]);

    expect(replaceRequireStatements(sourceCode, dependencyMap)).toBe(
        "require('/my-dep')"
    );
});

test('namespaced paths work', async () => {
    const sourceCode = "require('@my-dep/dep')";
    const dependencyMap = new Map([['@my-dep/dep', './../some/file/path.js']]);

    expect(replaceRequireStatements(sourceCode, dependencyMap)).toBe(
        "require('./../some/file/path.js')"
    );
});
