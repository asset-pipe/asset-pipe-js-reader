'use strict';

/**
 * Returns first entry point object for a given feed
 *
 * @param {object[]} feed - Browserify compatible bundle feed
 * @returns {object} - First entry in feed with property entry: true
 */
module.exports = function feedEntrypoint(feed) {
    for (const item of feed) {
        if (item.entry) return item;
    }
};
