'use strict';

const { join, relative, dirname, basename } = require('path');

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
 * @returns {string} - source code with dependencies replaced
 */
module.exports = function replaceDependencies(root, depMap, item) {
    const { deps, file } = item;
    let { source } = item;
    for (const dependency of Object.keys(deps)) {
        if (depMap.has(dependency)) {
            const dependencyFile = join(root, depMap.get(dependency));
            const path = dirname(dependencyFile);
            const filename = basename(dependencyFile);
            const relativePath = relative(dirname(join(root, file)), path);
            const relativeDependency = join(relativePath, filename);

            source = source.replace(
                new RegExp(
                    `require\\s*\\(\\s*['"]${dependency}['"]\\s*\\)`,
                    'g'
                ),
                `require('${relativeDependency}')`
            );
        }
    }
    return source;
};
