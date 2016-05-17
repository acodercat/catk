# catk #

A Restfull framework based on KOA using MVC conventions,Reference to the design idea of rails framework
# githup #

    https://github.com/WillCodeCat/catk.git


## Install ##

    npm install catk -g
## create a catk project ##

    catk new project_name
    cd project_name
    npm install
    npm start
## create a controller ##

    1.catk generate controller [controller_name]
    2.catk generate controller [path/controller_name]
## create a model ##

    1.catk generate model [model_name]
    2.catk generate model [path/model_name]
## router ##

    in "./config/routes.js"
    1.'MODELS PATH': 'ControllerName.Action',//'post /auth/login': 'AuthController.login',
    2.'MODELS PATH': 'Path/ControllerName.Action',//'post /auth/login': 'User/AuthController.login',
## config ##

    in "./config"
    config.[file_name].[key]//config.auth.key
    You can new a config file
## model ##
    
    ORM Sequelize http://static.html-js.com/sequelizejs/index.html
    in "./app/Modles"
    models.[model_name].[action]//modles.user.login();
    You can new a modle file
## global function ##
    
    in "./lib/function.js"
    define function like this:
    is_login:function(){
        
		
	}
    You can invoke this function from anywhere in the code.
    
## about me ##
    
    name:CoderCat
    email:1067302838@qq.com
    blog:http://coder.cat
## directory structure ##

    .
    ├── app
    │   └── controller
    |   |    └── UserController.js
    |   └── models
    |   |    └── User.js
    |   └── logs
    |        └── 2016.5.10.text
    ├── config
    |   ├── globals.js
    |   └── models.js
    |   └── routes.js
    |   └── auth.js
    ├── lib
    |   ├── core.js
    |   └── function.js
    ├── app.js
    ├── assets
    |   └──images
    ├── package.json
    └── README.md

