'use strict';

module.exports = function mapHashToPath(feed) {
    const hashToFileMap = new Map();
    for (const item of feed) {
        hashToFileMap.set(item.id, item.file);
    }
    return hashToFileMap;
};
