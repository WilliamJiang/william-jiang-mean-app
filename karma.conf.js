// Karma configuration
// Generated on Sat Jan 03 2015 13:35:22 GMT-0500 (Eastern Standard Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        //frameworks: ['mocha', 'chai', 'sinon-chai'],
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'public/vendor/jquery/dist/jquery.min.js',
            'public/vendor/angular/angular.js',
            'public/vendor/angular-resource/angular-resource.js',
            'public/vendor/angular-route/angular-route.min.js',
            'public/vendor/angular-mocks/angular-mocks.js',

            //william: add all of the dependencies:
            'public/vendor/angular-animate/angular-animate.min.js',
            'public/vendor/restangular/dist/restangular.js',
            'public/vendor/angular-moment/angular-moment.min.js',
            'public/vendor/angular-poller/angular-poller.min.js',
            'public/vendor/angular-bootstrap/ui-bootstrap.min.js',
            'public/vendor/angular-truncate/src/truncate.js',
            'public/vendor/ng-file-upload/angular-file-upload.min.js',
            'public/vendor/angular-svg-round-progressbar/build/roundProgress.min.js',
            'public/vendor/lodash/lodash.min.js',
            'public/vendor/toastr/toastr.min.js',

            'public/custom-vendor/annotator/1.2.9/annotator-full.1.2.9.js',
            'public/custom-vendor/annotator/1.2.9/js/jquery.dateFormat.js',
            'public/custom-vendor/annotator/1.2.9/js/jquery.slimscroll.js',
            'public/custom-vendor/annotator/1.2.9/plugins/SideViewer.js',
            'public/custom-vendor/annotator/1.2.9/plugins/Categories.js',
            'public/custom-vendor/annotator/1.2.9/plugins/AnnotatorMarker.js',
            'public/custom-vendor/annotator/plugins/message-plugin.js',
            'public/custom-vendor/annotorious/annotorious.okfn.custom.js',
            'public/custom-vendor/xml2json/xml2json.js',

            'public/custom-vendor/pdfjs/build/pdf_js.js',
            'public/custom-vendor/pdfjs/web/compatibility.js',
            'public/custom-vendor/pdfjs/web/textlayerbuilder.js',


            //william: more afterwards.
            'public/vendor/angular-deferred-bootstrap/angular-deferred-bootstrap.min.js',
            'public/app/app.js',
            'public/app/**/*.module.js',
            'public/app/**/*.js',
            //'test/tests/account/test-app.js',
            //'test/tests/**/*.js',
            'test/spec/**/*spec.js'
        ],


        // list of files to exclude
        exclude: [
            //'public/app/app.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        //browsers: ['Chrome'],

        captureTimeout: 6000,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
