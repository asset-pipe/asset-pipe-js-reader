'use strict';

module.exports = function feedEntrypoint(feed) {
    for (const item of feed) {
        if (item.entry) return item;
    }
};
