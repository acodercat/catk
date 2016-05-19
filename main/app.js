'use strict'
const koa = require('koa');
const app = koa();
const jwt = require('jwt-simple');
const catk = require('./lib/catk.js');
catk(app,'app');//app是程序目录目录名



app.listen(config.local.port);