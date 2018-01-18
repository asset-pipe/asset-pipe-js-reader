'use strict';

const bundleJS = require('../');
const path = require('path');
const Sink = require('@asset-pipe/sink-fs');
const prettier = require('prettier');
const vm = require('vm');

const SIMPLE_FEED_A_HASH =
    'c26fae70ab34dd08230cf2ec30dbc4ed70d1f6616f38f7b3101e6618c9d43ebf';
const SIMPLE_FEED_B_HASH =
    '5b54fc816e7c9157d5e6948b6a60cca9ddbb92b81e8d41fd085f74a15645c703';
const SIMPLE_FEED_C_HASH =
    '5128670188c99f2817fdef2293c0157d430e6b90324ee95a55dbb676e7d64d68';

const FEED_A_HASH = '9fab6ddd2a66a14b8b2ab6373fefa8987fabafb1';
const FEED_B_HASH = '9fab6ddd2a66a14b8b2ab6373fefa8987fabafb2';

function getExecutionOrder(bundle) {
    const lines = bundle.split('\n').filter(Boolean);
    const lastLine = lines[lines.length - 1];

    const order = lastLine.substring(
        lastLine.indexOf('['),
        lastLine.lastIndexOf(']') + 1
    );

    return JSON.parse(order);
}

test('should concat 3 files', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('simple.a.json'));
    const feedB = JSON.parse(await sink.get('simple.b.json'));
    const feedC = JSON.parse(await sink.get('simple.c.json'));

    const content = await bundleJS([feedA, feedB, feedC]);
    console.log(content);
    const executionOrder = getExecutionOrder(content);

    expect(executionOrder).toHaveLength(3);
    expect(executionOrder).toEqual([
        SIMPLE_FEED_A_HASH,
        SIMPLE_FEED_B_HASH,
        SIMPLE_FEED_C_HASH,
    ]);
    expect(prettier.format(content)).toMatchSnapshot();
});

test.skip('should concat 2 files', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.a.json'));
    const feedB = JSON.parse(await sink.get('feed.b.json'));

    const content = await bundleJS([feedA, feedB]);

    const executionOrder = getExecutionOrder(content);

    expect(executionOrder).toHaveLength(2);
    expect(executionOrder).toEqual([FEED_A_HASH, FEED_B_HASH]);
    expect(prettier.format(content)).toMatchSnapshot();
});

test('should concat 1 file', async () => {
    const sink = new Sink({ path: path.join(__dirname, 'mock') });

    const feedA = JSON.parse(await sink.get('feed.a.json'));

    const content = await bundleJS([feedA]);

    const executionOrder = getExecutionOrder(content);

    expect(executionOrder).toHaveLength(1);
    expect(executionOrder).toEqual([FEED_A_HASH]);
    expect(prettier.format(content)).toMatchSnapshot();
});

test('code reach 1 entry point', async () => {
    const result = await bundleJS([
        [
            {
                entry: true,
                id: 'a',
                source: 'spy(1234);',
            },
        ],
    ]);
    const spy = jest.fn();
    vm.runInNewContext(result, { spy });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls).toMatchSnapshot();
});

test('code reach 3 entry point', async () => {
    const result = await bundleJS([
        [
            {
                entry: true,
                id: 'a',
                source: 'spy("a");',
            },
        ],
        [
            {
                entry: true,
                id: 'b',
                source: 'spy("b");',
            },
        ],
        [
            {
                entry: true,
                id: 'c',
                source: 'spy("c");',
            },
        ],
    ]);
    const spy = jest.fn();
    vm.runInNewContext(result, { spy });
    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toMatchSnapshot();
});

test.skip('should exclude/dedupe common modules', async () => {
    const result = await bundleJS([
        [
            {
                entry: true,
                id: 'a',
                source: 'require("./c");spy("a");',
                deps: { './c': 'c' },
            },
            {
                id: 'c',
                source: 'spy("c");',
                deps: {},
            },
        ],
        [
            {
                entry: true,
                id: 'b',
                source: 'spy("b");',
            },
            {
                id: 'c',
                source: 'require("./c");spy("c");',
                deps: { './c': 'c' },
            },
        ],
    ]);
    const spy = jest.fn();
    vm.runInNewContext(result, { spy });

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy.mock.calls).toMatchSnapshot();
    expect(prettier.format(result)).toMatchSnapshot();
});

test('should error if no feed content', async () => {
    expect(bundleJS()).rejects.toMatchSnapshot();
    expect(bundleJS([])).rejects.toMatchSnapshot();
    expect(bundleJS([[]])).rejects.toMatchSnapshot();
    expect(bundleJS([[{}]])).rejects.toMatchSnapshot();
});

test('when deps dont match, should not dedupe', async () => {
    const SinkFs = require('@asset-pipe/sink-fs');
    const sink = new SinkFs({ path: `${__dirname}/mock` });
    const feedC = JSON.parse(await sink.get('feed.c.json'));
    const feedD = JSON.parse(await sink.get('feed.d.json'));

    const bundle = await bundleJS([feedC, feedD]);

    expect(bundle.match(/my module/g)).toHaveLength(2);
});

test.only('when deps do match, should dedupe', async () => {
    const SinkFs = require('@asset-pipe/sink-fs');
    const sink = new SinkFs({ path: `${__dirname}/mock` });
    const feedE = JSON.parse(await sink.get('feed.e.json'));
    const feedF = JSON.parse(await sink.get('feed.f.json'));

    const bundle = await bundleJS([feedE, feedF]);

    expect(bundle.match(/my module/g)).toHaveLength(1);
});
