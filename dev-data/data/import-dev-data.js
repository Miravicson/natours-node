require('dotenv').config({ path: './config.env' });

const fs = require('fs');
const fsWritePro = require('util').promisify(fs.writeFile);
const path = require('path');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const utils = require('../../utils');

process.on('uncaughtException', (err) => {
  logger.info('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.info(err.name, err.message);
  process.exit(1);
});

// READ JSON FILE

const tours = JSON.parse(
  // fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const reviews = JSON.parse(
  // fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(
  // fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);

// IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    logger.info('Data successfully loaded!');
  } catch (error) {
    logger.info(error);
  }
};

const exportData = async (
  filename = path.resolve('dev-data/data/export.json')
) => {
  logger.info('Exporting data');
  const exportedTours = await Tour.find().select('-__v').lean().exec();
  await fsWritePro(filename, JSON.stringify(exportedTours, null, 2));
  logger.info(
    `Exported tours successfully. ${exportedTours.length} documents saved.`
  );
};

// DELETE ALL DATA FROM DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    logger.info('Data deleted successfully');
  } catch (error) {
    logger.info(error);
  }
};

const promoteUserToAdmin = async (email) => {
  try {
    logger.info(`Email: ${email}`);
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    ).exec();
    logger.info(user.role);
    logger.info(`The user with email: ${email} has been promoted to admin`);
  } catch (error) {
    logger.error(error);
  }
};

const processCommand = async (connection) => {
  const [, , command, optionOne] = process.argv;
  switch (command) {
    case '--import':
      await deleteData();
      await importData();
      break;
    case '--delete':
      await deleteData();
      break;
    case '--export':
      await exportData();
      break;
    case '--promote-user':
      await promoteUserToAdmin(optionOne);
      break;
    default:
      logger.info(
        '\n To run the application run node /dev-data/data/import-dev-data.js with the following options\n "--import": to import a new data. this would clear already existing data.\n"--export": to export data from the db to an exports.json file.\n"--delete": to delete the already existing data.\n"--promote-user": to promote user to admin, pass in the user email as an option'
      );
      break;
  }
  connection.connection.close();
  process.exit();
};

logger.info('Connecting to database...');
utils.connectToMongo({
  successfulCallback: (connection) => processCommand(connection),
  failureCallback: (error) => process.exit(error),
});
