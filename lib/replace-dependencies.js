'use strict';

const { join } = require('path');

/**
 * Modify require statements based on a given depMap.
 *
 * @example
 * Given a depMap with entry lodash -> '/my/path'
 * require('lodash') will be changed to require('/my/path')
 *
 * @param {string} root - root path to be prepended to dep map values
 * @param {Map} depMap - map dependency name -> path
 * @param {object} item - object with key source containing javascript source code
 * @returns {Promise<string>} - source code with dependencies replaced
 */
module.exports = async function replaceDependencies(root, depMap, item) {
    const { deps } = item;
    let { source } = item;
    for (const dependency of Object.keys(deps)) {
        if (depMap.has(dependency)) {
            source = source.replace(
                new RegExp(
                    `require\\s*\\(\\s*['"]${dependency}['"]\\s*\\)`,
                    'g'
                ),
                `require('${join(root, depMap.get(dependency))}')`
            );
        }
    }
    return source;
};
