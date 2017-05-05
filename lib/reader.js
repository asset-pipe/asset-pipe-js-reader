'use strict';

const JSONStream = require('JSONStream');
const pack = require('browser-pack');
const mergeStream = require('merge-stream');
const through = require('through2');

module.exports = class Reader extends pack {
    constructor (streams = []) {
        super({ raw: true });

        // Merge all file streams into one stream
        const merged = mergeStream();
        let count = 0;
        streams.forEach((strm, index) => {
            const orderDecorator = createOrderDecorator(index);

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
        merged
            .on('error', (error) => {
                this.emit('error', error);
            })
            .pipe(sortAndDedupe())
            .on('error', (error) => {
                this.emit('error', error);
            })
            .pipe(this);
    }
};

// Ensure output order is the same as input order. The sorter only sorts the
// modules, not execution order. `order` is consumed by browserify's
// `browser-pack`. The feeds already have an order, but they are always `0` as
// each feed only have a single entrypoint.
function createOrderDecorator (order) {
    return through.obj((row, enc, next) => {
        if (row.entry === true) {
            row.order = order;
        }
        next(null, row);
    });
}

function sortAndDedupe () {
    const rows = new Map();
    return through.obj(write, end);

    function write (row, enc, next) {
        // FIXME: This is too simplistic. We have to handle the case of rows
        // having keys like `expose` set, and ensure the correct configuration
        // bubbles up
        if (!rows.has(row.id)) {
            rows.set(row.id, row);
        }
        next();
    }

    function end (next) {
        Array
            .from(rows.values())
            .sort(compareId)
            .forEach(row => this.push(row));
        this.push(null);
        next();
    }
}

function compareId (a, b) {
    return a.id.localeCompare(b.id);
}
