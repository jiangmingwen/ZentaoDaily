var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var FileStreamRotator = require('file-stream-rotator');


const fs = require('fs')
const dailyTask = require('./tasks/daily');
const {dayScheduler} = require('./utils/schedule.util');
const config = require('./config/config');

var app = express();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//日报，按人统计
dayScheduler(config.daily.hour,config.daily.prev,(s,e)=> {
  dailyTask(config.daily.users,s,e)
})


//设置日志文件目录
var logDirectory=__dirname+'/logs';
//确保日志文件目录存在 没有则创建
fs.existsSync(logDirectory)||fs.mkdirSync(logDirectory);

//创建一个写路由
var accessLogStream=FileStreamRotator.getStream({
    filename:logDirectory+'/accss-%DATE%.log',
    frequency:'daily',
    verbose: false
})
app.use(logger('combined',{stream: accessLogStream}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
