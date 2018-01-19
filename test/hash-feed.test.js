'use strict';

const hashFeed = require('../lib/hash-feed');

test('returns hash of feeds ids', async () => {
    const feed = require('./mock/feed.c.json');

    expect(await hashFeed(feed)).toBe(
        '9a90297377683ac751b7178e1da9154cc44397e5c8062f9cddb83ee119d91cc9'
    );
});
