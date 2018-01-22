'use strict';

const bundleJS = require('../lib/reader');
const path = require('path');
const Sink = require('@asset-pipe/sink-fs');
const prettier = require('prettier');
const { join } = require('path');
const { remove } = require('fs-extra');
const FOLDER = join(__dirname, 'test-assets-reader');
const vm = require('vm');

function getExecutionOrder(bundle) {
    const lines = bundle.split('\n').filter(Boolean);
    const lastLine = lines[lines.length - 1];

    const order = lastLine.substring(
        lastLine.indexOf('['),
        lastLine.lastIndexOf(']') + 1
    );

    return JSON.parse(order);
}

function clean(content) {
    return content.replace(/"\/.*\/asset-pipe-js-reader\//g, '"/');
}

beforeEach(() => remove(FOLDER));
afterAll(() => remove(FOLDER));

test.only('should provide source maps in debug', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.c.json'));
    const feedB = JSON.parse(await sink.get('feed.d.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
        debug: true,
    });

    expect(clean(prettier.format(content))).toMatchSnapshot();
});

test('should successfully bundle 2 feeds', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.c.json'));
    const feedB = JSON.parse(await sink.get('feed.d.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
    });

    expect(clean(prettier.format(content))).toMatchSnapshot();
});

test('should dedupe', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.e.json'));
    const feedB = JSON.parse(await sink.get('feed.f.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
    });

    expect(clean(prettier.format(content))).toMatchSnapshot();
});

test('should handle node_modules dependencies', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('simple.a.json'));
    const feedB = JSON.parse(await sink.get('simple.b.json'));
    const feedC = JSON.parse(await sink.get('simple.c.json'));

    const content = await bundleJS([feedA, feedB, feedC], {
        directory: FOLDER,
    });

    expect(clean(prettier.format(content))).toMatchSnapshot();
});

test('should concat 3 files', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('simple.a.json'));
    const feedB = JSON.parse(await sink.get('simple.b.json'));
    const feedC = JSON.parse(await sink.get('simple.c.json'));

    const content = await bundleJS([feedA, feedB, feedC], {
        directory: FOLDER,
    });
    const executionOrder = getExecutionOrder(content);

    expect(executionOrder).toHaveLength(3);
    expect(executionOrder).toEqual([10, 4, 19]);
    expect(clean(prettier.format(content))).toMatchSnapshot();
});

test('should concat 2 files', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.a.json'));
    const feedB = JSON.parse(await sink.get('feed.b.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
    });

    const executionOrder = getExecutionOrder(content);

    expect(executionOrder).toHaveLength(2);
    expect(executionOrder).toEqual([3, 9]);
    expect(clean(prettier.format(content))).toMatchSnapshot();
});

test('should concat 1 file', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.a.json'));

    const content = await bundleJS([feedA], {
        directory: FOLDER,
    });

    const executionOrder = getExecutionOrder(content);

    expect(executionOrder).toHaveLength(1);
    expect(executionOrder).toEqual([3]);
    expect(clean(prettier.format(content))).toMatchSnapshot();
});

test('code reaches single entry point', async () => {
    const result = await bundleJS(
        [
            [
                {
                    entry: true,
                    id: 'a',
                    file: '',
                    source: 'spy(1234);',
                    deps: {},
                },
            ],
        ],
        {
            directory: FOLDER,
        }
    );
    const spy = jest.fn();
    vm.runInNewContext(result, { spy });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toMatchSnapshot();
});

test('should error if no feed content', async () => {
    expect(bundleJS()).rejects.toMatchSnapshot();
    expect(bundleJS([])).rejects.toMatchSnapshot();
    expect(bundleJS([[]])).rejects.toMatchSnapshot();
});

test('code reaches 3 entry points', async () => {
    const result = await bundleJS(
        [
            [
                {
                    entry: true,
                    id: 'a',
                    source: 'spy("a");',
                    file: '',
                    deps: {},
                },
            ],
            [
                {
                    entry: true,
                    id: 'b',
                    source: 'spy("b");',
                    file: '',
                    deps: {},
                },
            ],
            [
                {
                    entry: true,
                    id: 'c',
                    source: 'spy("c");',
                    file: '',
                    deps: {},
                },
            ],
        ],
        {
            directory: FOLDER,
        }
    );
    const spy = jest.fn();
    vm.runInNewContext(result, { spy });

    expect(clean(prettier.format(result))).toMatchSnapshot();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toMatchSnapshot();
});

test('bundling dedupes common modules', async () => {
    const result = await bundleJS(
        [
            [
                {
                    entry: true,
                    id: 'a',
                    source: 'require("./c"); spy("a");',
                    deps: { './c': 'c' },
                    file: './a.js',
                },
                {
                    id: 'c',
                    source: 'spy("c");',
                    deps: {},
                    file: './c.js',
                },
            ],
            [
                {
                    entry: true,
                    id: 'b',
                    source: 'require("./c"); spy("b");',
                    deps: { './c': 'c' },
                    file: './b.js',
                },
                {
                    id: 'c',
                    source: 'spy("c");',
                    deps: {},
                    file: './c.js',
                },
            ],
        ],
        {
            directory: FOLDER,
        }
    );
    const spy = jest.fn();
    vm.runInNewContext(result, { spy });

    expect(clean(prettier.format(result))).toMatchSnapshot();
    expect(spy).toMatchSnapshot();
    expect(spy).toHaveBeenCalledTimes(4);
    expect(clean(prettier.format(result))).toMatchSnapshot();
});
