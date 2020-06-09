const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const getConfig = require('../configurations');
const { apiResponseGenerator } = require('./initialiseResponseUtils');


module.exports = (app) => {
  app.set('port', (process.env.PORT || 4000));
  const config = getConfig();
  if (config.env === 'production' || config.env === 'staging') {
    // Secure your Express apps by setting various HTTP headers
     app.use(helmet());
     app.use(compression());
  }
  app.use(apiResponseGenerator);
  app.use(express.json());


  logger.info('--------------------------');
  logger.info('===> Starting Server . . .');
  logger.info(`===>  Environment: ${config.env}`);
  logger.info(`===>  Listening on port: ${app.get('port')}`);
  logger.info('--------------------------');
};
