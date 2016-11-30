/* jshint node:true */
var bunyan = require('bunyan');
//var config = require('../config/config');

//console.log(config.logger);

var config = {
    "logger": {
	"bunyan": {
	    "name": "trafficbridge",
	    "level": "debug"
	}
    }
};

module.exports = bunyan.createLogger(config.logger.bunyan);
