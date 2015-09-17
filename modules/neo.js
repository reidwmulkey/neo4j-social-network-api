var neo4j = require('neo4j-js');
var uuid = require('node-uuid');
var config = require('./config');
var constraints = require('./constraints');
var q = require('q');

module.exports.setup = function(){
	var deferred = q.defer();

	console.log('connecting to ' + config.dbURL + ' for neo4j.');
	neo4j.connect(config.dbURL, function (err, graph) {
	    if (err){
	    	deferred.reject(err);     
	 	}
	 	else{
	 		neo4j.graph = graph; 
		    console.log('connected successfully to neo4j.');
			constraints.setUserConstraint()
			.then(function(){
				console.log('constraints set successfully.');
				console.log('server initialization completed.');
				deferred.resolve();
			})
			.catch(deferred.reject);
	 	}
	});

	return deferred.promise;
}

module.exports.getGraph = function(){
	if (neo4j.graph){
		return neo4j.graph;
	}
	else {
		throw "Could not connect to neo4j - from modules/neo/getGraph().";
	}
}

//queryArray - an array of strings used to form the query
//data - JSON with any information being used for the query
//deferred - A deferred object
//This function will run the query, and then reject or resolve the deferred given
//based on the result
module.exports.runQuery = function(queryArray, data, deferred){
	this.getGraph().query(queryArray.join('\n'), data, function (err, results) {
	    if (err) {	
	        deferred.reject(err);
	    }
	    else {
	    	deferred.resolve(results);
	    }
	});
}

//queryArray - an array of strings used to form the query
//data - JSON with any information being used for the query
//This function will run the query, and return a promise for the results
module.exports.runQueryDeferred = function(queryArray, data){
	var deferred = q.defer();
	
	this.getGraph().query(queryArray.join('\n'), data, function (err, results) {
	    if (err) {	
	        deferred.reject(err);
	    }
	    else {
	    	deferred.resolve(results);
	    }
	});

	return deferred.promise;
}

module.exports.uuid = function(options) {
	return uuid.v1();
}