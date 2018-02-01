'use strict';

const mapDepNamesToPaths = require('../lib/map-dep-names-to-paths');

test('dependency map created for feed item with single dep', () => {
    const hashToFileMap = new Map([[1, '/common/one/index.js']]);
    const item = {
        id: 4,
        file: '/common/index.js',
        source: '',
        deps: { one: 1 },
    };

    const result = mapDepNamesToPaths(hashToFileMap, item);
    expect(result.get('one')).toBe('./one/index.js');
    expect(Array.from(result)).toHaveLength(1);
});

test('dependency map created for feed item with multiple deps', () => {
    const hashToFileMap = new Map([
        [1, '/common/one/index.js'],
        [2, '/common/two/index.js'],
        [3, '/common/three/index.js'],
    ]);
    const item = {
        id: 4,
        file: '/common/index.js',
        source: '',
        deps: { one: 1, two: 2, three: 3 },
    };

    const result = mapDepNamesToPaths(hashToFileMap, item);
    expect(result.get('one')).toBe('./one/index.js');
    expect(result.get('two')).toBe('./two/index.js');
    expect(result.get('three')).toBe('./three/index.js');
    expect(Array.from(result)).toHaveLength(3);
});

test('relative path dependencies ignored', () => {
    const hashToFileMap = new Map([
        [1, '/common/one/index.js'],
        [2, '/common/two/index.js'],
        [3, '/common/three/index.js'],
    ]);
    const item = {
        id: 4,
        file: '/common/index.js',
        source: '',
        deps: { './one': 2 },
    };

    const result = mapDepNamesToPaths(hashToFileMap, item);
    expect(result.has('./one')).toBe(false);
    expect(Array.from(result)).toHaveLength(0);
});

test('absolute path dependencies ignored', () => {
    const hashToFileMap = new Map([
        [1, '/common/one/index.js'],
        [2, '/common/two/index.js'],
        [3, '/common/three/index.js'],
    ]);
    const item = {
        id: 4,
        file: '/common/index.js',
        source: '',
        deps: { '/one': 2 },
    };

    const result = mapDepNamesToPaths(hashToFileMap, item);
    expect(result.has('/one')).toBe(false);
    expect(Array.from(result)).toHaveLength(0);
});
