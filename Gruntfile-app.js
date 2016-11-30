/**
 * William from 06/12/2015:
 * 1. some app js files are updated to make minify works (fix injector, jshint issues)
 * 2. add grunt-cache-bust: Bust static assets from the cache using content hashing.
 * 3. add registerTask('build', fn) etc to archive the minified resources.
 */

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    // Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    var watchFiles = {
        serverViews: ['server/views/**/*.*'],
        serverJS: ['gruntfile-app.js', 'server.js', 'server/**/*.js'],
        clientViews: ['public/app/**/*.html'],
        clientJS: [
            'public/app/tc/tc.module.js',
            'public/app/cc/cc.module.js',
            'public/app/main/main.module.js',
            'public/app/common/common.module.js',
            'public/app/profile/profile.module.js',
            'public/app/login/login.module.js',
            'public/app/filters/pageOffsetFilter.js',
            'public/app/directives/dateValidator.js',
            ///
            'public/app/app.js',
            //'public/app/main/MainCtrl.js',
            //'public/app/main/DebugCtrl.js',
            //'public/app/login/LoginCtrl.js',
            //'public/app/login/ForgotCredentialsCtrl.js',
            //'public/app/account/mvIdentity.js',
            //'public/app/services/AuthService.js',
            //'public/app/services/CIPollerService.js',
            //'public/app/services/CICountsPollerService.js',
            //'public/app/services/DataService.js',
            //'public/app/services/NotifierService.js',
            //'public/app/services/UploadService.js',
            /////
            //'public/app/services/UtilsService.js',
            //'public/app/services/FilterService.js',
            //'public/app/common/ApplicationCtrl.js',
            //'public/app/profile/ProfileCtrl.js',
            //'public/app/directives/filters_directive.js',
            //'public/app/directives/zoom_directive.js',
            //'public/app/directives/pdf_view_directive.js',
            //'public/app/directives/daterange/daterange_directive.js',
            //'public/app/tc/TrafficCoordinatorLeftNavCtrl.js',
            //'public/app/tc/TrafficCoordinatorHomeCtrl.js',
            //'public/app/tc/TrafficCoordinatorCICtrl.js',
            //'public/app/tc/TrafficCoordinatorLibraryCtrl.js',
            //'public/app/tc/TrafficCoordinatorAddCICtrl.js',
            //'public/app/tc/TrafficCoordinatorCIViewCtrl.js',
            //'public/app/cc/ci/CopyCoordinatorCIModalCtrl.js',
            //'public/app/cc/ci/CopyCoordinatorCIEditMetadataCtrl.js',
            //'public/app/cc/ci/CIRevisionsCtrl.js',
            //'public/app/cc/ci/UploadDocumentCtrl.js',
            //'public/app/cc/ci/NewCICtrl.js',
            //'public/app/cc/ci/PossibleRevisionCICtrl.js',
            //'public/app/cc/ci/UnstapleReasonCtrl.js',
            //'public/app/cc/CopyCoordinatorQueueCtrl.js',
            /////
            //'public/app/cc/CopyCoordinatorLeftNavCtrl.js',
            //'public/app/cc/CopyCoordinatorHomeCtrl.js',
            //'public/app/cc/CopyCoordinatorArchiveCtrl.js',
            //'public/app/cc/CopyCoordinatorLibraryCtrl.js',
            //'public/app/cc/SaveSearchCtrl.js',
            //'public/app/cc/DeleteSearchCtrl.js',
            //'public/app/cc/CopyCoordinatorParkingLotCtrl.js',
            //'public/app/cc/CopyCoordinatorCICtrl.js',
            //'public/app/cc/CopyCoordinatorImportUCRCtrl.js',
            //'public/app/cc/CopyCoordinatorCIHistoryCtrl.js',
            //'public/app/models/CI.js',
            //'public/app/filters/stringFilters.js',
            //'public/app/directives/annotation/viewAllAnnotations.js'
        ],
        clientJS1: [
            'public/app/main/MainCtrl.js',
            'public/app/main/DebugCtrl.js',
            'public/app/login/LoginCtrl.js',
            'public/app/login/ForgotCredentialsCtrl.js',
            'public/app/account/mvIdentity.js',
            'public/app/services/AuthService.js',
            'public/app/services/CIPollerService.js',
            'public/app/services/CICountsPollerService.js',
            'public/app/services/DataService.js',
            'public/app/services/NotifierService.js',
            'public/app/services/UploadService.js',
            ///
            'public/app/services/UtilsService.js',
            'public/app/services/FilterService.js',
            'public/app/common/ApplicationCtrl.js',
            'public/app/profile/ProfileCtrl.js',
            'public/app/directives/filters_directive.js',
            'public/app/directives/zoom_directive.js',
            'public/app/directives/pdf_view_directive.js',
            'public/app/directives/daterange/daterange_directive.js',
            'public/app/tc/TrafficCoordinatorLeftNavCtrl.js',
            /////////
            'public/app/tc/TrafficCoordinatorHomeCtrl.js',
            'public/app/tc/TrafficCoordinatorCICtrl.js',
            'public/app/tc/TrafficCoordinatorLibraryCtrl.js',
            'public/app/tc/TrafficCoordinatorAddCICtrl.js',
            'public/app/tc/TrafficCoordinatorCIViewCtrl.js',
            'public/app/cc/ci/CopyCoordinatorCIModalCtrl.js',
            'public/app/cc/ci/CopyCoordinatorCIEditMetadataCtrl.js',
            'public/app/cc/ci/CIRevisionsCtrl.js',
            'public/app/cc/ci/UploadDocumentCtrl.js',
            'public/app/cc/ci/NewCICtrl.js',
            'public/app/cc/ci/PossibleRevisionCICtrl.js',
            'public/app/cc/ci/UnstapleReasonCtrl.js',
            'public/app/cc/CopyCoordinatorQueueCtrl.js',
            ///
            'public/app/cc/CopyCoordinatorLeftNavCtrl.js',
            'public/app/cc/CopyCoordinatorHomeCtrl.js',
            'public/app/cc/CopyCoordinatorArchiveCtrl.js',
            'public/app/cc/CopyCoordinatorLibraryCtrl.js',
            'public/app/cc/SaveSearchCtrl.js',
            'public/app/cc/DeleteSearchCtrl.js',
            'public/app/cc/CopyCoordinatorParkingLotCtrl.js',
            'public/app/cc/CopyCoordinatorCICtrl.js',
            'public/app/cc/CopyCoordinatorImportUCRCtrl.js',
            'public/app/cc/CopyCoordinatorCIHistoryCtrl.js',
            'public/app/models/CI.js',
            'public/app/filters/stringFilters.js',
            'public/app/directives/annotation/viewAllAnnotations.js'

        ],
        clientExtJS: [
            'public/vendor/angular-truncate/src/truncate.js',
            'public/custom-vendor/multi-select/isteven-multi-select.js',
            'public/custom-vendor/multi-select/advertiser-multi-select.js',
            'public/custom-vendor/annotator/1.2.9/annotator-full.1.2.9.js',
            'public/custom-vendor/annotator/1.2.9/js/jquery.dateFormat.js',
            'public/custom-vendor/annotator/1.2.9/js/jquery.slimscroll.js',
            'public/custom-vendor/annotator/1.2.9/plugins/SideViewer.js',
            'public/custom-vendor/annotator/1.2.9/plugins/Categories.js',
            'public/custom-vendor/annotator/1.2.9/plugins/AnnotatorMarker.js',
            'public/custom-vendor/annotator/1.2.9/plugins/AnnotationStore.js',
            'public/custom-vendor/annotator/plugins/message-plugin.js',
            'public/custom-vendor/annotorious/annotorious.okfn.custom.js',
            'public/custom-vendor/xml2json/xml2json.js',
            'public/custom-vendor/pdfjs/build/pdf_js.js',
            'public/custom-vendor/pdfjs/web/compatibility.js',
            'public/custom-vendor/pdfjs/web/textlayerbuilder.js',
            'public/custom-vendor/bootstrap-daterangepicker/daterangepicker.js',
            'public/custom-vendor/node-uuid/uuid.js',
            'public/scripts/dropdowns-enhancement.js',
            'public/scripts/jquery.mousewheel.js',
            'public/scripts/jquery.jscrollpane.js',
            'public/scripts/main.js',
            'public/scripts/home.js',
            'public/scripts/library.js',
            'public/scripts/compare.js',
            'public/scripts/dropdowns-enhancement.js'
        ],
        clientCSS: [
            'public/vendor/ngprogress/ngProgress.css',
            'public/custom-vendor/multi-select/isteven-multi-select.css',
            'public/custom-vendor/annotator/1.2.9/css/annotator.css',
            'public/custom-vendor/annotator/1.2.9/css/style.css',
            'public/custom-vendor/annotorious/css/annotorious.css',
            'public/custom-vendor/bootstrap-daterangepicker/daterangepicker-bs3.css',
            'public/css/**/*.css'
        ],
        mochaTests: ['test/**/*.js']
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        express: {
            dev: {
                options: {
                    script: 'server.js',
                    debug: true
                }
            },
            qa: {
                options: {
                    script: 'public/app/dist/server.js',
                    node_env: 'qa'
                }
            },
            prod: {
                options: {
                    script: "public/app/dist/server.js",
                    "node_env": "production"
                }
            }
        },
        watch: {
            serverViews: {
                files: watchFiles.serverViews,
                options: {
                    livereload: true
                }
            },
            serverJS: {
                files: watchFiles.serverJS,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            clientViews: {
                files: watchFiles.clientViews,
                options: {
                    livereload: true
                }
            },
            clientJS: {
                files: watchFiles.clientJS,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            clientExtJS: {
                files: watchFiles.clientExtJS,
                options: {
                    livereload: true
                }
            },
            clientCSS: {
                files: watchFiles.clientCSS,
                tasks: ['csslint'],
                options: {
                    livereload: true
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        'public/app/dist/app.min.css',
                        'public/app/dist/app.min.js',
                        'public/app/dist/sourcemap.map'
                    ]
                }]
            }
        },
        jshint: {
            // TODO: current js still has many warnings, so ignore at this time.
            //options: {
            //    jshinitrc: '.jshintrc'
            //},
            //all: [
            //    'public/app/**/*.js'
            //]
        },
        csslint: {
            // TODO: fix the existed css warings when grunt csslint.
            //options: {
            //    csslintrc: '.csslintrc'
            //},
            //all: [
            //    'public/css/**/*.css'
            //]
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    nodeArgs: ['--debug'],
                    ext: 'js,html',
                    watch: watchFiles.serverViews.concat(watchFiles.serverJS)
                }
            }
        },
        concurrent: {
            default: ['nodemon', 'watch'],
            debug: ['nodemon', 'watch', /*'node-inspector'/*/],
            options: {
                logConcurrentOutput: true,
                limit: 10
            }
        },
        shell: {
            options: {
                stdout: true
            },
            npm_install: {
                command: 'npm install'
            },
            bower_install: {
                command: './node_modules/.bin/bower install'
            },
            font_awesome_fonts: {
                command: 'cp -R bower_components/components-font-awesome/font app/font'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                //autoWatch: false,
                singleRun: true,
                browsers: ["PhantomJS"]
            }
        },
        concat: {
            styles: {
                dest: 'public/app/dist/app.css',
                src: [
                    'public/css/**/*.css'
                ]
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'public/app/dist/app.min.css': [
                        watchFiles.clientCSS
                    ]
                }
            }
        },
        uglify: {
            all: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/app/dist/sourcemap.map'
                },
                files: {
                    'public/app/dist/app.min.js': [
                        //watchFiles.clientExtJS,
                        watchFiles.clientJS
                    ],
                    'public/app/dist/app1.min.js': [
                        watchFiles.clientJS1
                    ]
                }
            }
        },
        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16,
                deleteOriginals: true
            },
            assets: {
                files: [{
                    src: ['index.html']
                }]
            }
        }
    });

    //grunt.registerTask('test', ['connect:testserver','karma:unit','karma:midway', 'karma:e2e']);
    grunt.registerTask('test:unit', ['karma:unit']);
    //grunt.registerTask('test:midway', ['connect:testserver','karma:midway']);
    //grunt.registerTask('test:e2e', ['connect:testserver', 'karma:e2e']);

    //keeping these around for legacy use
    //grunt.registerTask('autotest', ['autotest:unit']);
    //grunt.registerTask('autotest:unit', ['connect:testserver','karma:unit_auto']);
    //grunt.registerTask('autotest:midway', ['connect:testserver','karma:midway_auto']);
    //grunt.registerTask('autotest:e2e', ['connect:testserver','karma:e2e_auto']);

    //installation-related
    //grunt.registerTask('install', ['shell:npm_install','shell:bower_install','shell:font_awesome_fonts']);

    // Lint task(s).
    grunt.registerTask('lint', ['jshint', 'csslint']);

    // Default task(s).
    grunt.registerTask('default', ['lint', 'concurrent:default']);

    grunt.registerTask("test", [ "karma" ]);

    grunt.registerTask('build', [
        //'clean:dist',
        'cssmin',
        'uglify'
    ]);

    //development
    //grunt.registerTask('dev', ['install', 'concat', 'connect:devserver', 'open:devserver', 'watch:assets']);

    //server daemon
    //grunt.registerTask('serve', ['connect:webserver']);
};
