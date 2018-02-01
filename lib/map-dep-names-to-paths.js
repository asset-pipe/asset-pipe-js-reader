'use strict';

const calculateRelativePath = require('./calculate-relative-path');

module.exports = function mapDepNamesToPaths(hashToFileMap, feedItem) {
    const { deps } = feedItem;
    const depToFileMap = new Map();
    for (const dependency of Object.keys(deps)) {
        if (['.', '/'].includes(dependency[0])) continue;
        const dependencyId = deps[dependency];
        const dependencyPath = hashToFileMap.get(dependencyId);
        const relativePath = calculateRelativePath(
            feedItem.file,
            dependencyPath
        );
        depToFileMap.set(dependency, relativePath);
    }
    return depToFileMap;
};
