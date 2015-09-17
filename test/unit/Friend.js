var assert = require("assert");
var Friend = require('../../models/Friend');
var neo = require('../../modules/neo');
var stub = require('../stub/data');
var q = require('q');

describe('Friend', function(){
	before(function(done){
		neo.setup()
		.then(function(){
			return q.all([
				stub.createTestUser("testUser1"),
				stub.createTestUser("testUser2"),
				stub.createTestUser("testUser3"),
				stub.createTestUser("testUser4"),
				stub.createTestUser("testReceiver1"),
				stub.createTestUser("testReceiver2"),
				stub.createTestUser("testReceiver3")
			])
		}).then(function(){
			return q.all([
				stub.createTestFriendship("testUser1", "testReceiver3"),
				stub.createTestFriendRequest("testReceiver2", "testReceiver3"),
				stub.createTestFriendRequest("testReceiver2", "testReceiver1"),
				stub.createTestFriendRequest("testUser4", "testUser4")
			])
		})
		.then(function(){
			console.log('generated testing data.');
			done();
		}).catch(function(error) {
			done(error);
		});
	});

	after(function(done){ 	
		stub.deleteTestRelationships()
		.then(stub.deleteTestNodes)
		.then(function(){
			console.log('cleaned up testing data.');
			done();
		}).catch(function(e){
			console.error(e);
			throw "unable to clean up testing data";
		});
	});

	describe('sendFriendRequest()', function(){
	    it('should pass with valid data', function(done){
			Friend.sendFriendRequest({
				senderUUID: "testUser1",
				receiverUUID: "testReceiver1"
			}).then(function(){
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	    it('should fail with invalid data', function(done){
			var query = Friend.sendFriendRequest({
				senderUUID:"testUser1"
			}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with no data', function(done){
			var query = Friend.sendFriendRequest().then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});

  	describe('rejectFriendRequest()', function(){
	    it('should pass with valid data', function(done){
			Friend.rejectFriendRequest({
				senderUUID: "testUser1",
				receiverUUID: "testReceiver1"
			}).then(function(){
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	    it('should fail with invalid data', function(done){
			var query = Friend.rejectFriendRequest({
				senderUUID:"testUser1"
			}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with no data', function(done){
			var query = Friend.rejectFriendRequest().then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});

  	describe('resolveFriendRequest()', function(){
	    it('should pass with valid data', function(done){
			Friend.resolveFriendRequest({
				senderUUID: "testUser3",
				receiverUUID: "testUser4"
			}).then(function(){
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	    it('should fail with invalid data', function(done){
			var query = Friend.resolveFriendRequest({
				senderUUID:"testUser1"
			}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with no data', function(done){
			var query = Friend.resolveFriendRequest().then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});

  	describe('get()', function(){
	  	it('should pass when a valid userUUID provided and user has friends', function(done){
			var query = Friend.getFriends({userUUID: "testReceiver3"}).then(function(respData){
	  			assert.equal(respData[0].firstName, "Johnny");
	  			assert.equal(respData[0].lastName, "Climbington");
	  			assert.equal(respData[0].profile, "This is my profile");
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	    it('should pass when a valid userUUID provided and user has no friends', function(done){
			var query = Friend.getFriends({userUUID: "testReceiver2"}).then(function(respData){
	  			assert.equal(respData.length, 0);
  				done();
			}).catch(function(){
				done(error);
			});
	    });

	  	it('should return [] with an invalid userUUID provided', function(done){
			var query = Friend.getFriends({userUUID:"as;dflkjasdfjasdf"}).then(function(data){
				assert.equal(data.length, 0);
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	  	it('should fail with a null userUUID provided', function(done){
			var query = Friend.getFriends({userUUID:null}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with no userUUID provided', function(done){
			var query = Friend.getFriends().then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});

	describe('getFriendRequests()', function(){
	  	it('should pass when a valid userUUID provided and user has friend requests', function(done){
			var query = Friend.getFriendRequests({userUUID: "testReceiver2"}).then(function(respData){
				if(respData[0].uuid === "testReceiver3" && respData[1].uuid === "testReceiver1"){
					var temp = respData[0];
					respData[0] = respData[1];
					respData[1] = temp;
				}
	  			assert.equal(respData[0].uuid, "testReceiver1");
	  			assert.equal(respData[0].firstName, "Johnny");
	  			assert.equal(respData[0].lastName, "Climbington");
	  			assert.equal(respData[0].profile, "This is my profile");
	  			assert.equal(respData[1].uuid, "testReceiver3");
	  			assert.equal(respData[1].firstName, "Johnny");
	  			assert.equal(respData[1].lastName, "Climbington");
	  			assert.equal(respData[1].profile, "This is my profile");
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	    it('should pass when a valid userUUID provided and user has no friends', function(done){
			var query = Friend.getFriendRequests({userUUID: "testUser2"}).then(function(respData){
	  			assert.equal(respData.length, 0);
  				done();
			}).catch(function(){
				done(error);
			});
	    });

	  	it('should return [] with an invalid userUUID provided', function(done){
			var query = Friend.getFriendRequests({userUUID:"as;dflkjasdfjasdf"}).then(function(data){
				assert.equal(data.length, 0);
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	  	it('should fail with a null userUUID provided', function(done){
			var query = Friend.getFriendRequests({userUUID:null}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with no userUUID provided', function(done){
			var query = Friend.getFriendRequests().then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});
});