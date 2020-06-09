const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const path = require('path');

const initExpress = require('./init/expressInit');
const initRoutes = require('./init/routesInit');
const { options } = require('./utils');
global.logger = require('./configurations/logger');

const app = express();

/*
 * express settings
 */

initExpress(app);

/*
 * server application routes
 *
 */

initRoutes(app);

const swaggerDocs = swaggerJsDoc(options);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
// All undefined asset or api routes should return a 404
app.route('*')
  .get((req, res) => res.status(404).send({message:'not found!!'}))
  .post((req, res) => res.status(404).send({message:'not found!!'}))
  .put((req, res) => res.status(404).send({message:'not found!!'}))
  .delete((req, res) => res.status(404).send({message:'not found!!'}));


app.listen(app.get('port'));

module.exports = app;
