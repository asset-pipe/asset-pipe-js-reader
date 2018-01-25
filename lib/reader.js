'use strict';

const feedEntrypoint = require('./feed-entrypoint');
const unpackFeed = require('./unpack-feed');
const { join } = require('path');
const browserify = require('browserify');
const getStream = require('./get-stream');
const hashFeed = require('./hash-feed');
const { directory } = require('tempy');
const Joi = require('joi');
const feedSchema = require('./feed-schema');
const uglify = require('uglify-es');
const envify = require('envify');
const uglifyify = require('uglifyify');

/**
 * Unpacks given feeds into directory structure before
 * bundling everything together with browserify.
 *
 * @param {object[]} feeds - browserify compatible bundle feed
 * @param {object} options - { directory: '/path/to/temp/unpack/dir' }
 * @returns {Promise<string>} - promise resolves to a javascript bundle
 */
module.exports = async (feeds, options) => {
    Joi.assert(
        feeds,
        Joi.array()
            .items(feedSchema)
            .required(),
        `Expected argument 'feeds' to be an array of feeds.`
    );

    const opts = { sourceMaps: false, minify: false, ...options };

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

    const bundler = browserify({ entries, debug: opts.sourceMaps });

    let envifyOptions = { ...process.env, _: 'purge' };
    if (opts.minify) {
        envifyOptions = { ...envifyOptions, NODE_ENV: 'production' };
    }
    bundler.transform(envify, envifyOptions);

    if (opts.minify) {
        bundler.transform(uglifyify, { global: true });
    }

    let bundle = await getStream(bundler.bundle());

    if (opts.minify) {
        const sourceMap = opts.sourceMaps ? { url: 'inline' } : false;
        bundle = uglify.minify(bundle, { sourceMap }).code;
    }

    return bundle;
};
