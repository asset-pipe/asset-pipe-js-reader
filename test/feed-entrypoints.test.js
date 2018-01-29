'use strict';

const feedEntrypoint = require('../lib/feed-entrypoints');

test('determines entrypoint for simple feed', () => {
    const feed = [{ id: 1, file: '', source: '', deps: {}, entry: true }];

    expect(feedEntrypoint(feed)[0].id).toBe(1);
});

test('determines entrypoint for feed', () => {
    const feed = [
        { id: 1, file: '', source: '', deps: {} },
        { id: 2, file: '', source: '', deps: {} },
        { id: 3, file: '', source: '', deps: {}, entry: true },
        { id: 4, file: '', source: '', deps: {} },
    ];

    expect(feedEntrypoint(feed)[0].id).toBe(3);
});

test('determines entrypoint for feed with falsey entrypoint', () => {
    const feed = [
        { id: 1, file: '', source: '', deps: {}, entry: null },
        { id: 2, file: '', source: '', deps: {}, entry: true },
    ];

    expect(feedEntrypoint(feed)[0].id).toBe(2);
});

test('determines entrypoint for feed', () => {
    const feed = [
        { id: 1, file: '', source: '', deps: {} },
        { id: 2, file: '', source: '', deps: {} },
        { id: 3, file: '', source: '', deps: {}, entry: true },
        { id: 4, file: '', source: '', deps: {}, entry: true },
    ];

    expect(feedEntrypoint(feed)[0].id).toBe(3);
    expect(feedEntrypoint(feed)[1].id).toBe(4);
});
