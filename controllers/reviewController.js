const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const { catchAsync, AppError } = require('../utils');
const factory = require('./handlerFactory');

exports.reviewOnlyBooked = catchAsync(async (req, res, next) => {
  const hasTourBeenBooked = await Booking.exists({
    tour: req.params.tourId,
    user: req.user.id,
  });
  if (!hasTourBeenBooked) {
    return next(
      new AppError(`You must book tour before posting a review`, 400)
    );
  }
  return next();
});

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
