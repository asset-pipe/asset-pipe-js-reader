'use strict';

/**
 * Creates a map from dependency name to file path by going through
 * a feed and looking at each items `deps` and `file` properties.
 *
 * @param {object[]} feed - browserify compatible bundle feed
 * @returns {Map} - dep name -> dep path
 */
module.exports = function mapFeedDependencies(feed) {
    const hashToFile = new Map();
    const dependencyToHash = new Map();
    const dependencyToFile = new Map();

    for (const item of feed) {
        if (item.file) hashToFile.set(item.id, item.file);

        for (const [name, hash] of Object.entries(item.deps)) {
            if (['.', '/'].includes(name[0])) continue;
            dependencyToHash.set(name, hash);
        }
    }

    for (const [name, hash] of dependencyToHash.entries()) {
        if (hashToFile.has(hash)) {
            dependencyToFile.set(name, hashToFile.get(hash));
        }
    }

    return dependencyToFile;
};
