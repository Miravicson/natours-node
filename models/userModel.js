const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userEnum = ['user', 'guide', 'lead-guide', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: [
        6,
        'The length of the name must be a minimum of 6 characters',
      ],
      maxlength: [50, 'The maximum length of the name must be 50 characters'],
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      trim: true,
      maxlength: [100, 'The email address must be a maximum of 100 characters'],
      validate: [validator.isEmail, 'Please provide a valid email address'],
      required: [true, 'Please provide your email'],
      unique: [true, 'The email address must be unique'],
      lowercase: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: userEnum,
        message: `The user role must be one of ${userEnum.join(', ')}.`,
      },
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'You password must not be less than 8 characters'],
      transform: function (val) {
        // do not return the password
        return undefined;
      },
      select: false, // don't return the password
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        message: 'Passwords must match',

        validator: function (value) {
          // This works only on save and create
          return this.password === value;
        },
      },
      transform: function (val) {
        // do not return the passwordConfirm
        return undefined;
      },
      select: false, // don't return the passwordConfirm
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
      transform: function (val) {
        return undefined;
      },
    },
    createdAt: {
      type: Date,
      select: false,
    },
    updatedAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // Only run this function if the password was modified
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Number.parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    const wasPasswordChangedAfter = changedTimestamp > JWTTimestamp;
    return wasPasswordChangedAfter; // False means not changed
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
