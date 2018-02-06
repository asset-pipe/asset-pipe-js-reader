'use strict';

const feedEntrypoints = require('./feed-entrypoints');
const unpackFeed = require('./unpack-feed');
const { join } = require('path');
const browserify = require('browserify');
const getStream = require('./get-stream');
const hashFeed = require('./hash-feed');
const { directory } = require('tempy');
const Joi = require('joi');
const feedSchema = require('./feed-schema');
const uglify = require('uglify-es');
const Boom = require('boom');
const assert = require('assert');
const envify = require('envify');

const DEFAULT_ENV = 'development';

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
        `Expected argument 'feeds' to be an array (of feed arrays).`
    );
    assert(
        feeds.length > 0,
        `Expected argument 'feeds' (array) to be contain at least 1 feed (array).`
    );
    assert(
        feeds[0].length > 0,
        'Expected at least 1 feed (array) to have more than one entry (object).'
    );
    [].concat(...feeds).forEach(feedItem => {
        const { error } = Joi.validate(feedItem, feedSchema);
        if (error)
            throw Boom.boomify(error, {
                message: `Expected every item in argument 'feeds' (array) to be a valid feed (object).`,
            });
    });

    const opts = {
        sourceMaps: false,
        minify: false,
        env: process.env.NODE_ENV || DEFAULT_ENV,
        ...options,
    };

    if (!opts.directory) {
        opts.directory = directory();
    }

    const entries = [];

    await Promise.all(
        feeds.map(async feed => {
            const root = join(opts.directory, await hashFeed(feed));
            const entrypoints = feedEntrypoints(feed);
            for (const entrypoint of entrypoints) {
                entries.push(join(root, entrypoint.file));
            }
            return unpackFeed(root, feed);
        })
    );

    const bundler = browserify({ entries, debug: opts.sourceMaps });

    bundler.transform(envify, {
        _: 'purge',
        NODE_ENV: opts.env,
    });

    let bundle = await getStream(bundler.bundle());

    if (opts.minify) {
        const sourceMap = opts.sourceMaps ? { url: 'inline' } : false;
        bundle = uglify.minify(bundle, { sourceMap }).code;
    }

    return bundle;
};
