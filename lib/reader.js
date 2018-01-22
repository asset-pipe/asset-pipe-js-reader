'use strict';

const assert = require('assert');
const feedEntrypoint = require('./feed-entrypoint');
const unpackFeed = require('./unpack-feed');
const { join } = require('path');
const hashFeed = require('./hash-feed');
const tmp = require('tmp');
const { promisify } = require('util');
const directory = promisify(tmp.dir);
const Bundler = require('parcel-bundler');
const { outputFile, readFile } = require('fs-extra');

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

    const opts = {
        directory: await directory({ unsafeCleanup: true }),
        debug: false,
        ...options,
    };

    const requires = [];

    for (const feed of feeds) {
        const hash = await hashFeed(feed);
        const root = join(opts.directory, hash);

        await unpackFeed(root, feed);

        const entrypoint = feedEntrypoint(feed);
        requires.push(`require('${entrypoint.file}');`);
    }

    const entrypoint = join(opts.directory, 'entrypoint.js');
    const outDir = join(opts.directory, 'dist');

    // create temp entrypoint file
    await outputFile(entrypoint, requires.join('\n'));

    // bundle to outDir
    await new Bundler(entrypoint, {
        outDir,
        production: false,
        sourceMaps: true,
        minify: false,
        watch: false,
    }).bundle();

    // read bundle back in and return
    return readFile(join(outDir, 'entrypoint.js'), 'utf8');
};
