'use strict';

const assert = require('assert');
const feedEntrypoint = require('./feed-entrypoint');
const unpackFeed = require('./unpack-feed');
const { join } = require('path');
const browserify = require('browserify');
const getStream = require('get-stream');
const hashFeed = require('./hash-feed');
const { directory } = require('tempy');

/**
 * Unpacks given feeds into directory structure before
 * bundling everything together with browserify.
 *
 * @param {object[]} feeds - browserify compatible bundle feed
 * @param {object} options - { directory: '/path/to/temp/unpack/dir' }
 * @returns {Promise<string>} - promise resolves to a javascript bundle
 */
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

    const opts = { debug: false, ...options };

    if (!opts.directory) {
        opts.directory = directory();
    }

    const entries = [];

    await Promise.all(
        feeds.map(async feed => {
            const root = join(opts.directory, await hashFeed(feed));
            const entrypoint = feedEntrypoint(feed);
            entries.push(join(root, entrypoint.file));
            return unpackFeed(root, feed);
        })
    );

    return getStream(browserify({ entries, debug: opts.debug }).bundle());
};
