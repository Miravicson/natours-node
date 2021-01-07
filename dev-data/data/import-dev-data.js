require('dotenv').config({ path: './config.env' });
const e = require('express');
const fs = require('fs');
const fsWritePro = require('util').promisify(fs.writeFile);
const path = require('path');
const Tour = require('../../models/tourModel');
const utils = require('../../utils');

// READ JSON FILE

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// IMPORT DATA INTO DB

const importData = async () => {
  try {
    await Tour.create(tours);
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
    console.log('Data deleted successfully');
  } catch (error) {
    console.log(error);
  }
};

const processCommand = async (connection) => {
  const [, , command] = process.argv;
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
    default:
      console.log('Unrecognized command');
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
