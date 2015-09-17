var q = require('q');
var neo = require('../modules/neo');
var model = require('../modules/model-helper');

module.exports.search = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data);
	if(validation !== true) deferred.reject({
		status: 400,
		message: validation
	});
	else {
		var firstNameLine = data.firstName ? 'user.firstName =~ ".*(?i)' + data.firstName + '.*"': '';
		var lastNameLine = data.lastName ? 'user.lastName =~ ".*(?i)' + data.lastName + '.*"' : '';
		var whereLine = firstNameLine !== '' || lastNameLine !== '' ? 'WHERE ' : '';
		var andLine = firstNameLine && lastNameLine ? ' and ' : '';
		var query = [
		    'MATCH (user:User)',
		    whereLine,
		    firstNameLine,
		    andLine,
		    lastNameLine,
		    'RETURN user;'
		];
		neo.runQueryDeferred(query, data).then(function(respData){
			var retData = [];
			for(var i = 0; i < respData.length; i++){
				retData.push(respData[i].user.data);
			}
			deferred.resolve(retData);
		}).catch(deferred.reject);
	}
	return deferred.promise;
};

module.exports.get = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, "userUUID");
	if(validation !== true) deferred.reject({
		status: 400,
		message: validation
	});
	else {
		var query = [
		    'MATCH (user:User) WHERE user.uuid = {userUUID}',
		    'RETURN user;'
		];
		neo.runQueryDeferred(query, data).then(function(respData){
			if(respData.length !== 1){
				deferred.resolve({});
			}else{
				deferred.resolve(respData[0].user.data);
			}
		}).catch(deferred.reject);
	}
	return deferred.promise;
};

module.exports.update = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, ["userUUID", "firstName", "lastName", "profile"]);
	if(validation !== true) deferred.reject({
		status: 400,
		message: validation
	});
	else {
		var query = [
		    'MATCH (n:User) WHERE n.uuid = {userUUID}',
		    'SET n.firstName = {firstName}',
		    'SET n.lastName = {lastName}',
		    'SET n.profile = {profile}',
		    'RETURN n;'
		];
		neo.runQueryDeferred(query, data).then(function(respData){
			if(respData.length !== 1)
				deferred.reject("Unable to retrieve user information.");
			else
				deferred.resolve(respData[0].n.data);
		}).catch(deferred.reject);
	}
	return deferred.promise;
};

module.exports.getAll = function(){
	var deferred = q.defer();
	var query = [
	    'MATCH (n:User)',
	    'RETURN n;'
	];

	neo.runQueryDeferred(query, null).then(function(respData){
		var retData = [];
		for(var i = 0; i < respData.length; i++){
			retData.push(respData[i].n.data);
		}
		deferred.resolve(retData);
	}).catch(deferred.reject);
	return deferred.promise;
};

module.exports.create = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, ["userUUID", "firstName", "lastName", "profile"]);
	if(validation !== true) deferred.reject({
		status: 400,
		message: validation
	});
	else {
		var query = [
		    'CREATE (n:User {firstName:{firstName}, lastName: {lastName}, uuid: {userUUID}, profile: {profile}})',
		    'RETURN n;'
		];

		neo.runQueryDeferred(query, data).then(function(respData){
			var nodeUUID = respData[0] && respData[0].n.data.uuid;
			if(nodeUUID)
				deferred.resolve(nodeUUID);
			else
				deferred.reject("Error retrieving area ID information after creation.");
		}).catch(deferred.reject);
	}
	return deferred.promise;
};