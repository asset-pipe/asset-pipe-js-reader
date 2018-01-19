'use strict';

const { join } = require('path');
const { outputFile } = require('fs-extra');
const replaceDependencies = require('./replace-dependencies');
const mapFeedDependencies = require('./map-feed-dependencies');

module.exports = async function unpackFeed(root, feed) {
    const feedDependencies = mapFeedDependencies(feed);
    for (const item of feed) {
        const content = await replaceDependencies(root, feedDependencies, item);
        await outputFile(join(root, item.file), content);
    }
};
