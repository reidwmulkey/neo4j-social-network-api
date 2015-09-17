var express = require('express');


//this router is where all the middleware for the app is stored. 
//Middleware is code that is run before the router reaches your endpoints, so here it is used
//to check oauth credentials on all POST and PUT requests. If the credentials are valid, 
//it will forward to the next router function. E.G., a post to "/users/search" will first run 
//this middleware, and then run the router function for "/users/search"
module.exports = function(oauth){
	var module = {};
	module.router = express.Router();
	module.functions = {};
	
	module.functions.post = function(req, res, next){
		if(req.path !== "/users/login"){
			oauth.validate(req)
			.then(function(){
				next();
			}).catch(function(){
				oauth.error(res);
			});	
		}
		else {
			next();
		}
	}

	module.functions.put = function(req, res, next){
		oauth.validate(req)
		.then(function(){
			next();
		}).catch(function(){
			oauth.error(res);
		});
	}

	module.router.post('/*', 	module.functions.post);
	module.router.put('/*', 	module.functions.put);

	return module;
};
