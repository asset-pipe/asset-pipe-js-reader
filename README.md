# asset-pipe-js-reader

This is an internal module intended for use by other modules in the [asset-pipe project][asset-pipe].

This module can take one or multiple asset feed stream(s), as produced by the [asset-pipe-js-writer][asset-pipe-js-writer], and produced an executable javascript bundle for the browser.



## Data format

What we refere to as an asset feed is the internal data format used in [Browserify][browserify]. We
use the exact same data format as Browserify in the [asset-pipe project][asset-pipe].

When Browserify resolves [CommonJS modules][commonjs] each dependency will be read and transformed
into an object which looks something like this:

```json
{
    "id":"c645cf572a8f5acf8716e4846b408d3b1ca45c58",
    "source":"\"use strict\";module.exports.world=function(){return\"world\"};",
    "deps":{},
    "file":"./assets/js/bar.js"
}
```

Each such object is emitted on a stream for each dependency. This is the asset feed.



## Installation

```bash
$ npm install asset-pipe-js-writer
```


## Usage

Make an JavaScript bundle out of two asset feeds stored as JSON and save it as a file:

```js
const Reader = require('asset-pipe-js-reader');
const fs = require('fs');

const feedA = fs.createReadStream('./feed/a.json');
const feedB = fs.createReadStream('./feed/b.json');

const reader = new Reader([feedA, feedB]);
reader.pipe(fs.createWriteStream('./build/browser.bundle.js'));
```



## API

This module have the following API:

### constructor(streams)

Supported arguments are:

 * `streams` - Array - An Array of streams .

Returns a `Transform stream`.



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
