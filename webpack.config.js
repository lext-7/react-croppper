const fs = require('fs')
const path = require('path')

module.exports = function (webpackConfig, env) {

    webpackConfig.entry = {
        "index": "./test/index.js"
    };

    // webpackConfig.babel.plugins.push('transform-runtime');

    webpackConfig.devtool = '#eval'
    // webpackConfig.babel.plugins.push(['dva-hmr', {
    //     entries: [
    //         './test/index.js',
    //     ],
    // }]);

    return webpackConfig;
};