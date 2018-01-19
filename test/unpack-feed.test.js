'use strict';

const unpackFeed = require('../lib/unpack-feed');
const { join } = require('path');
const { remove, pathExists } = require('fs-extra');
const FOLDER = join(__dirname, 'test-assets-unpack-feeds');

beforeEach(() => remove(FOLDER));
afterAll(() => remove(FOLDER));

test('unpack folder successfully created', async () => {
    const feed = require('./mock/feed.c.json');

    await unpackFeed(FOLDER, feed);

    expect(await pathExists(FOLDER)).toBeTruthy();
});
