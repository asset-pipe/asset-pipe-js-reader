'use strict';

const replaceDependencies = require('../lib/replace-dependencies');

test('require statements correctly replaced - divergent paths', () => {
    const depMap = new Map([['my-dep', '/common/path/my-dep/index.js']]);
    const item = {
        deps: {
            'my-dep': 'we dont care what this value is',
        },
        file: '/common/path/another-dep/index.js',
        source: 'require("my-dep");',
    };

    const result = replaceDependencies(depMap, item);
    expect(result).toBe("require('../my-dep/index.js');");
});

test('require statements correctly replaced - nested dependency path', () => {
    const depMap = new Map([['my-dep', '/common/dep/path/index.js']]);
    const item = {
        deps: {
            'my-dep': 'we dont care what this value is',
        },
        file: '/common/index.js',
        source: 'require("my-dep");',
    };

    const result = replaceDependencies(depMap, item);
    expect(result).toBe("require('./dep/path/index.js');");
});

test('require statements correctly replaced - nested path -> parent path', () => {
    const depMap = new Map([['my-dep', '/common/index.js']]);
    const item = {
        deps: {
            'my-dep': 'we dont care what this value is',
        },
        file: '/common/dep/path/my-dep/index.js',
        source: 'require("my-dep");',
    };

    const result = replaceDependencies(depMap, item);
    expect(result).toBe("require('../../../index.js');");
});
