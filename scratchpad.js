const JSONStream = require('JSONStream');
const Writer = require('@asset-pipe/js-writer');
const fs = require('fs');
const babelify = require('babelify');

const writer1 = new Writer('./test/mock/podletA/entrypoint.js');
writer1.transform(babelify, { presets: ['env', 'react'] });
writer1.bundle().pipe(JSONStream.stringify()).pipe(fs.createWriteStream('./test/mock/feed.c.json'));

const writer2 = new Writer('./test/mock/podletB/entrypoint.js');
writer2.transform(babelify, { presets: ['env', 'react'] });
writer2.bundle().pipe(JSONStream.stringify()).pipe(fs.createWriteStream('./test/mock/feed.d.json'));
