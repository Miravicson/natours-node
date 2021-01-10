const { catchAsync, AppError, APIFeatures } = require('../utils');

const getResourceName = (Model) => Model.modelName.toLowerCase();

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(
          `No ${Model.modelName} found with Id: ${req.params.id}`,
          404
        )
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const resource = getResourceName(Model);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).exec();
    if (!doc) {
      return next(
        new AppError(`No ${resource} found with Id: ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        [resource]: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const resource = getResourceName(Model);
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        [resource]: newDoc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const resource = getResourceName(Model);
    let query = Model.findById(req.params.id);
    if (populateOptions && Object.keys(populateOptions).length)
      query = query.populate(populateOptions);

    const doc = await query.exec();
    if (!doc) {
      return next(
        new AppError(`No ${resource} found with Id: ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        [resource]: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const resource = getResourceName(Model);
    const docs = await new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .getQuery()
      .lean({ virtuals: true })
      // .explain() // used for introspecting queries to determine the document scanned in order to return the results
      .exec();

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { [`${resource}s`]: docs },
    });
  });
