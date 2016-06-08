"use strict";

const   stream      = require('readable-stream'),
        JSONStream  = require('JSONStream'),
        pack        = require('browser-pack'),
        mergeStream = require('merge-stream'),
        depsSort    = require('deps-sort'),
        assert      = require('assert'),
        pump        = require('pump');



const Reader = module.exports = function (streams) {

    if (!(this instanceof Reader)) return new Reader(streams);

    assert(streams, '"streams" must be provided');

    // let start = process.hrtime();

    let merged = mergeStream();
    streams.forEach((strm) => {
        merged.add(strm.pipe(JSONStream.parse('*')));
    });
    
    if (merged.isEmpty()) {
        // console.log('stream empty');
    }

    let sort = depsSort({dedupe: true});
    let packer = pack();

    return pump(merged, sort, JSONStream.stringify(), packer, (err) => {
        if (err) {
            console.log(err);
        }
        // let end = process.hrtime(start);
        // console.log("loading time:", end[0] + 'sec', end[1]/1000000 + 'ms');
    });
};
