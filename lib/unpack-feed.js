'use strict';

const { join } = require('path');
const { outputFile } = require('fs-extra');
const mapHashToPath = require('./map-hash-to-path');
const mapDepNamesToPaths = require('./map-dep-names-to-paths');
const replaceRequireStatements = require('./replace-require-statements');

/**
 * Unpacks a given feed's source code. Recreates the directory structure
 * of the code with the caveat that any references to modules in node_modules
 * are replaced with actual paths. (lodash becomes /path/to/lodash/index.js)
 *
 * @param {string} root - root directory path for where to unpack feed
 * @param {object[]} feed - browserify bundle feed
 */
module.exports = async function unpackFeed(root, feed) {
    const hashToFile = mapHashToPath(feed);

    for (const item of feed) {
        const depToFileMap = mapDepNamesToPaths(hashToFile, item);
        const content = replaceRequireStatements(item.source, depToFileMap);
        await outputFile(join(root, item.file), content);
    }
};
