'use strict'
const koa = require('koa');
const app = koa();
const jwt = require('jwt-simple');
const core = require('./lib/core.js');
const port = core(app,'app');//app是程序目录目录名，返回端口号



app.listen(port);