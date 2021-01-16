const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

exports.setSecurityMiddleWare = (app) => {
  // Set security HTTP headers
  const helmetConfig = {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'default-src': [
        "'self'",
        'api.mapbox.com',
        'events.mapbox.com',
        'https://js.stripe.com/v3/',
      ],
      'script-src': [
        "'self'",
        'https://api.mapbox.com',
        'https://cdnjs.cloudflare.com',
        'https://js.stripe.com/v3/',
      ],
      'worker-src': ["'self'", 'blob:', 'https://api.mapbox.com'],
      // 'require-trusted-types-for': ["'script'", 'https://api.mapbox.com'],
    },
  };

  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(helmet.contentSecurityPolicy(helmetConfig));

  // app.use((req, res, next) => {
  //   const newContentPolicyString =
  //     "default-src 'self' https://*; connect-src 'self' https://* wss://*; font-src 'self' https://* blob: data:; frame-src 'self' https://* blob: data:; img-src 'self' https://* blob: data:; media-src 'self' https://* blob: data:; object-src 'self' https://* blob: data:; script-src 'self' https://* 'unsafe-inline' 'unsafe-eval'; style-src 'self' https://* 'unsafe-inline'; worker-src 'self' blob:;";
  //   res.set('Content-Security-Policy', newContentPolicyString);
  //   next();
  // });

  // Limit requests from same API
  const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
  });
  app.use('/api', limiter);

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution. when there are duplicate query parameters the last one wins.
  app.use(
    hpp({
      whitelist: [
        'duration',
        'ratingsAverage',
        'ratingsQuantity',
        'maxGroupSize',
        'difficulty',
        'price',
      ],
    })
  );
};
