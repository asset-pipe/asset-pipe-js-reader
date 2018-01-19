'use strict';

const assert = require('assert');
const feedEntrypoint = require('./feed-entrypoint');
const unpackFeed = require('./unpack-feed');
const { join } = require('path');
const browserify = require('browserify');
const getStream = require('get-stream');
const hashFeed = require('./hash-feed');
const tmp = require('tmp');
const { promisify } = require('util');
const directory = promisify(tmp.dir);

module.exports = async (feeds, options) => {
    assert(
        Array.isArray(feeds),
        `Expected an array of feed arrays, got "${feeds}"`
    );
    assert(feeds.length > 0, 'Expected at least 1 feed');
    assert(
        feeds[0].length > 0,
        'Expected at least 1 feed with more than one entry'
    );

    const opts = {
        directory: await directory({ unsafeCleanup: true }),
        ...options,
    };

    const b = browserify();

    for (const feed of feeds) {
        const hash = await hashFeed(feed);
        const root = join(opts.directory, hash);

        await unpackFeed(root, feed);

        const entrypoint = feedEntrypoint(feed);
        b.add(join(root, entrypoint.file));
    }

    return getStream(b.bundle());
};
