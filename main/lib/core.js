'use strict'
const router = require('koa-router')();
const fs = require('fs');
const path = require('path');
const logger = require('koa-logger');
const json = require('koa-json');
const serve = require('koa-static');
const cors = require('koa-cors');
const port = 3002;
const host = 'localhost';
const Sequelize = require("sequelize");
const bodyparser = require("koa-bodyparser");
let route_list = [];
const colors = require('colors');  
/*
    silly: 'rainbow',  
    input: 'grey',  
    verbose: 'cyan',  
    prompt: 'red',  
    info: 'green',  
    data: 'blue',  
    help: 'cyan',  
    warn: 'yellow',  
    debug: 'magenta',
    error: 'red' 
*/
function global_function_init(){//全局函数
	let fun = require('./function.js');
	for(let name in fun) global[name] = fun[name];
}

function router_auto(route_path,app_name){//自动路由
	
	let stat = fs.lstatSync(route_path);
	if(stat.isDirectory(route_path) == true){//如果是目录
		let dir = fs.readdirSync(route_path);
		let _path = '';
		for(let i in dir){
			stat = fs.lstatSync(route_path+dir[i]);
			if(stat.isDirectory(route_path) == true){//如果是目录
				_path = route_path+dir[i]+'/';
			}else{//是文件
				_path = route_path+dir[i];
				if(path.extname(_path) == '.js'){//如果是js文件
					let file_name = path.basename(_path,'.js');
					let _ps = _path.split('./'+app_name+'/controllers/');
					let req = require('.'+_path);//加载路由
					for(let fun in req){
						router.all('/'+_ps[1].split('Controller.js')[0].toLowerCase()+'/'+fun, req[fun]);
						route_list.push(`ALL: http://${host}:${port}`+'/'+_ps[1].split('Controller.js')[0].toLowerCase()+'/'+fun);
					}
				}
			}
			if(dir === undefined) return;//如果没有文件了 退出递归
			router_auto(_path,app_name);
		}
	}

}

function walk(__path,files){
	let stat = fs.lstatSync(__path);
	if(stat.isDirectory(__path) == true){//如果是目录
		let dir = fs.readdirSync(__path);
		let _path = '';
		for(let i in dir){
			stat = fs.lstatSync(__path+dir[i]);
			if(stat.isDirectory(__path) == true){//如果是目录
				_path = __path+dir[i]+'/';
			}else{//是文件
				_path = __path+dir[i];
				if(path.extname(_path) == '.js'){//如果是js文件
					let file_name = path.basename(_path,'.js');
					let file = [];
					file.push(file_name);
					file.push(_path);
					files.push(file);
				}
			}
			if(dir === undefined) return;//如果没有文件了 退出递归
			walk(_path,files);
		}
	}

}

function config_init() {
	let conf = fs.readdirSync('./config');
	let config = {};
	for(let i in conf){
		let conf_file = path.basename(conf[i],'.js');
		config[conf_file] = require('../config/'+conf[i]);
	}
	global.config = config;
}

function router_init(app_name){

	if(config.globals.auto_router) router_auto('./'+app_name+'/controllers/',app_name);
	let routes = config.routes;
	route_list.push(`------------------routes.js-----------------`.green);
	for (let route in routes){
		let dir = routes[route].split('/');
		let _path = '';
		let controller = dir[dir.length-1];
		delete dir[dir.length-1];
		for(let i in dir) _path = _path+dir[i]+'/';
		controller = controller.split('.');//.切割
		let result = route.split(' ');//空格切割
		let method = result[0].toLowerCase();//访问方式
		let req = require(__dirname+'/../'+app_name+'/controllers/'+_path+controller[0]+'.js');
		router[method](result[1],req[controller[1]]);//创建路由
		route_list.push(`${method.toUpperCase()}: http://${host}:${port}${result[1]}`);
	}

	// console.log('<--router start:'.cyan);
	// for (let i in route_list) console.log(route_list[i].cyan);
	// console.log('end-->'.cyan);

}

function models_init(app_name){

	if(('' == config.models['db']['dbname'] || undefined == config.models['db']['dbname']) ||
	('' == config.models['db']['user'] || undefined == config.models['db']['user']) || 
	('' == config.models['db']['dbname'] || undefined == config.models['db']['dbname']))return;
	const sequelize = new Sequelize(config.models['db']['dbname'],config.models['db']['user'],config.models['db']['pwd'],config.models.setting);
	let models = {};
	let files = [];
	walk('./'+app_name+'/models/',files);
	for(let i in files){
		let model = sequelize.import('.'+files[i][1]);
		if(files[i][0] !== model.name){//模型名必须和模型文件名一致
			console.log('<--model error-->'.red);
			console.log(`${files[i][1]}' 模型名必须和模型文件名不一致'`.red);
		}else if(models[model.name]){
			delete models[model.name];//模型重复会把之前的模型也删除掉
			console.log('<--model error-->'.red);
			console.log(`${files[i][1]}' 模型重复'`.red);
		}else{
			models[model.name] = model;
		}
	}
	Object.keys(models).forEach(function(modelName) {
		if ("associate" in models[modelName]) {
			models[modelName].associate(models);
		}
	});
	models.sequelize = sequelize;
	models.Sequelize = Sequelize;
	return models;
}
function print_name(){
console.log(`   ____           _     _
  / ___|   __ _  | |_  | | __
 | |      / _\` | | __| | |/ /
 | |___  | (_| | | |_  |   <
  \\____|  \\__,_|  \\__| |_|\\_\\`.rainbow);
console.log();

}
function print_info(){
	let pkg = require('../package.json');
	console.log('info'.cyan+`: -------------------------------------------------------
`+'info'.cyan+`: Project name : ${pkg['name']}
`+'info'.cyan+`: Server runing in \`${process.cwd()}\`
`+'info'.cyan+`: To see your app, visit http://${host}:${port}
`+'info'.cyan+`: Port        : ${port}
`+'info'.cyan+`: -------------------------------------------------------`);

}
function init(app,app_name){
	
	print_name();
	config_init();
	global_function_init();//全局函数
	router_init(app_name);
	global.models = models_init(app_name);
	app.use(json());
	app.use(logger());
	app.use(cors());
	app.use(bodyparser());//接收post需要的中间件
	app.use(router.routes());
	app.use(serve('assets'));
	print_info();
	return port;

}

module.exports = init