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

beforeEach(() => {
    jest.setTimeout(10000);
    return remove(FOLDER);
});
afterAll(() => remove(FOLDER));

test('source maps as an option', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.c.json'));
    const feedB = JSON.parse(await sink.get('feed.d.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
        sourceMaps: true,
    });

    expect(prettier.format(content)).toMatchSnapshot();
});

test('minification with uglify as an option', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.c.json'));
    const feedB = JSON.parse(await sink.get('feed.d.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
        minify: true,
    });

    expect(prettier.format(content)).toMatchSnapshot();
});

test('minification with uglify and sourceMaps as options', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.c.json'));
    const feedB = JSON.parse(await sink.get('feed.d.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
        minify: true,
        sourceMaps: true,
    });

    expect(prettier.format(content)).toMatchSnapshot();
});

test('should successfully bundle 2 feeds', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.c.json'));
    const feedB = JSON.parse(await sink.get('feed.d.json'));

    const content = await bundleJS([feedA, feedB], {
        directory: FOLDER,
    });

    expect(prettier.format(content)).toMatchSnapshot();
});

test('should successfully bundle 2 feeds when temp directory is used', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.c.json'));
    const feedB = JSON.parse(await sink.get('feed.d.json'));

    const content = await bundleJS([feedA, feedB]);

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
    expect(prettier.format(content)).toMatchSnapshot();
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
    expect(prettier.format(content)).toMatchSnapshot();
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
    expect(prettier.format(content)).toMatchSnapshot();
});

test('code reaches single entry point', async () => {
    const result = await bundleJS(
        [
            [
                {
                    entry: true,
                    id: 'a',
                    file: 'asdas.js',
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
    await expect(bundleJS()).rejects.toThrowErrorMatchingSnapshot();
    await expect(bundleJS([])).rejects.toThrowErrorMatchingSnapshot();
    await expect(bundleJS([[]])).rejects.toThrowErrorMatchingSnapshot();
});

test('should error if feed content is non object', async () => {
    await expect(
        bundleJS(['s1df3s1f2d3s1d2f3s.json'])
    ).rejects.toThrowErrorMatchingSnapshot();
});

test('should error if any feed content keys are missing', async () => {
    await expect(bundleJS([[{}]])).rejects.toThrowErrorMatchingSnapshot();
    await expect(
        bundleJS([[{ file: 'asd', deps: {}, id: 'a', entry: true }]])
    ).rejects.toThrowErrorMatchingSnapshot();
});

test('should not error if any feed contains extra content keys', async () => {
    await expect(
        bundleJS([
            [
                {
                    file: 'asd',
                    deps: {},
                    id: 'a',
                    entry: true,
                    source: '"use strict";',
                    somethingWeird: true,
                },
            ],
        ])
    ).resolves.toBeDefined();
});

test('should not error if feed source is an empty string', async () => {
    await expect(
        bundleJS([
            [
                {
                    file: 'asd',
                    deps: {},
                    id: 'a',
                    entry: true,
                    source: '',
                    somethingWeird: true,
                },
            ],
        ])
    ).resolves.toBeDefined();
});

test('should error if feed content does not contain at least 1 entrypoint', async () => {
    await expect(
        bundleJS([
            {
                id: 'a',
                file: 'asdas.js',
                source: 'spy(1234);',
                deps: {},
            },
        ])
    ).rejects.toThrowErrorMatchingSnapshot();
});

test('code reaches 3 entry points', async () => {
    const result = await bundleJS(
        [
            [
                {
                    entry: true,
                    id: 'a',
                    source: 'spy("a");',
                    file: 'asdas.js',
                    deps: {},
                },
            ],
            [
                {
                    entry: true,
                    id: 'b',
                    source: 'spy("b");',
                    file: 'asdas.js',
                    deps: {},
                },
            ],
            [
                {
                    entry: true,
                    id: 'c',
                    source: 'spy("c");',
                    file: 'asdas.js',
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

    expect(prettier.format(result)).toMatchSnapshot();
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

    expect(prettier.format(result)).toMatchSnapshot();
    expect(spy).toMatchSnapshot();
    expect(spy).toHaveBeenCalledTimes(4);
});

test('minified code runs as expected', async () => {
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
            minify: true,
        }
    );
    const spy = jest.fn();
    vm.runInNewContext(result, { spy });
    expect(prettier.format(result)).toMatchSnapshot();
    expect(spy).toMatchSnapshot();
    expect(spy).toHaveBeenCalledTimes(4);
});

test('multiple entrypoints in same feed supported', async () => {
    const result = await bundleJS(
        [
            [
                {
                    entry: true,
                    id: 'a',
                    source: 'spy("a");',
                    deps: {},
                    file: './a.js',
                },
                {
                    entry: true,
                    id: 'b',
                    source: 'spy("b");',
                    deps: {},
                    file: './c.js',
                },
            ],
            [
                {
                    entry: true,
                    id: 'c',
                    source: 'spy("c");',
                    deps: {},
                    file: './b.js',
                },
                {
                    entry: true,
                    id: 'd',
                    source: 'spy("d");',
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

    expect(prettier.format(result)).toMatchSnapshot();
    expect(spy).toMatchSnapshot();
    expect(spy).toHaveBeenCalledTimes(4);
});

test('should replace NODE_ENV with default of "development"', async () => {
    expect.hasAssertions();
    const env = process.env.NODE_ENV;
    delete process.env.NODE_ENV;
    const result = await bundleJS([
        [
            {
                id: 'a',
                entry: true,
                file: './asdas.js',
                source: 'console.log(process.env.NODE_ENV)',
                deps: {},
            },
        ],
    ]);
    expect(result).toMatch('development');
    expect(prettier.format(result)).toMatchSnapshot();
    process.env.NODE_ENV = env;
});

test('should replace NODE_ENV with process.env.NODE_ENV', async () => {
    expect.hasAssertions();
    const env = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const result = await bundleJS([
        [
            {
                id: 'a',
                entry: true,
                file: './asdas.js',
                source: 'console.log(process.env.NODE_ENV)',
                deps: {},
            },
        ],
    ]);
    expect(result).toMatch('production');
    expect(prettier.format(result)).toMatchSnapshot();
    process.env.NODE_ENV = env;
});

test('should replace NODE_ENV with given value', async () => {
    expect.hasAssertions();
    const result = await bundleJS(
        [
            [
                {
                    id: 'a',
                    entry: true,
                    file: './asdas.js',
                    source: 'console.log(process.env.NODE_ENV)',
                    deps: {},
                },
            ],
        ],
        { env: 'production' }
    );
    expect(result).toMatch('production');
    expect(prettier.format(result)).toMatchSnapshot();
});
