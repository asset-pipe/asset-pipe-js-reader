'use strict';

const calculateRelativePath = require('../lib/calculate-relative-path');

test('divergent paths', () => {
    const feedItemPath = '/common/path/another-dep/index.js';
    const dependencyPath = '/common/path/my-dep/index.js';

    const result = calculateRelativePath(feedItemPath, dependencyPath);
    expect(result).toBe('./../my-dep/index.js');
});

test('nested dependency path', () => {
    const feedItemPath = '/common/index.js';
    const dependencyPath = '/common/dep/path/index.js';

    const result = calculateRelativePath(feedItemPath, dependencyPath);
    expect(result).toBe('./dep/path/index.js');
});

test('nested path -> parent path', () => {
    const feedItemPath = '/common/dep/path/my-dep/index.js';
    const dependencyPath = '/common/index.js';

    const result = calculateRelativePath(feedItemPath, dependencyPath);
    expect(result).toBe('./../../../index.js');
});
