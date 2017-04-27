'use strict';

const stream = require('readable-stream');
const isUndefined = require('lodash.isundefined');
const JSONStream = require('JSONStream');
const pack = require('browser-pack');
const mergeStream = require('merge-stream');
const depsSort = require('deps-sort');


/**
 *
 * We need to manipulate order in all bundles to make sure that the
 * order is an increased value accross all bundles.
 *
 */

class Order extends stream.Transform {
    constructor () {
        super({
            objectMode: true
        });
        this.order = 0;
    }

    _transform (obj, encoding, next) {
        if (!isUndefined(obj.order)) {
            obj.order = this.order;
            this.order += 1;
        }
        this.push(obj);
        next();
    }
}


module.exports = class Reader extends pack {
    constructor (streams = []) {
        super({ raw: true });

        // Merge all file streams into one stream
        const merged = mergeStream();
        streams.forEach((strm) => {
            strm.on('error', (error) => {
                this.emit('error', error);
            });
            strm.on('file found', () => {
                this.emit('file found');
                merged.add(strm.pipe(JSONStream.parse('*')));
            });
            strm.on('file not found', () => {
                this.emit('file not found');
            });
        });

        // If the merged file stream yelded empty, we can not continue
        setImmediate(() => {
            if (merged.isEmpty()) {
                return this.emit('pipeline empty');
            }
            this.emit('pipeline ready');
        });

        // Set up the pipeline
        const order = new Order();
        const sort = depsSort({ dedupe: true });

        merged.on('error', (error) => {
                  this.emit('error', error);
              })
              .pipe(order)
              .on('error', (error) => {
                  this.emit('error', error);
              })
              .pipe(sort)
              .on('error', (error) => {
                  this.emit('error', error);
              })
              .pipe(this);
    }
};
