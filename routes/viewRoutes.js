const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.protect, viewController.getAccount);
router.get(
  '/my-tours',
  authController.protect,
  bookingController.createBookingCheckout,
  viewController.getMyTours
);
router.get('/', authController.isLoggedIn, viewController.getOverview);

module.exports = router;
