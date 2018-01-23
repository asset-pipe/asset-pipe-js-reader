'use strict';

module.exports = function getStream(stream) {
    const data = [];
    return new Promise((resolve, reject) => {
        stream.once('error', reject);
        stream.on('data', chunk => data.push(chunk));
        stream.on('end', () => resolve(data.join('')));
    });
};
