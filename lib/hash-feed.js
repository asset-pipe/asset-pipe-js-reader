'use strict';

const { IdHasher } = require('asset-pipe-common');
const { Readable } = require('readable-stream');

module.exports = function hashFeed(feed) {
    const source = new Readable({ objectMode: true, read() {} });
    const hasher = new IdHasher();

    source.pipe(hasher);

    return new Promise(resolve => {
        hasher.on('finish', () => {
            resolve(hasher.hash);
        });

        for (const item of feed) {
            source.push(item);
        }
        source.push(null);
    });
};
