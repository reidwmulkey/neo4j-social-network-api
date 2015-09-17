var express = require('express');
var Friend = require('../models/Friend');
var ep = require('../modules/endpoint-helper');

module.exports = function(){
	var module = {};
	module.router = express.Router();
	module.functions = {};

	module.functions.get = function(req, res) {
		Friend.get(req.query).then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}


	module.functions.getFriendRequests = function(req, res) {
		Friend.getFriendRequests(req.query).then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}


	module.functions.sendFriendRequest = function (req, res){
		Friend.sendFriendRequest(req.body)
		.then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}


	module.functions.resolveFriendRequest = function (req, res){
		Friend.resolveFriendRequest(req.body)
		.then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}


	module.functions.rejectFriendRequest = function (req, res){
		Friend.rejectFriendRequest(req.body)
		.then(function(data){
			res.send(data);
		}).catch(function(error){
			ep.handleError(res,error);
		});
	}

	module.router.get('/', 					module.functions.get);
	module.router.get('/request', 			module.functions.getFriendRequests);
	module.router.put('/request', 			module.functions.sendFriendRequest);
	module.router.post('/request/resolve', 	module.functions.resolveFriendRequest);
	module.router.post('/request/reject', 	module.functions.rejectFriendRequest);

	return module;
}