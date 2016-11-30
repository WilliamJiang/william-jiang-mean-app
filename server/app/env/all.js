/* jshint node:true */
'use strict';

var path = require('path');
var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
    app: {
        title: 'Traffic Bridge',
        description: 'Traffic Bridge description',
        keywords: 'Traffic Bridge keywords'
    },
    db: {
        mongo: {
            app: {
                options: {
                    server: {
                        socketOptions: {
                            keepAlive: 1,
                            connectTimeoutMS: 30000,
                            socketTimeoutMS: 90000
                        }
                    },
                    replset: {
                        socketOptions: {
                            keepAlive: 1,
                            connectTimeoutMS: 30000,
                            socketTimeoutMS: 90000
                        }
                    }
                }
	    }
	}
    },
    rootPath: rootPath,
    port: process.env.PORT || 3000
};
