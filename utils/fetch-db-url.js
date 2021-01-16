module.exports = () => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('Using local database');
    return process.env.DATABASE_LOCAL;
  }
  logger.info('Using remote database');
  return process.env.DATABASE.replace(
    /<DATABASE_PASSWORD>/,
    process.env.DATABASE_PASSWORD
  ).replace(/<DATABASE_NAME>/, process.env.DATABASE_NAME);
};
