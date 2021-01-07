module.exports = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Using local database');
    return process.env.DATABASE_LOCAL;
  }
  console.log('Using remote database');
  return process.env.DATABASE.replace(
    /<DATABASE_PASSWORD>/,
    process.env.DATABASE_PASSWORD
  ).replace(/<DATABASE_NAME>/, process.env.DATABASE_NAME);
};
