/* jshint node:true */
'use strict';

var _ = require('lodash');
var glob = require('glob');
//var logger = require('../utilities/logger');

// Load app configurations

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = _.extend(
    require('./env/all'),
    require('./env/' + env) || {}
);

// Get files by glob patterns
module.exports.getGlobbedFiles = function (globPatterns, removeRoot) {

    console.log(globPatterns);

    // For context switching
    var _this = this;

    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {

        globPatterns.forEach(function (globPattern) {
            output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
        });
    }
    else if (_.isString(globPatterns)) {

        console.log(globPatterns);

        globPatterns = 'public' + globPatterns;
        console.log(globPatterns);

        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        }
        else {

            var files = glob.sync(globPatterns);

            if (removeRoot) {

                files = files.map(function (file) {
                    return file.replace(removeRoot, '');
                });
            }

            output = _.union(output, files);
        }
    }

    return output;
};

// Get the modules JavaScript files
module.exports.getJavaScriptAssets = function (includeTests) {

    var output = this.getGlobbedFiles(this.app.jsFiles, 'public/');//.concat(this.assets.js),'public/');

    return output;
};

// Get the modules CSS files
module.exports.getCSSAssets = function () {

    var output = this.getGlobbedFiles(this.app.cssFiles, 'public/');//.concat(this.assets.css),'public/');
    console.log(output);
    return output;
};

//william TODO:
//module.exports.app = _.extend({
//        title: 'Traffic Bridge Admin',
//        description: 'Traffic Bridge Admin Description',
//        keywords: 'Traffic Bridge Admin, TBAdmin, Talent Partners'
//    }
//);
