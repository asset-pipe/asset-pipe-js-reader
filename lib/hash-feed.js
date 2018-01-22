'use strict';

const { IdHasher } = require('asset-pipe-common');
const { Readable } = require('readable-stream');

/**
 * Hashes a feeds ids together
 *
 * @param {object[]} feed - browserify compatible bundle feed
 * @returns {Promise<string>} - hash of all id properties in given feed
 */
module.exports = function hashFeed(feed) {
    const source = new Readable({ objectMode: true, read() {} });
    const hasher = new IdHasher();

    source.pipe(hasher);

    return new Promise((resolve, reject) => {
        hasher.on('finish', () => {
            resolve(hasher.hash);
        });

        hasher.on('error', reject);

        for (const item of feed) {
            source.push(item);
        }
        source.push(null);
    });
};
