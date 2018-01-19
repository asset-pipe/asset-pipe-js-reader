'use strict';

const mapFeedDependencies = require('../lib/map-feed-dependencies');

test('dependencies mapped from dep name to file path', async () => {
    const feed = [
        { id: 1, file: 'one', source: '', deps: { two: 2 } },
        { id: 2, file: 'two', source: '', deps: { three: 3 } },
        { id: 3, file: 'three', source: '', deps: { one: 1 } },
    ];

    expect(Array.from(mapFeedDependencies(feed).entries())).toHaveLength(3);
});

test('dependencies with relative or absolute paths ignored', async () => {
    const feed = [
        { id: 1, file: 'one', source: '', deps: { '/two': 2 } },
        { id: 2, file: 'two', source: '', deps: { './three': 3 } },
        { id: 3, file: 'three', source: '', deps: { one: 1 } },
    ];

    expect(Array.from(mapFeedDependencies(feed).entries())).toHaveLength(1);
});

test('empty file key is omitted', async () => {
    const feed = [
        { id: 1, file: null, source: '', deps: { two: 2 } },
        { id: 2, file: 'two', source: '', deps: { one: 1 } },
    ];

    expect(Array.from(mapFeedDependencies(feed).entries())).toHaveLength(1);
});

test('missing file key is omitted', async () => {
    const feed = [
        { id: 1, source: '', deps: { two: 2 } },
        { id: 2, file: 'two', source: '', deps: { one: 1 } },
    ];

    expect(Array.from(mapFeedDependencies(feed).entries())).toHaveLength(1);
});
