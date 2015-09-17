var express = require('express');
var constants = require('../modules/constants');
var ep = require('../modules/endpoint-helper');

module.exports = function(){
	var module = {};
	module.router = express.Router();
	module.functions = {};

	module.functions.getCountries = function(req, res) {
		try{
			var countries = constants.countries;
			res.send(countries);
		} catch(error){
			ep.handleError(res,error);
		}
	}

	module.router.get('/countries', module.functions.getCountries);
	
	return module;
}