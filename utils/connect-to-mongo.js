const mongoose = require('mongoose');
const fetchDbUrl = require('./fetch-db-url');

const DB = fetchDbUrl();

const handleServerShutdown = (server, message) => {
  logger.info(message);
  if (server) {
    server.close(() => {
      logger.info('Shutting down server because of the above error.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

function connectToMongo({
  server,
  successfulCallback = () => {},
  failureCallback = () => {},
  subSequentConnectionCallback = () => {},
}) {
  mongoose
    .connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(
      function connectionSuccessful(connection) {
        logger.info('DB connection successful');
        successfulCallback(connection);
      },
      function connectionFailed(error) {
        const message = `Initial Connection Error: ${error.message}`;
        failureCallback(error);
        handleServerShutdown(server, message);
      }
    )
    .catch(function subsequentConnectionError(error) {
      subSequentConnectionCallback(error);
      handleServerShutdown(server, error.message);
    });
}

module.exports = connectToMongo;
