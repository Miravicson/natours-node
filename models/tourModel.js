const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
      required: [true, 'A tour must have a difficulty'],
      trim: true,
      default: 'easy',
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be equal to or above 1.0'],
      max: [5, 'Rating must be equal or less than 5.0'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // Caveat !!!! 'this' only points to current doc on NEW document creation this validator only works for document creation and not for update
        validator: function (val) {
          return val < this.price; // return true for non-error conditions
        },
        message: 'Discount price ({VALUE}): should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A summary must be provided'],
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], // longitude, latitude
      address: String,
      description: String,
    },
    locations: [
      // specifying an array creates an embedded document
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], // longitude, latitude
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    createdAt: {
      type: Date,
      select: false,
    },
    updatedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function (value) {
  return this.duration / 7;
});

// Creating a virtual populate to access child reference without implementing explicit child referencing
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
  // get: function (value) {
  //   if (value) {
  //     const newValue = value.map((review) => ({
  //       review: review.review,
  //       rating: review.rating,
  //     }));
  //     return newValue;
  //   }
  // },
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() and not on insertMany
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// This middleware embeds the user document in the guides array from the user ids passed in.
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => {
//     const guide = await User.findById(id);
//     return guide;
//   });
//   this.guides = await Promise.all(guidesPromises);
//   this.save();
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: runs a function before and after a query is executed.
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  // console.log(docs);
  // console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE: runs before and after an aggregation query
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

tourSchema.plugin(mongooseLeanVirtuals);

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
