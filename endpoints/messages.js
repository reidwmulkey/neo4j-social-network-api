var express = require('express');
var q = require('q');
var Message = require('../models/Message');
var ep = require('../modules/endpoint-helper');

module.exports = function(){
	var module = {};
	module.router = express.Router();
	module.functions = {};

	module.functions.get = function(req, res, next) {
		(function(){
			if(req.query && req.query.userUUID1 && req.query.userUUID2)
				return Message.get(req.query);
			else if(req.query && req.query.userUUID)
				return Message.getAll(req.query);
			else {
				var deferred = q.defer();
				deferred.reject();
				return deferred.promise;
			}
		}).then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});	
	}

	module.functions.create = function (req, res){
		Message.create(req.body)
		.then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}

	module.router.get('/', module.functions.get);
	module.router.put('/', module.functions.create);
	
	return module;
}