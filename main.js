var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator');
var neo = require('./modules/neo');

module.exports = function(oauth){
    var app = express();
    neo.setup();
    console.log('skipping oauth.getFacebookToken() from main.js because there isn\'t a facebook appID entered.');
    // oauth.getFacebookToken();

    //each endpoint module is a function that its dependencies as parameters, allowing for integration testing
    var index = require('./endpoints/index')();
    var middleware = require('./endpoints/middleware')(oauth);
    var users = require('./endpoints/users')(oauth);
    var messages = require('./endpoints/messages')();
    var friends = require('./endpoints/friends')();
    var lists = require('./endpoints/lists')();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());

    app.use('/', index.router);
    app.use('/', middleware.router);
    app.use('/users', users.router);
    app.use('/friends', friends.router);
    app.use('/messages', messages.router);
    app.use('/lists', lists.router);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use(logger('dev'));

    //rotating access logs
    var logDirectory = __dirname + '/log';
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
    var accessLogStream = FileStreamRotator.getStream({
      filename: logDirectory + '/access-%DATE%.log',
      frequency: 'daily',
      verbose: false
    });
    app.use(logger('combined', {stream: accessLogStream}));

    app.use(express.static(path.join(__dirname, 'public')));

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500)
            .send({
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
    return app;
}
