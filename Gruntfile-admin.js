/*jslint node: true */
'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    // Making grunt default to force in order not to break the project.
    grunt.option('force',true);

    var watchFiles = {
        serverViews: [ 'server/admin/views/**/*.*' ],
        serverJS: [ 'gruntfile-admin.js', 'admin.js', 'server/admin/**/*.js' ],
        clientViews: [ 'public/admin/**/*.html'],
        clientJS: [ 'public/admin/**/*.js' ],
        clientExtJS: [ 'public/vendor/**/.js', 'public/custom-vendor/**/*.js' ],
        clientCSS: [ 'public/css/**/*.css' ],
        mochaTests: [ 'test/**/*.js' ]
    };

    grunt.initConfig({
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
                tasks: [ 'jshint' ],
                options: {
                    livereload: true
                }
            },
            clientViews: {
                files: watchFiles.clientViews,
                options: {
                    livereload: true,
                }
            },
            clientJS: {
                files: watchFiles.clientJS,
                tasks: [ 'jshint' ],
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
                tasks: [ 'csslint' ],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
	    /*
            options: {
                jshintrc: true
            },
            all: {
                src: watchFiles.clientJS.concat(watchFiles.serverJS)
            }
	    */
        },
        csslint: {
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
                script: 'admin.js',
                options: {
                    nodeArgs: [ '--debug' ],
                    ext: 'js,html',
                    watch: watchFiles.serverViews.concat(watchFiles.serverJS)
                }
            }
        },
        concurrent: {
            default: [ 'nodemon', 'watch' ],
            debug: [ 'nodemon', 'watch', /*'node-inspector'/*/ ],
            options: {
                logConcurrentOutput: true,
                limit: 10
            }
        },
        shell: {
            options : {
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
        /*
          connect: {
          options: {
          base: 'app/'
          },
          webserver: {
          options: {
          port: 8888,
          keepalive: true
          }
          },
          devserver: {
          options: {
          port: 8888
          }
          },
          testserver: {
          options: {
          port: 9999
          }
          },
          coverage: {
          options: {
          base: 'coverage/',
          port: 5555,
          keepalive: true
          }
          }
          },

          open: {
          devserver: {
          path: 'http://localhost:8888'
          },
          coverage: {
          path: 'http://localhost:5555'
          }
          },
        */
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                //autoWatch: false,
                singleRun: true,
                browsers: ["PhantomJS"]
            },
            /*
              unit_auto: {
              configFile: './test/karma-unit.conf.js'
              },
              midway: {
              configFile: './test/karma-midway.conf.js',
              autoWatch: false,
              singleRun: true
              },
              midway_auto: {
              configFile: './test/karma-midway.conf.js'
              },
              e2e: {
              configFile: './test/karma-e2e.conf.js',
              autoWatch: false,
              singleRun: true
              },
              e2e_auto: {
              configFile: './test/karma-e2e.conf.js'
              }
            */
        },
        concat: {
            styles: {
                dest: 'public/admin/dist/admin.css',
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
                    'public/admin/dist/admin.min.css': [ 'public/admin/dist/admin.css' ]
                }
            }
        },
        uglify: {
            all: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'public/admin/dist/sourcemap.map'
                },
                files: {
                    'public/admin/dist/admin.min.js': watchFiles.clientJS
                }
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
    grunt.registerTask('lint',[ 'jshint','csslint' ]);

    // Default task(s).
    grunt.registerTask('default',[ 'lint', 'concurrent:default' ]);

    grunt.registerTask("test", [
        "karma"
    ]);

    //development
    //grunt.registerTask('dev', ['install', 'concat', 'connect:devserver', 'open:devserver', 'watch:assets']);

    //server daemon
    //grunt.registerTask('serve', ['connect:webserver']);
};
