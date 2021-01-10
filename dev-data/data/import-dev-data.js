require('dotenv').config({ path: './config.env' });

const fs = require('fs');
const fsWritePro = require('util').promisify(fs.writeFile);
const path = require('path');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const utils = require('../../utils');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
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
    console.log('Data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
};

const exportData = async (
  filename = path.resolve('dev-data/data/export.json')
) => {
  console.log('Exporting data');
  const exportedTours = await Tour.find().select('-__v').lean().exec();
  await fsWritePro(filename, JSON.stringify(exportedTours, null, 2));
  console.log(
    `Exported tours successfully. ${exportedTours.length} documents saved.`
  );
};

// DELETE ALL DATA FROM DB

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted successfully');
  } catch (error) {
    console.log(error);
  }
};

const promoteUserToAdmin = async (email) => {
  try {
    console.log(`Email: ${email}`);
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: 'admin' },
      { new: true }
    ).exec();
    console.log(user.role);
    console.log(`The user with email: ${email} has been promoted to admin`);
  } catch (error) {
    console.error(error);
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
      console.log(
        '\n To run the application run node /dev-data/data/import-dev-data.js with the following options\n "--import": to import a new data. this would clear already existing data.\n"--export": to export data from the db to an exports.json file.\n"--delete": to delete the already existing data.\n"--promote-user": to promote user to admin, pass in the user email as an option'
      );
      break;
  }
  connection.connection.close();
  process.exit();
};

console.log('Connecting to database...');
utils.connectToMongo({
  successfulCallback: (connection) => processCommand(connection),
  failureCallback: (error) => process.exit(error),
});
