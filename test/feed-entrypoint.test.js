'use strict';

const feedEntrypoint = require('../lib/feed-entrypoint');

test('should error if no feed content', async () => {
    const feed = require('./mock/feed.c.json');

    expect(feedEntrypoint(feed).id).toBe(
        '3c4ca5444d554f82cb15c2437ed545b2ea6f6a6e98476ec372b21b6cf7d8085a'
    );
});
