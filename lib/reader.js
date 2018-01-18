'use strict';

const pack = require('browser-pack');
const getStream = require('get-stream');
const assert = require('assert');
const deepEqual = require('deep-equal');

function getId(row) {
    if (row.exposed) {
        return row.exposed;
    } else if (row.index === undefined) {
        return row.id;
    } else return row.index;
}

function getRows(feeds) {
    // const existMap = new Map();
    const hashes = {};
    const depList = {};
    const depHash = {};
    const visited = {};

    function sameDeps(a, b) {
        const keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) return false;

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const ka = a[k];
            const kb = b[k];
            const ha = depHash[ka];
            const hb = depHash[kb];
            const da = depList[ka];
            const db = depList[kb];

            if (ka === kb) continue;
            if (ha !== hb) return false;
            if (visited[da] && visited[db]) {
                if (!deepEqual(da, db)) return false;
            } else {
                visited[da] = true;
                visited[db] = true;
                if (!sameDeps(da, db)) return false;
            }
        }
        return true;
    }

    return feeds
        .reduce((acc, feed, order) => {
            feed.forEach(row => {
                const copy = { ...row };
                // add browserify.order and flatten
                delete copy.order;
                if (copy.entry === true) {
                    copy.order = order;
                }

                // populate hashes
                // row.hash = row.id;
                depList[row.id] = row.deps;
                depHash[row.id] = row.id;

                acc.push(copy);
            });
            return acc;
        }, [])
        .map(row => {
            assert(
                row,
                `Expected feed entry to be an object, got "${typeof row}"`
            );
            assert(
                row.id,
                `Expected feed entry to have an id, got "${row.id}"`
            );

            // if (existMap.has(row.id)) {
            //     // FIXME: This is too simplistic. We have to handle the case of rows
            //     // having keys like `expose` set, and ensure the correct configuration
            //     // bubbles up
            //     return false;
            // }
            // existMap.set(row.id, true);
            // return true;

            const dup = hashes[row.id];
            if (dup && sameDeps(depList[dup._id], row.deps)) {
                row.source = `module.exports=require(${JSON.stringify(
                    dup.id
                )})`;
                row.nomap = true;
            } else if (dup) {
                row.source = `arguments[4][${JSON.stringify(
                    dup.id
                )}][0].apply(exports,arguments)`;
            } else hashes[row.id] = { _id: row.id, id: getId(row) };
            return row;
        })
        .reverse();
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
