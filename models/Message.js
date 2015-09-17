var q = require('q');
var neo = require('../modules/neo');
var model = require('../modules/model-helper');

module.exports.get = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, ["userUUID1", "userUUID2"]);
	if(validation !== true) deferred.reject({
		status: 400,
		message: validation
	});
	else {
		var limit = data && data.limit > 0 ? ' LIMIT ' + data.limit : '';
		var query = [
			'MATCH (user1:User) WHERE user1.uuid={userUUID1}',
			'MATCH (user2:User) WHERE user2.uuid={userUUID2}',
			'OPTIONAL MATCH (user1)-[sent:USER_SENT_MESSAGE]->(user2)',
			'OPTIONAL MATCH (user2)-[received:USER_SENT_MESSAGE]->(user1)',
			'RETURN COLLECT(distinct {body: sent.body, createdAt: sent.createdAt}) as sent, COLLECT(distinct {body: received.body, createdAt: received.createdAt}) as received;'
		];
		
		neo.runQueryDeferred(query, data).then(function(respData){
			var sent = respData[0].sent;
			var received = respData[0].received;
			var userUUID1 = data.userUUID1;
			var userUUID2 = data.userUUID2;
			var retData = [];
			for(var i = 0; i < sent.length; i++){
				if(sent[i].body){
					sent[i].senderUUID = userUUID1;
					sent[i].receiverUUID = userUUID2;
					retData.push(sent[i]);
				}
			}
			for(var i = 0; i < received.length; i++){
				if(received[i].body){
					received[i].senderUUID = userUUID2;
					received[i].receiverUUID = userUUID1;
					retData.push(received[i]);
				}
			}
			retData.sort(function(msg1, msg2) { return msg1.createdAt > msg2.createdAt });
			deferred.resolve(retData);
		}).catch(deferred.reject);
	}
	return deferred.promise;
};

module.exports.getAll = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data, "userUUID");
	if(validation !== true) deferred.reject({
		status: 400,
		message: validation
	});
	else {
		var query = [
			'MATCH (user:User) WHERE user.uuid={userUUID}',
			'MATCH (user)-[r:USER_SENT_MESSAGE]-(receiver)',
			'RETURN distinct receiver' + (data && data.limit > 0 ? ' LIMIT ' + data.limit : '') + ';'
		];

		neo.runQueryDeferred(query, data).then(function(respData){
			var retData = [];
			for(var i = 0; i < respData.length; i++){
				retData.push(respData[i].receiver.data);
			}
			deferred.resolve(retData);
		}).catch(deferred.reject);
	}
	return deferred.promise;
};

module.exports.create = function(data){
	var deferred = q.defer();
	var validation = model.validateData(data);
	if(validation !== true) deferred.reject({
		status: 400,
		message: validation
	});
	else {
		var query = [
			'MATCH (sender:User) WHERE sender.uuid={senderUUID}',
			'MATCH (receiver:User) WHERE receiver.uuid={receiverUUID}',
			'CREATE (sender)-[r:USER_SENT_MESSAGE{body: {body}}]->(receiver)',
			'SET r.createdAt=timestamp()',
			'RETURN {body: r.body, createdAt: r.createdAt, receiverUUID: receiver.uuid, senderUUID: sender.uuid} as message;'
		];
		neo.runQueryDeferred(query, data).then(function(respData){
			deferred.resolve(respData[0].message);	
		}).catch(deferred.reject);
	}

	return deferred.promise;
};