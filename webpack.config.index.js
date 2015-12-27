'use strict';

var config = {};

config.entry = './src/index.js';

config.output = {
    path: 'demo',
    filename:'index.bundle.js',
    library: 'RuniqEditor'
};

config.module = {
    loaders: [
        { test: /\.css$/, loader: 'style-loader!css-loader' },
        { test: /\.(html|rune)$/, loader: 'raw-loader' }
    ]
};

module.exports = config;
