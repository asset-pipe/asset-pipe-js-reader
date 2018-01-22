# @asset-pipe/js-reader

[![Greenkeeper badge](https://badges.greenkeeper.io/asset-pipe/asset-pipe-js-reader.svg)](https://greenkeeper.io/)

This is an internal module intended for use by other modules in the [asset-pipe project][asset-pipe].

This takes one or more asset feeds, as produced by the [asset-pipe-js-writer][asset-pipe-js-writer], and produces an executable javascript bundle for the browser.

## Data format

What we refer to as asset feeds are arrays of objects in the internal data format used by [Browserify][browserify]. We
use this exact same data format throughout the [asset-pipe project][asset-pipe].

When Browserify resolves [CommonJS modules][commonjs] each dependency will be read and transformed
into an object which looks something like this:

```json
{
    "id": "c645cf572a8f5acf8716e4846b408d3b1ca45c58",
    "source":
        "\"use strict\";module.exports.world=function(){return\"world\"};",
    "deps": {},
    "file": "./assets/js/bar.js"
}
```

Each object is emitted on a stream for each dependency. This is the asset feed.

## Installation

```bash
$ npm install @asset-pipe/js-reader
```

## Usage

Make an JavaScript bundle out of two asset feeds stored on a filesystem:

```js
const bundleJS = require('@asset-pipe/js-reader');
const SinkFs = require('@asset-pipe/sink-fs');

const sink = new SinkFs({
    path: './assets'
});

try {
    const feedA = JSON.parse(await sink.get('a.json'));
    const feedB = JSON.parse(await sink.get('b.json'));
    const bundle = await bundleJS([feedA, feedB]);
} catch (e) {
    // handle errors
}
```

## API

This module have the following API:

### function(feeds, [options])

Supported arguments are:

* `feeds` - Array - An Array of feeds.
* `options` - Object - configuration. Currently only `directory` option is supported.
    * `options.directory` { directory: '/path/to/temp/directory' } Directory to use when unpacking feed files.

Returns a `string` of JavaScript code.

## License

The MIT License (MIT)

Copyright (c) 2017 - Trygve Lie - post@trygve-lie.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[commonjs]: https://nodejs.org/docs/latest/api/modules.html
[asset-pipe]: https://github.com/asset-pipe
[browserify]: https://github.com/substack/node-browserify
[asset-pipe-js-writer]: https://github.com/asset-pipe/asset-pipe-js-writer
