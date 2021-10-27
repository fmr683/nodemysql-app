const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const expressSanitizer = require('express-sanitizer');
const cors = require('cors');
const helmet = require('helmet');


// Libraries
const responseMessages = require('./lib/response-messages');
const authentication = require('./middlewares/authentication');

const userRouter = require('./routes/user');

const Logger = require('./lib/logger');
const winston = require('winston');

const app = express();

// Security to remove X-Powered-By and few other
app.use(helmet());

// Enable CORS
app.use(cors());


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');


// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
Logger.add(
  new winston.transports.Console({
    format: winston.format.simple()
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Authenticate all requests
app.use(function (req, res, next) {
  authentication.authRequest(req, res, next);
});


// Mount express-sanitizer middleware here
app.use(expressSanitizer());

//app.use(express.static(path.join(__dirname, 'public')));

app.use('/v1/user', userRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');

  res.status(500).json(responseMessages.commonResponse(responseMessages.UNKNOWN_ERROR, "", "", err.message));
});

module.exports = app;
