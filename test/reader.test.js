'use strict';

const { test } = require('ava');
const Reader = require('../');
const stream = require('stream');
const path = require('path');
const Sink = require('asset-pipe-sink-fs');
const getStream = require('get-stream');
const prettier = require('prettier');

function createSlowStream (sink, filePath, timeout = 1000) {
    const myStream = new stream.PassThrough();

    process.nextTick(() => myStream.emit('file found', filePath));

    setTimeout(() => {
        sink.reader(filePath).pipe(myStream);
    }, timeout);

    return myStream;
}

function getExecutionOrder (bundle) {
    const lines = bundle.split('\n').filter(Boolean);
    const lastLine = lines[lines.length - 1];

    const order = lastLine.substring(lastLine.indexOf('['), lastLine.lastIndexOf(']') + 1);

    return JSON.parse(order);
}

test.beforeEach((t) => {
    t.context.sink = new Sink({ path: path.join(__dirname, 'mock') });
});

test('should concat files', async (t) => {
    const { sink } = t.context;

    const feedA = sink.reader('simple.a.json');
    const feedB = sink.reader('simple.b.json');
    const feedC = sink.reader('simple.c.json');

    const reader = new Reader([feedA, feedB, feedC]);

    const pipeline = new Promise((resolve, reject) => {
        reader.on('pipeline empty', reject);
        reader.on('pipeline ready', resolve);
    });

    const [bundle] = await Promise.all([getStream(reader), pipeline]);

    const executionOrder = getExecutionOrder(bundle);

    t.deepEqual(executionOrder, [
        'c26fae70ab34dd08230cf2ec30dbc4ed70d1f6616f38f7b3101e6618c9d43ebf',
        '5b54fc816e7c9157d5e6948b6a60cca9ddbb92b81e8d41fd085f74a15645c703',
        '5128670188c99f2817fdef2293c0157d430e6b90324ee95a55dbb676e7d64d68',
    ]);
    t.snapshot(prettier.format(bundle));
});

test('should keep ordering even if slow', async (t) => {
    const { sink } = t.context;

    const feedA = createSlowStream(sink, 'simple.a.json');
    const feedB = sink.reader('simple.b.json');
    const feedC = sink.reader('simple.c.json');

    const reader = new Reader([feedA, feedB, feedC]);

    const pipeline = new Promise((resolve, reject) => {
        reader.on('pipeline empty', reject);
        reader.on('pipeline ready', resolve);
    });

    const [bundle] = await Promise.all([getStream(reader), pipeline]);

    const executionOrder = getExecutionOrder(bundle);

    t.deepEqual(executionOrder, [
        'c26fae70ab34dd08230cf2ec30dbc4ed70d1f6616f38f7b3101e6618c9d43ebf',
        '5b54fc816e7c9157d5e6948b6a60cca9ddbb92b81e8d41fd085f74a15645c703',
        '5128670188c99f2817fdef2293c0157d430e6b90324ee95a55dbb676e7d64d68',
    ]);
    t.snapshot(prettier.format(bundle));
});

test('should keep ordering if very slow', async (t) => {
    const { sink } = t.context;

    const feedA = createSlowStream(sink, 'simple.a.json', 500);
    const feedB = sink.reader('simple.b.json');
    const feedC = createSlowStream(sink, 'simple.c.json', 100);

    const reader = new Reader([feedA, feedB, feedC]);

    const pipeline = new Promise((resolve, reject) => {
        reader.on('pipeline empty', reject);
        reader.on('pipeline ready', resolve);
    });

    const [bundle] = await Promise.all([getStream(reader), pipeline]);

    const executionOrder = getExecutionOrder(bundle);

    t.deepEqual(executionOrder, [
        'c26fae70ab34dd08230cf2ec30dbc4ed70d1f6616f38f7b3101e6618c9d43ebf',
        '5b54fc816e7c9157d5e6948b6a60cca9ddbb92b81e8d41fd085f74a15645c703',
        '5128670188c99f2817fdef2293c0157d430e6b90324ee95a55dbb676e7d64d68',
    ]);
    t.snapshot(prettier.format(bundle));
});
