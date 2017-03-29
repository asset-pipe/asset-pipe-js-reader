'use strict';

const stream = require('readable-stream');
const isUndefined = require('lodash.isundefined');
const JSONStream = require('JSONStream');
const pack = require('browser-pack');
const mergeStream = require('merge-stream');
const depsSort = require('deps-sort');
const pump = require('pump');


module.exports = class Reader {
    constructor (streams = []) {
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
            objectMode: true,
            transform (obj, encoding, next) {
                if (!isUndefined(obj.order)) {
                    obj.order = order;
                    order += 1;
                }
                this.push(obj);
                next();
            },
        });


        const sort = depsSort({ dedupe: true });
        const packer = pack({ raw: true });

        return pump(merged, fixOrder, sort, packer, (error) => {
            if (error) {
                console.log(error);
            }
        });
    }
};
