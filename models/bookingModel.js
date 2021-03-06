const mongoose = require('mongoose');
const Tour = require('./tourModel');
const { excludeFrom } = require('../utils/functions');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

bookingSchema.pre(/^find/, function (next) {
  const exclusionList = excludeFrom(Tour.getSchemaFields(), ['name']);
  const onlyName = `-${exclusionList.join(' -')} -__v`;
  this.populate({
    path: 'user',
    select: 'name',
  }).populate({
    path: 'tour',
    select: onlyName,
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
