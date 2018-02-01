'use strict';

module.exports = function replaceRequireStatements(sourceCode, dependencyMap) {
    for (const dependency of dependencyMap.keys()) {
        // if relative or absolute path already then skip.
        if (['.', '/'].includes(dependency[0])) continue;

        sourceCode = sourceCode.replace(
            new RegExp(`require\\s*\\(\\s*['"]${dependency}['"]\\s*\\)`, 'g'),
            `require('${dependencyMap.get(dependency)}')`
        );
    }
    return sourceCode;
};
