const { Router } = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protect all routes after this middle ware
router.use(authController.protect); // protects all succeeding routes

router.patch(
  '/my-password',
  authController.protect,
  authController.updatePassword
);
router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);

// Add succeeding routes require admin privilege
router.use(authController.restrictTo('admin'));

router.patch(
  '/:id/activate',
  userController.activateAlias,
  userController.updateUser
);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

module.exports = router;
