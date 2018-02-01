'use strict';

const mapHashToPath = require('../lib/map-hash-to-path');

test('returns map of feed ids -> feed file paths', () => {
    const feed = require('./mock/feed.c.json');

    expect(Array.from(mapHashToPath(feed))).toMatchSnapshot();
});
