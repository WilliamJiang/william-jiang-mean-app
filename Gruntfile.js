module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);
    // or: grunt.loadTasks('tasks')
    //grunt.loadNpmTasks('grunt-cache-bust');
    //grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-contrib-clean');
    //grunt.loadNpmTasks('grunt-env');
    //grunt.loadNpmTasks('grunt-git');

    // Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    var watchFiles = {
        serverViews: ['server/views/**/*.*'],
        serverJS: ['gruntfile.js', 'server.js', 'server/**/*.js'],
        clientViews: ['public/app/**/*.html'],
        clientJS: ['public/app/**/*.js'],
        clientExtJS: ['public/vendor/**/.js', 'public/custom-vendor/**/*.js'],
        clientCSS: ['public/css/**/*.css'],
        mochaTests: ['test/**/*.js']
    };

    grunt.initConfig({

        baseFolder: 'public',
        srcFolder: 'public/app',
        distFolder: 'public/app/dist',
        pkg: grunt.file.readJSON('package.json'),
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
            //copy: {
            //    files: [ '<%= distFolder %>/**', '!<%= distFolder %>/images/**'],
            //    tasks: [ 'copy' ]
            //}
        },
        env: {
            all: {
                NODE_ENV: process.env.NODE_ENV || 'development'
            }
        },
        jshint: {
            // TODO: current js still has many warnings, so ignore at this time.
            /*
             options: {
             jshintrc: '.jshintrc'
             },
             all: {
             src: watchFiles.clientJS.concat(watchFiles.serverJS)
             }
             */
        },
        csslint: {
            // TODO: fix the existed css warings when grunt csslint.
            /*
             options: {
             csslintrc: '.csslintrc'
             },
             all: {
             src: watchFiles.clientCSS
             }
             */
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
                stdout: true,
                stderr: true
            },
            target: {
                command: 'ls'
            },
            linkFonts: {
                command: [
                    '[ -s "<%= srcFolder %>/fonts" ] && rm <%= srcFolder %>/fonts',
                    'ln -s dist/fonts <%= srcFolder %>/fonts'
                ].join('&&')
            },
            getInfo: {
                command: './getInfo.sh > ./getInfo.txt 2>&1'
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
                dest: '<%= distFolder %>/css/app.css',
                src: [
                    '<%= baseFolder %>/vendor/toastr/toastr.css',
                    '<%= baseFolder %>/vendor/ngprogress/ngProgress.css',
                    '<%= baseFolder %>/vendor/ng-tags-input/ng-tags-input.css',
                    '<%= baseFolder %>/custom-vendor/multi-select/isteven-multi-select.css',
                    '<%= baseFolder %>/custom-vendor/annotator/1.2.9/css/annotator.css',
                    '<%= baseFolder %>/custom-vendor/annotator/1.2.9/css/style.css',
                    '<%= baseFolder %>/custom-vendor/annotorious/css/annotorious.css',
                    '<%= baseFolder %>/custom-vendor/annotorious/transparent.gif',
                    '<%= baseFolder %>/custom-vendor/bootstrap-daterangepicker/daterangepicker-bs3.css',
                    '<%= baseFolder %>/css/**/*.css'
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
                    '<%= distFolder %>/custom-vendor.min.css': [
                        '<%= baseFolder %>/vendor/ngprogress/ngProgress.css',
                        '<%= baseFolder %>/custom-vendor/multi-select/isteven-multi-select.css',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/css/annotator.css',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/css/style.css',
                        '<%= baseFolder %>/custom-vendor/annotorious/css/annotorious.css',
                        '<%= baseFolder %>/custom-vendor/bootstrap-daterangepicker/daterangepicker-bs3.css'
                    ],
                    '<%= distFolder %>/app.min.css': [
                        '<%= baseFolder %>/css/**/*.css'
                    ]
                }
            }
        },
        uglify: {
            all: {
                options: {
                    sourceMap: true,
                    sourceMapName: '<%= distFolder %>/sourcemap.map'
                },
                files: {
                    '<%= distFolder %>/custom-vendor.min.js': [
                        '<%= baseFolder %>/vendor/angular-deferred-bootstrap/angular-deferred-bootstrap.js',
                        '<%= baseFolder %>/vendor/angular-truncate/src/truncate.js',
                        '<%= baseFolder %>/custom-vendor/multi-select/isteven-multi-select.js',
                        '<%= baseFolder %>/custom-vendor/multi-select/advertiser-multi-select.js',
                        '<%= baseFolder %>/custom-vendor/pdfjs/build/pdf_js.js',
                        '<%= baseFolder %>/custom-vendor/pdfjs/web/compatibility.js',
                        '<%= baseFolder %>/custom-vendor/pdfjs/web/textlayerbuilder.js',
                        '<%= baseFolder %>/custom-vendor/bootstrap-daterangepicker/daterangepicker.js',
                        '<%= baseFolder %>/custom-vendor/node-uuid/uuid.js',
                        ///////
                        '<%= baseFolder %>/scripts/dropdowns-enhancement.js',
                        '<%= baseFolder %>/scripts/jquery.mousewheel.js',
                        '<%= baseFolder %>/scripts/jquery.jscrollpane.js',
                        '<%= baseFolder %>/scripts/main.js',
                        '<%= baseFolder %>/scripts/home.js',
                        '<%= baseFolder %>/scripts/library.js',
                        '<%= baseFolder %>/scripts/compare.js',
                        '<%= baseFolder %>/scripts/dropdowns-enhancement.js'
                    ],
                    '<%= distFolder %>/app.min.js': [
                        '<%= srcFolder %>/tc/tc.module.js',
                        '<%= srcFolder %>/cc/cc.module.js',
                        '<%= srcFolder %>/main/main.module.js',
                        '<%= srcFolder %>/common/common.module.js',
                        '<%= srcFolder %>/profile/profile.module.js',
                        '<%= srcFolder %>/login/login.module.js',
                        '<%= srcFolder %>/filters/pageOffsetFilter.js',
                        '<%= srcFolder %>/directives/dateValidator.js',
                        '<%= srcFolder %>/directives/about_directive.js',
                        '<%= srcFolder %>/app.js',
                        '<%= srcFolder %>/main/MainCtrl.js',
                        '<%= srcFolder %>/main/DebugCtrl.js',
                        //'<%= srcFolder %>/login/LoginCtrl.js',
                        '<%= srcFolder %>/login/ForgotCredentialsCtrl.js',
                        '<%= srcFolder %>/account/mvIdentity.js',
                        '<%= srcFolder %>/services/AuthService.js',
                        '<%= srcFolder %>/services/CIPollerService.js',
                        '<%= srcFolder %>/services/CICountsPollerService.js',
                        '<%= srcFolder %>/services/DataService.js',
                        '<%= srcFolder %>/services/NotifierService.js',
                        '<%= srcFolder %>/services/UploadService.js',
                        '<%= srcFolder %>/services/UtilsService.js',
                        '<%= srcFolder %>/services/FilterService.js',
                        '<%= srcFolder %>/common/ApplicationCtrl.js',
                        '<%= srcFolder %>/profile/ProfileCtrl.js',
                        '<%= srcFolder %>/directives/filters_directive.js',
                        '<%= srcFolder %>/directives/zoom_directive.js',
                        '<%= srcFolder %>/directives/pdf_view_directive.js',
                        '<%= srcFolder %>/directives/daterange/daterange_directive.js',
                        '<%= srcFolder %>/tc/**/*.js',
                        '<%= srcFolder %>/cc/**/*.js',
                        '<%= srcFolder %>/models/CI.js',
                        '<%= srcFolder %>/filters/stringFilters.js',
                        '<%= srcFolder %>/directives/annotation/viewAllAnnotations.js'
                    ]
                }
            }
        },
        clean: {
            dist: {
                src: ['<%= distFolder %>']
            }
        },
        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16,
                //baseDir: '<%= baseFolder %>/',
                deleteOriginals: false
            },
            assets: {
                files: {
                    src: [
                        '<%= baseFolder %>/css/*.css',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/annotator-full.1.2.9.js',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/js/jquery.dateFormat.js',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/js/jquery.slimscroll.js',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/plugins/SideViewer.js',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/plugins/Categories.js',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/plugins/AnnotatorMarker.js',
                        '<%= baseFolder %>/custom-vendor/annotator/1.2.9/plugins/AnnotationStore.js',
                        '<%= baseFolder %>/custom-vendor/annotator/plugins/message-plugin.js',
                        '<%= baseFolder %>/custom-vendor/annotorious/annotorious.okfn.custom.js',
                        '<%= baseFolder %>/custom-vendor/xml2json/xml2json.js',
                        '<%= baseFolder %>/vendor/**/*.js',
                        '<%= srcFolder %>/**/*.js',
                        '<%= distFolder %>/*.css'
                        //'<%= srcFolder %>/login/LoginCtrl.js',
                        //'<%= distFolder %>/custom-vendor.min.js',
                        //'<%= distFolder %>/app.min.js',
                        //'server/app/env/common-min.js',
                        //'server/app/env/qa.js',
                        //'Gruntfile.js',
                        //'server/app/views/layout.server.view.html',
                        //'server/app/views/index.server.view.html'
                    ]
                }
            }
        },
        copy: {
            custom_vendor_images: {
                expand: true,
                cwd: '<%= baseFolder %>/custom-vendor/multi-select/',
                src: [
                    'images/**',
                    '<%= baseFolder %>/images/**'
                ],
                dest: '<%= distFolder %>'
            },
            images: {
                expand: true,
                cwd: '<%= baseFolder %>',
                src: [
                    'images/**', '!images/*.styl'
                ],
                dest: '<%= distFolder %>'
            },
            fonts: {
                expand: true,
                cwd: '<%= baseFolder %>',
                src: [
                    'fonts/**'
                ],
                dest: '<%= distFolder %>'
            }
        },
        gitlog: {
            tbtarget: {
                prop: 'gitlog.tbtarget.result',
                dateOrder: true
            }
        }
    });

    /**
     * grunt.task.registerTask:
     */
    grunt.registerTask("test", ["jshint", "karma"]);
    grunt.registerTask('test:unit', ["jshint", 'karma:unit']);

    // Lint task(s).
    grunt.registerTask('lint', ['jshint', 'csslint']);

    // development:
    grunt.registerTask('dev', [
        'install',
        'concat',
        'connect:devserver',
        'open:devserver',
        'watch:assets'
    ]);

    grunt.registerTask('bust', ['jshint', 'clean', 'cacheBust']);

    // qa and minify: , 'cacheBust:assets'
    grunt.registerTask('minify', ['clean', 'cssmin', 'uglify', 'copy', 'shell:linkFonts']);
    grunt.registerTask('qa', ['minify', 'concurrent:default']);

    // build:
    grunt.registerTask('build',
        'clean, minify css and js files, copy css images and cache static these images.',
        ['clean:dist', 'cssmin:target', 'uglify:all', 'copy', 'cacheBust', 'concurrent:default']);

    // Default task(s). 'env', 'minify',
    grunt.registerTask('default',
        'Watch the project for changes, automatically builds them and run in server',
        //    ['lint', 'env', 'shell:getInfo', 'concurrent:default']);
        ['lint', 'env', 'minify', 'shell:getInfo', 'concurrent:default']);

    //server daemon
    //grunt.registerTask('serve', ['connect:webserver']);
};
