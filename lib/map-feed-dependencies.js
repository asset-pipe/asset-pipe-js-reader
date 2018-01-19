'use strict';

module.exports = function mapFeedDependencies(feed) {
    const hashToFile = new Map();
    const dependencyToHash = new Map();
    const dependencyToFile = new Map();

    for (const item of feed) {
        hashToFile.set(item.id, item.file);

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
