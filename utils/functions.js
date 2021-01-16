const lDiff = require('lodash/difference');

exports.excludeFrom = (fields, exclude) => lDiff(fields, exclude);
