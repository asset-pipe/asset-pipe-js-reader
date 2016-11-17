"use strict";

const   stream      = require('readable-stream'),
        isUndefined = require('lodash.isundefined'),
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

    const merged = mergeStream();
    streams.forEach((strm) => {
        merged.add(strm.pipe(JSONStream.parse('*')));
    });
    
    if (merged.isEmpty()) {
        // console.log('stream empty');
    }


    // we need to manipulate order in all bundles to make sure that the
    // order is an increased value accross all bundles. 
    let order = 0;
    const fixOrder = new stream.Transform({
        objectMode : true,
        transform: function (obj, encoding, next) {
            if (!isUndefined(obj.order)) {
                obj.order = order;
                order = order + 1;
            }            
            this.push(obj);
            next();
        }
    });


    const sort = depsSort({dedupe: true});
    const packer = pack({raw: true});

    return pump(merged, fixOrder, sort, packer, (error) => {
        if (error) {
            console.log(error);
        }
        // let end = process.hrtime(start);
        // console.log("loading time:", end[0] + 'sec', end[1]/1000000 + 'ms');
    });
};
