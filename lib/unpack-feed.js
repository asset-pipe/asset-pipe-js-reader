'use strict';

const { join } = require('path');
const { outputFile } = require('fs-extra');
const replaceDependencies = require('./replace-dependencies');
const mapFeedDependencies = require('./map-feed-dependencies');

/**
 * Unpacks a given feed's source code. Recreates the directory structure
 * of the code with the caveat that any references to modules in node_modules
 * are replaced with actual paths. (lodash becomes /path/to/lodash/index.js)
 *
 * @param {string} root - root directory path for where to unpack feed
 * @param {object[]} feed - browserify bundle feed
 */
module.exports = async function unpackFeed(root, feed) {
    const feedDependencies = mapFeedDependencies(feed);
    for (const item of feed) {
        const content = replaceDependencies(feedDependencies, item);
        await outputFile(join(root, item.file), content);
    }
};
