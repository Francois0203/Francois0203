const corsMiddleware = require('./cors');
const logger = require('./logger');

function applyMiddlewares(app) {
  app.use(logger);
  app.use(corsMiddleware);
}

module.exports = { applyMiddlewares };
