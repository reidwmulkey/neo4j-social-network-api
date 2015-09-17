var assert = require("assert");
var Message = require('../../models/Message');
var neo = require('../../modules/neo');
var stub = require('../stub/data');
var q = require('q');
 
describe('Message', function(){
	before(function(done){
		neo.setup()
		.then(function(){
			return q.all([
				stub.createTestUser("testUser1"),
				stub.createTestUser("testUser2"),
				stub.createTestUser("testUser3")
			])
		})
		.then(function(){
			return stub.createTestMessage("testUser1", "testUser2", "hayyy")
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
		}).catch(function(error){
			done(error);
		});
	});

	describe('create()', function(){
	    it('should pass with valid data', function(done){
			Message.create({
				senderUUID: "testUser1",
				receiverUUID: "testUser2",
				body: "gogo automated testing"
			}).then(function(){
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	    it('should fail with valid sender invalid receiver', function(done){
			var query = Message.create({
				senderUUID:"testUser1",
				receiverUUID:"asdfasdf"
			}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with invalid data', function(done){
			var query = Message.create({
				senderUUID:"asdfasdf"
			}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with no data', function(done){
			var query = Message.create().then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});
	
  	describe('getAll()', function(){
	  	it('should pass when a valid userUUID provided and user has messages', function(done){
			var query = Message.getAll({userUUID: "testUser1"}).then(function(respData){
				assert.equal(respData.length, 1);
	  			assert.equal(respData[0].firstName, "Johnny");
	  			assert.equal(respData[0].lastName, "Climbington");
	  			assert.equal(respData[0].profile, "This is my profile");
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	    it('should pass when a valid userUUID provided and user has no messages', function(done){
			var query = Message.getAll({userUUID: "testUser3"}).then(function(respData){
	  			assert.equal(respData.length, 0);
  				done();
			}).catch(function(error){
				done(error);
			});
	    });

	  	it('should return [] with an invalid userUUID provided', function(done){
			var query = Message.getAll({userUUID:"as;dflkjasdfjasdf"}).then(function(data){
				assert.equal(data.length, 0);
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	  	it('should fail with a null userUUID provided', function(done){
			var query = Message.getAll({userUUID:null}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});

	describe('get()', function(){
	  	it('should pass when valid uuid\'s provided and there are messages', function(done){
			var query = Message.get({userUUID1: "testUser1", userUUID2: "testUser2"}).then(function(respData){
				assert.equal(respData.length, 2);
				assert.equal(respData[0].body, "hayyy");
				assert.equal(respData[1].body, "gogo automated testing");
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	    it('should pass when valid uuid\'s provided and there are no messages', function(done){
			var query = Message.get({userUUID1: "testUser3", userUUID2: "testUser2"}).then(function(respData){
	  			assert.equal(respData.length, 0);
  				done();
			}).catch(function(error){
				done(error);
			});
	    });

	  	it('should return [] with invalid uuid\'s provided', function(done){
			var query = Message.get({userUUID1:"as;dflkjasdfjasdf", userUUID2:"qwerqwe"}).then(function(data){
				assert.equal(data.length, 0);
				done();
			}).catch(function(error){
				done(error);
			});
	    });

	  	it('should fail with a null uuid\'s provided', function(done){
			var query = Message.get({userUUID1:null, userUUID2:null}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});
});