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
            objectMode: true,
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
        let count = 0;
        streams.forEach((strm) => {
            strm.on('file found', (file) => {
                this.emit('file found', file);
                merged.add(strm.pipe(JSONStream.parse('*')));
                count++;
                if (count === streams.length) {
                    if (merged.isEmpty()) {
                        this.emit('pipeline empty');
                    } else {
                        this.emit('pipeline ready');
                    }
                }
            });
            strm.on('file not found', (file) => {
                this.emit('file not found', file);
                count++;
                if (count === streams.length) {
                    if (merged.isEmpty()) {
                        this.emit('pipeline empty');
                    } else {
                        this.emit('pipeline ready');
                    }
                }
            });
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
