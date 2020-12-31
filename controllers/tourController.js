const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const Tour = require('../models/tourModel');

const fsWritePromise = promisify(fs.writeFile);
const db = path.resolve(`dev-data/data/tours-simple.json`);
const tours = JSON.parse(fs.readFileSync(db));

exports.checkID = (req, res, next, val) => {
  const id = Number.parseInt(val, 10);
  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  const { body: data } = req;
  // const isValidObject =
  //   Object.prototype.hasOwnProperty.call(data, 'name') &&
  //   Object.prototype.hasOwnProperty.call(data, 'price');
  const isValidObject = data.name && data.price;

  if (!isValidObject) {
    return res.status(400).json({
      status: 'error',
      message:
        "Bad request. The body should contain the 'name' property and the 'price' property",
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: { tours },
  });
};

exports.getTour = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const tour = tours.find((tourItem) => tourItem.id === id);
  if (!tour) {
    res.status(404).json({
      status: 'fail',
      message: 'Resource not found',
    });
  } else {
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  }
};

exports.createTour = (req, res) => {
  let { body: tour } = req;
  const newId = tours[tours.length - 1].id + 1;
  tour = { ...tour, id: newId };
  tours.push(tour);
  fsWritePromise(db, JSON.stringify(tours, null, 2)).then(() => {
    res.status(201).json({
      status: 'success',
      results: 1,
      data: {
        tour,
      },
    });
  });
};

exports.updateTour = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { body: update } = req;
  let tour = tours.find((tourItem) => tourItem.id === id);

  if (!tour) {
    res.status(404).json({
      status: 'fail',
      message: 'Resource not found',
    });
  } else {
    const tourIndex = tours.findIndex((tourItem) => tourItem.id === id);
    tour = {
      ...tour,
      ...update,
    };
    tours.splice(tourIndex, 1, tour);
    fsWritePromise(db, JSON.stringify(tours, null, 2)).then(() => {
      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    });
  }
};

exports.deleteTour = (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const tourIndex = tours.findIndex((tour) => tour.id === id);
  if (tourIndex < 0) {
    res.status(404).json({
      status: 'fail',
      message: 'Resource not found',
    });
  } else {
    tours.splice(tourIndex, 1);
    fsWritePromise(db, JSON.stringify(tours, null, 2)).then(() => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    });
  }
};
