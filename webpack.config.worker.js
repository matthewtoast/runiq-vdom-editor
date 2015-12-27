'use strict';

var path = require('path');

var config = {};

config.entry = './src/worker.js';

config.output = {
    path: 'demo',
    filename:'runiq-vdom-editor-worker.bundle.js'
};

config.module = {
    loaders: [
        { test: /\.json$/, loader: 'json-loader' }
    ]
};

config.resolveLoader = {
    root: path.join(__dirname, "node_modules")
};

module.exports = config;
