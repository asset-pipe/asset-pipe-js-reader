'use strict';

const JSONStream = require('JSONStream');
const pack = require('browser-pack');
const mergeStream = require('merge-stream');
const stream = require('readable-stream');

// Ensure output order is the same as input order. The sorter only sorts the
// modules, not execution order. `order` is consumed by browserify's
// `browser-pack`. The feeds already have an order, but they are always `0` as
// each feed only have a single entrypoint.
class OrderDecorator extends stream.Transform {
    constructor (order) {
        super({
            objectMode: true,
        });

        this.order = order;
    }

    _transform (row, encoding, next) {
        if (row.entry === true) {
            row.order = this.order;
        }
        next(null, row);
    }
}

class SortAndDedupe extends stream.Transform {
    constructor () {
        super({
            objectMode: true,
        });

        this.rows = new Map();
    }

    _transform (row, encoding, next) {
        // FIXME: This is too simplistic. We have to handle the case of rows
        // having keys like `expose` set, and ensure the correct configuration
        // bubbles up
        if (!this.rows.has(row.id)) {
            this.rows.set(row.id, row);
        }
        next();
    }

    _flush (next) {
        Array
            .from(this.rows.values())
            .sort(compareId)
            .forEach(row => this.push(row));
        next();
    }
}

module.exports = class Reader extends pack {
    constructor (streams = []) {
        super({ raw: true });

        // Merge all file streams into one stream
        const merged = mergeStream();
        let count = 0;
        streams.forEach((strm, index) => {
            const orderDecorator = new OrderDecorator(index);

            strm.on('file found', (file) => {
                this.emit('file found', file);
                merged.add(strm.pipe(JSONStream.parse('*')).pipe(orderDecorator));
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
        const sortAndDedupe = new SortAndDedupe();
        merged
            .on('error', (error) => {
                this.emit('error', error);
            })
            .pipe(sortAndDedupe)
            .on('error', (error) => {
                this.emit('error', error);
            })
            .pipe(this);
    }
};

function compareId (a, b) {
    return a.id.localeCompare(b.id);
}
