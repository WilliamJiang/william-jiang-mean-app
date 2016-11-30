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

var morgan = require('morgan');
var logger = require('../utilities/logger');

module.exports = function (config,app,db) {

    // Setting application local variables
    app.locals.config = config;
    app.locals.db = db;
    app.locals.title = config.app.title;
    app.locals.description = config.app.description;
    app.locals.keywords = config.app.keywords;

    require('./controllers/passport')(app);
        

    app.locals.jsFiles = config.app.jsFiles;
    app.locals.cssFiles = config.app.cssFiles;

    app.use(cors());

    app.engine('server.view.html',consolidate['swig']);//config.templateEngine]);
    app.set('view engine','server.view.html');
    app.set('views',config.rootPath + '/server/admin/views');

    // Environment dependent middleware
    if (process.env.NODE_ENV === 'development') {

        app.use(morgan('combined'));
        // Disable views cache
        app.set('view cache', false);
    }
    else if (process.env.NODE_ENV === 'production') {
        // See https://github.com/tj/consolidate.js/pull/134 kenmc
        app.locals.cache = 'memory';
    }

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    var mongoStoreOptions = {
        url: config.db.mongo.session.uri
    };

    app.use(session({
        secret: 'pavanika',
        store: new MongoStore(mongoStoreOptions),
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

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

/*
    app.use(express.static(path.join(config.rootPath, '/public'), {
        extensions: ['htm', 'html'],
        redirect: false
    }));

    app.use('/partials', express.static(path.join(config.rootPath, '/public/app'), {
        extensions: ['htm', 'html'],
        redirect: false
    }));

    app.use('/partials/admin', express.static(path.join(config.rootPath, '/public/admin'), {
        extensions: ['htm', 'html'],
        redirect: false
    }));
 */

    require('../admin/routes/routes')(app);

}
