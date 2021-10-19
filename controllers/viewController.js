const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const { catchAsync, AppError } = require('../utils');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      "Your booking was successfully! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later.";
  }
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  // 2) Build template for

  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', { title: 'All Tours', tours });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review rating user ',
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }
  res.status(200).render('tour', { title: tour.name, tour: tour });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Login into your account' });
};
exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', { title: 'Create and Account' });
};

exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render('account', { title: 'Your account' });
});

exports.getMyTours = catchAsync(async (req, res) => {
  // 1) Find all bookings
  // alternatively, we can do a virtual populate on the users
  const bookings = await Booking.find({ user: req.user.id });
  // 2) Find tours with the returned Ids
  const tourIds = bookings.map((el) => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', { title: 'My Tours', tours });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true }
  );
  res
    .status(200)
    .render('account', { title: 'Your account', user: updatedUser });
});
