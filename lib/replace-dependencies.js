'use strict';

const { join } = require('path');

module.exports = async function replaceDependencies(
    root,
    feedDependencies,
    item
) {
    const { deps } = item;
    let { source } = item;
    for (const dependency of Object.keys(deps)) {
        if (feedDependencies.has(dependency)) {
            source = source.replace(
                new RegExp(
                    `require\\s*\\(\\s*['"]${dependency}['"]\\s*\\)`,
                    'g'
                ),
                `require('${join(root, feedDependencies.get(dependency))}')`
            );
        }
    }
    return source;
};
