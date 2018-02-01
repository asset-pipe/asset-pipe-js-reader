'use strict';

const { join, relative, dirname, basename } = require('path');

module.exports = function calculateRelativePath(feedItemPath, dependencyPath) {
    const path = dirname(dependencyPath);
    const filename = basename(dependencyPath);
    const relativePath = relative(dirname(feedItemPath), path);
    return `./${join(relativePath, filename)}`;
};
