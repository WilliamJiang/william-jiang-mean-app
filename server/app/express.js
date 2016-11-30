/* jshint node:true */
var express = require('express');
var stylus = require('stylus');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var helmet = require('helmet');
var passport = require('passport');
var consolidate = require('consolidate');
var cors = require('cors');
//var flash = require('connect-flash');
//var compress = require('compression');
//var methodOverride = require('method-override');
var morgan = require('morgan');
var logger = require('../utilities/logger');
var _ = require('lodash');

module.exports = function (config, app, db) {

    // Setting application local variables
    app.locals.config = config;
    app.locals.db = db;
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;

    //app.locals.jsFiles = config.getJavaScriptAssets();
    //app.locals.cssFiles = config.getCSSAssets();

    var timestamp = new Date().getTime();
    
    app.locals.jsFiles = _.map(config.app.jsFiles,function(jsFile) {
	    return jsFile + '?' + timestamp;
    });
    
    app.locals.cssFiles = _.map(config.app.cssFiles,function(cssFile) {
	    return cssFile + '?' + timestamp;
    });

    //logger.debug(app.locals.jsFiles);
    //logger.debug(app.locals.cssFiles);
    app.use(cors({origin: true, credentials: true}));

    app.engine('server.view.html', consolidate['swig']);//config.templateEngine]);
    app.set('view engine', 'server.view.html');
    app.set('views', config.rootPath + '/server/app/views');

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {

        app.use(morgan('combined'));
        // Disable views cache
        app.set('view cache', false);
    }
    else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'qa') {
        // See https://github.com/tj/consolidate.js/pull/134 kenmc
        app.locals.cache = 'memory';
    }

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    //app.use(express.methodOverride()); // looks for DELETE verbs in hidden fields

    var mongoStoreOptions = {
        url: config.db.mongo.session.uri
    };

    // cookie: {maxAge: 3600000}, 1 Hour
    app.use(session({
        secret: 'pavanika',
        store: new MongoStore(mongoStoreOptions),
        resave: true,
        saveUninitialized: true
    }));

    // Use helmet to secure Express headers
    app.use(helmet.xframe());
    app.use(helmet.xssFilter());
    app.use(helmet.nosniff());
    app.use(helmet.ienoopen());
    app.disable('x-powered-by');


    app.use(express.static(path.join(config.rootPath, '/public'), {
        extensions: ['htm', 'html'],
        redirect: false
    }));

    //app.use(express.static(path.join(config.rootPath, '/data')));    

    app.use('/partials', express.static(path.join(config.rootPath, '/public/app'), {
        extensions: ['htm', 'html'],
        redirect: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    require('../config/passport')(app);

    require('./routes/routes')(app);

    /**
     * William: this way will inject constants to req, e.g.: req.constants.COMPANY.TYPE.AGENCY.
     */
    app.set("constants", require('../constants.js'));

}
