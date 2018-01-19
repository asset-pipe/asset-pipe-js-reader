'use strict';

const mapFeedDependencies = require('../lib/map-feed-dependencies');

test('', async () => {
    const feed = require('./mock/simple.a.json');

    expect(Array.from(mapFeedDependencies(feed).entries())).toHaveLength(3);
});
