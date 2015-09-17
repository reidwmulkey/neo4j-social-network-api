var express = require('express');
module.exports = function(){
	var module = {};
	module.router = express.Router();
	module.functions = {};
	
	module.functions.get = function(req, res) {
		res.render('index', { title: 'neo4j-social-network-api' });
	}
	
	module.router.get('/', module.functions.get);

	return module;
}