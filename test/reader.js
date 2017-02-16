'use strict';

const tap = require('tap');
const Writer = require('../'); // eslint-disable-line

tap.test('foo() - bar', (t) => {
//    var writer = new Writer('./test/mock/main.js');
//    writer.bundle().pipe(process.stdout);

    t.equal(true, true);
    t.end();
});
