const express = require('./config/express');
const {logger} = require('./config/winston');

const app = express();
const port = 3000; 
const server = app.listen(port)

server.keepAliveTimeout = 65000;
//server.headersTimeout = 66000;

logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);
