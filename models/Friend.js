var q = require('q');
var neo = require('../modules/neo');
var model = require('../modules/model-helper');

module.exports.getFriends = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, "userUUID");
	if(validation !== true) deferred.reject({
		status: 400,
		message: validation
	});
	else {
		var query = [
		    'MATCH (user:User) WHERE user.uuid={userUUID}',
			'MATCH (user)-[r:USER_FRIENDED_USER]-(friends)',
			'RETURN friends' + (data && data.limit > 0 ? ' LIMIT ' + data.limit : '') + ';'
		];
		neo.runQueryDeferred(query, data).then(function(respData){
			var retData = [];
			for(var i = 0; i < respData.length; i++){
				retData.push(respData[i].friends.data);
			}
			deferred.resolve(retData);
		}).catch(deferred.reject);
	}

	return deferred.promise;
};

module.exports.getFriendRequests = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, "userUUID");
	if(validation !== true) deferred.reject({
		status: 400, 
		message: validation
	});
	else {
		var query = [
		    'MATCH (user:User) WHERE user.uuid={userUUID}',
			'MATCH (user)-[r:USER_FRIENDREKT_USER]-(friendRequests)',
			'RETURN friendRequests' + (data && data.limit > 0 ? ' LIMIT ' + data.limit : '') + ';'
		];
		neo.runQueryDeferred(query, data).then(function(respData){
			var retData = [];
			for(var i = 0; i < respData.length; i++){
				retData.push(respData[i].friendRequests.data);
			}
			deferred.resolve(retData);
		}).catch(deferred.reject);
	}
	return deferred.promise;
};

module.exports.sendFriendRequest = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, ['senderUUID', 'receiverUUID']);
	if(validation !== true) deferred.reject({
		status:400,
		message:validation
	});
	else {
		var query = [
		    'MATCH (f1:User) WHERE f1.uuid={senderUUID}',
		    'MATCH (f2:User) WHERE f2.uuid={receiverUUID}',
			'CREATE UNIQUE (f1)-[r:USER_FRIENDREKT_USER]->(f2)',
			'SET r.sentOn = timestamp()',
			'RETURN r;'
		];
		neo.runQueryDeferred(query, data).then(function(respData){
			deferred.resolve(respData[0].r.data);
		}).catch(deferred.reject);
	}

	return deferred.promise;
};

module.exports.resolveFriendRequest = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, ['senderUUID', 'receiverUUID']);
	if(validation !== true) deferred.reject({
		status:400,
		message:validation
	});
	else {
		var query = [
		    'MATCH (f1:User) WHERE f1.uuid={senderUUID}',
		    'MATCH (f2:User) WHERE f2.uuid={receiverUUID}',
			'CREATE UNIQUE (f1)-[r:USER_FRIENDED_USER]->(f2)',
			'SET r.friendedOn = timestamp()',
			'RETURN r;'
		];
		neo.runQueryDeferred(query, data).then(function(){
			var deleteQuery = [
			    'MATCH (f1:User) WHERE f1.uuid={senderUUID}',
			    'MATCH (f2:User) WHERE f2.uuid={receiverUUID}',
				'MATCH (f1)-[r:USER_FRIENDREKT_USER]->(f2)',
				'DELETE r;'
			];
			neo.runQuery(deleteQuery, data, deferred);
		}).catch(deferred.reject);
	}
	return deferred.promise;
};

module.exports.rejectFriendRequest = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, ['senderUUID', 'receiverUUID']);
	if(validation !== true) deferred.reject({
		status:400, 
		message:validation
	});
	else {
		var query = [
		    'MATCH (f1:User) WHERE f1.uuid={senderUUID}',
		    'MATCH (f2:User) WHERE f2.uuid={receiverUUID}',
			'MATCH (f1)-[r:USER_FRIENDREKT_USER]->(f2)',
			'DELETE r;'
		];
		neo.runQuery(query, data, deferred);
	}

	return deferred.promise;
};