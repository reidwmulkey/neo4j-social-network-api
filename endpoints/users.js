var express = require('express');
var User = require('../models/User');
var ep = require('../modules/endpoint-helper');

module.exports = function(oauth){
	var module = {};
	module.router = express.Router();
	module.functions = {};

	module.functions.get = function(req, res, next){
		User.get(req.query)
		.then(function(data){
			if(data.status)
				res.status(data.status).send(data.resp);
			else
				res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}


	module.functions.search = function(req, res, next){
		User.search(req.body)
		.then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}

	module.functions.login = function(req, res, next){
		oauth.login(req).then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}

	module.functions.update = function(req, res, next){
		User.update(req.body)
		.then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}

	module.functions.create = function(req, res, next){
		User.create(req.body).then(function(data){
			res.send(data);
		}).catch(function(error){
			if(error.exception && error.exception == "CypherExecutionException"){
				error.statusCode = 409;
				error.message = "Another account already uses this login information";
			}
			ep.handleError(res,error);
		});
	}

	module.router.get('/', 			module.functions.get);
	module.router.put('/', 			module.functions.create);
	module.router.post('/search', 	module.functions.search);
	module.router.post('/login', 	module.functions.login);
	module.router.post('/', 		module.functions.update);
	return module;
};
