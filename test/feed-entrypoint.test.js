'use strict';

const feedEntrypoint = require('../lib/feed-entrypoint');

test('determines entrypoint for simple feed', () => {
    const feed = [{ id: 1, file: '', source: '', deps: {}, entry: true }];

    expect(feedEntrypoint(feed).id).toBe(1);
});

test('determines entrypoint for feed', () => {
    const feed = [
        { id: 1, file: '', source: '', deps: {} },
        { id: 2, file: '', source: '', deps: {} },
        { id: 3, file: '', source: '', deps: {}, entry: true },
        { id: 4, file: '', source: '', deps: {} },
    ];

    expect(feedEntrypoint(feed).id).toBe(3);
});

test('determines entrypoint for feed with falsey entrypoint', () => {
    const feed = [
        { id: 1, file: '', source: '', deps: {}, entry: null },
        { id: 2, file: '', source: '', deps: {}, entry: true },
    ];

    expect(feedEntrypoint(feed).id).toBe(2);
});
