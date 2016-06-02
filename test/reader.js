"use strict";

const   stream      = require('readable-stream'),
        request     = require('request'),
        UglifyJS 	= require("uglify-js"),
        reader 		= require('../');
        


var src = [
	request.get('http://127.0.0.1:7100/public/assets/main.json')

	];

var buffer = '';

var dest = new stream.Writable({
  write: function(chunk, encoding, next) {
    // console.log(chunk.toString());
    buffer += chunk.toString();
    next()
  }
});

dest.on('finish', () => {
  let start = process.hrtime();
  let result = UglifyJS.minify(buffer, {fromString: true, compress: false});
  let end = process.hrtime(start);
  console.log('minfied', result.code);
  console.log("minifying time:", end[0] + 'sec', end[1]/1000000 + 'ms');
});


reader(src).pipe(dest);
