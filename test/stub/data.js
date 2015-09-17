var q = require('q');
var neo = require('../../modules/neo');

////////////////////////////////////////
// CREATING TEST NODES
////////////////////////////////////////
module.exports.createTestUser = function(uuid, fname, lname, profile){
	if(!fname) fname = "Johnny";
	if(!lname) lname = "Climbington";
	if(!profile) profile = "This is my profile";
	return neo.runQueryDeferred([ 'MERGE (n:User:Test {uuid: {uuid}, firstName: {fname}, lastName: {lname}, profile: {profile}})' ], {uuid: uuid, fname: fname, lname: lname, profile: profile});
};

////////////////////////////////////////
//CREATING TEST RELATIONSHIPS
////////////////////////////////////////
module.exports.createTestFriendship = function(userUUID1, userUUID2){	
	return neo.runQueryDeferred([ 'MATCH (f1:User:Test) WHERE f1.uuid={userUUID1}', 'MATCH (f2:User:Test) WHERE f2.uuid={userUUID2}', 'CREATE UNIQUE (f1)-[r:USER_FRIENDED_USER]->(f2)'], {userUUID1: userUUID1, userUUID2: userUUID2});		
};

module.exports.createTestFriendRequest = function(userUUID1, userUUID2){	
	return neo.runQueryDeferred([ 'MATCH (f1:User:Test) WHERE f1.uuid={userUUID1}', 'MATCH (f2:User:Test) WHERE f2.uuid={userUUID2}', 'CREATE UNIQUE (f1)-[r:USER_FRIENDREKT_USER]->(f2)'], {userUUID1: userUUID1, userUUID2: userUUID2});		
};

module.exports.createTestMessage = function(userUUID1, userUUID2, body){
	return neo.runQueryDeferred([
	    'MATCH (u1:User:Test) WHERE u1.uuid={userUUID1}',
	    'MATCH (u2:User:Test) WHERE u2.uuid={userUUID2}',
		'CREATE (u1)-[rel:USER_SENT_MESSAGE {body:{body}}]->(u2)',
		'SET rel.createdAt=timestamp()',
	], {
		userUUID1: userUUID1,
		userUUID2: userUUID2,
		body: body
	});		
};

////////////////////////////////////////
//DELETING TEST RELATIONSHIPS
////////////////////////////////////////
module.exports.deleteTestRelationships = function(){
	console.log('deleting rels');
	return neo.runQueryDeferred([
	    'MATCH (n1:Test)',
	    'MATCH (n1)-[r]-(n2)',
	    'DELETE r;'
	], null);
};

module.exports.deleteTestNodes = function(){
	console.log('deleting nodes');
	return neo.runQueryDeferred([
	    'MATCH (n:Test)',
	    'DELETE n;'
	], null);
};

module.exports.deleteCreatedNodes = function(uuids){
	if(uuids.length === 0){
		var deferred = q.defer();
		deferred.resolve();
		return deferred.promise;
	}
	else {
		var deletes = [];
		console.log('deleting (' + uuids.length + ') created nodes.');
		for(var i = 0; i < uuids.length; i++){
			deletes.push(neo.runQueryDeferred([
				'MATCH (n) WHERE n.uuid={uuid}',
			    'DELETE n;'
			], {uuid: uuids[i]}));
		}
		return q.all(deletes);
	}
};