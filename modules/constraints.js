var neo = require('../modules/neo');
var q = require('q');

module.exports.setUserConstraint = function(){
	return neo.runQueryDeferred([
	    'CREATE CONSTRAINT ON (node:User) ASSERT node.uuid IS UNIQUE;'
	], null);
};