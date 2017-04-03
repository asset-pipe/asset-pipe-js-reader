'use strict';

const tap = require('tap');
const Reader = require('../'); // eslint-disable-line
const fs = require('fs');

tap.test('foo() - bar', (t) => {
    const feedA = fs.createReadStream('./test/mock/feed.a.json');
    const feedB = fs.createReadStream('./test/mock/feed.b.json');

    const reader = new Reader([feedA, feedB]);
//    reader.pipe(fs.createWriteStream('./browser.bundle.js'));

    t.equal(true, true);
    t.end();
});
