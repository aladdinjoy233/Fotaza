var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var session = require('express-session');

var sequelize = require('./database/db');
require('./database/asociations');

// Autenticar al usuario
require('./auth/auth');

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var userRouter = require('./routes/user');
var photoRouter = require('./routes/photo');

var app = express();

// Socket imports
var http = require('http').createServer(app);
var socket = require('./socket/socket');
const socketPort = 3100

// Middleware para obtener baseUrl
app.use((req, res, next) => {
	global.baseUrl = req.protocol + '://' + req.get('host');
	global.socketUrl = req.protocol + '://' + req.get('host').replace('3000', socketPort);
	next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para obtener usuarioId
const { getUserId } = require('./controllers/authController');
app.use(getUserId);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/profile', userRouter);
app.use('/photo', photoRouter);

// Conectar a la db
sequelize.sync({ force: false })
	.then(() => console.log('Connected to the database!'))
	.catch(err => console.log(err));

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Socket server
socket(http);
http.listen(socketPort, () => console.log(`Socket server is running on port ${socketPort}`))

module.exports = app;
