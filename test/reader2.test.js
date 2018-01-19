'use strict';

const bundleJS = require('../lib/reader2');
const path = require('path');
const Sink = require('@asset-pipe/sink-fs');
const prettier = require('prettier');
const { join } = require('path');
const { remove } = require('fs-extra');
const FOLDER = join(__dirname, 'test-assets-reader');

beforeEach(() => remove(FOLDER));
afterAll(() => remove(FOLDER));

test('should successfully bundle 2 feeds', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.c.json'));
    const feedB = JSON.parse(await sink.get('feed.d.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
    });

    expect(prettier.format(content)).toMatchSnapshot();
});

test('should dedupe', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.e.json'));
    const feedB = JSON.parse(await sink.get('feed.f.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
    });

    expect(prettier.format(content)).toMatchSnapshot();
});

test('should handle node_modules dependencies', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('simple.a.json'));
    const feedB = JSON.parse(await sink.get('simple.b.json'));
    const feedC = JSON.parse(await sink.get('simple.c.json'));

    const content = await bundleJS([feedA, feedB, feedC], {
        directory: FOLDER,
    });

    expect(prettier.format(content)).toMatchSnapshot();
});
