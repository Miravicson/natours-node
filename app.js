const path = require('path');
const morgan = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const { AppError } = require('./utils');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');
const { setSecurityMiddleWare } = require('./utils/globalMiddleWare');

const app = express();
app.enable('trust proxy'); // allow our application to trust proxy
app.set('view engine', 'pug');
app.set('views', path.resolve('./views'));
// Serving static files
app.use(express.static(path.resolve('./public')));

// Implement cors

app.use(cors());
// Access-Control-Allow-Origin *

app.options('*', cors()); // enabling cors for preflight requests.

// 1) SECURITY MIDDLEWARE

setSecurityMiddleWare(app);

// 2) GLOBAL MIDDLEWARE

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// we need the body coming from stripe to NOT be in json
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
); // stripes webhooks

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());

app.use((req, res, next) => {
  // logger.info(req.cookies);
  next();
});

// Static Routes
app.use('/', viewRouter);
// API Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// 4) Error handler
app.all('*', (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
