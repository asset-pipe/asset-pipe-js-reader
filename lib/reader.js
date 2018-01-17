'use strict';

const pack = require('browser-pack');
const getStream = require('get-stream');
const assert = require('assert');

function getRows(feeds) {
    const existMap = new Map();
    return feeds
        .reduce((acc, feed, order) => {
            feed.forEach(row => {
                const copy = { ...row };
                // add browserify.order and flatten
                delete copy.order;
                if (copy.entry === true) {
                    copy.order = order;
                }
                acc.push(copy);
            });
            return acc;
        }, [])
        .filter(row => {
            assert(
                row,
                `Expected feed entry to be an object, got "${typeof row}"`
            );
            assert(
                row.id,
                `Expected feed entry to have an id, got "${row.id}"`
            );
            if (existMap.has(row.id)) {
                // FIXME: This is too simplistic. We have to handle the case of rows
                // having keys like `expose` set, and ensure the correct configuration
                // bubbles up
                return false;
            }
            existMap.set(row.id, true);
            return true;
        })
        .sort((a, b) => a.id.localeCompare(b.id));
}

module.exports = async feeds => {
    assert(
        Array.isArray(feeds),
        `Expected an array of feed arrays, got "${feeds}"`
    );
    assert(feeds.length > 0, 'Expected at least 1 feed');
    assert(
        feeds[0].length > 0,
        'Expected at least 1 feed with more than one entry'
    );

    const rows = getRows(feeds);

    const browserifyPack = pack({ raw: true });
    browserifyPack.pause();

    await rows.reduce((acc, row) => {
        acc.then(
            () =>
                new Promise(resolve => {
                    browserifyPack.write(row, null, resolve);
                })
        );
        return acc;
    }, Promise.resolve());

    browserifyPack.resume();
    browserifyPack.end();

    return getStream(browserifyPack);
};
