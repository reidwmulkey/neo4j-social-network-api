var q = require('q');
var assert = require("assert");
var request = require('supertest-as-promised');
var neo = require('../../modules/neo');
var stub = require('../stub/data');
var oauth = require('../stub/oauth');
var app = require('../../main')(oauth);
var uuids = [];

var friendReq = {
	senderUUID: 'testUser1',
	receiverUUID: 'testUser2'
};

describe('middleware', function(){
	before(function(done){
		neo.setup()
		.then(function(){
			return q.all([
				stub.createTestUser('testUser1')
			])
		})
		.then(function(){
			return q.all([
				stub.createTestUser('testUser2', 'Sally', null, 'Yo I am sally')
			])
		})
		.then(function(){
			return q.all([
				stub.createTestUser('testUser3', null, "Johnson")
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
			return stub.deleteCreatedNodes(uuids)
		})
		.then(function(){
			console.log('cleaned up testing data.');
			done();
		}).catch(function(error){
			done(error);
		});
	});

	describe('post', function(){
		it('should search with valid oauth', function(done){
			request(app)
			.post("/users/search")
            .send({firstName: "John"})
			.set("userUUID", "facebook-testUser1")
			.set("accessToken", "validtoken")
			.expect(200)
			.then(function (res) {
				assert.equal(res.body.length, 2);
				done();
			})
			.catch(function(error){
				done(error);
			});
		});

	    it('should fail with userUUID invalid accessToken valid', function(done){
			request(app)
			.post("/users/search")
            .send({firstName: "John"})
			.set("userUUID", "google-testUser1")
			.set("accessToken", "validtoken")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with userUUID valid accessToken invalid', function(done){
	    	request(app)
			.post("/users/search")
            .send({firstName: "John"})
			.set("userUUID", "facebook-testUser1")
			.set("accessToken", "faketoken")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with no userUUID & accessToken valid', function(done){
	    	request(app)
			.post("/users/search")
            .send({firstName: "John"})
			.set("accessToken", "faketoken")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with userUUID valid & no accessToken', function(done){
	    	request(app)
			.post("/users/search")
            .send({firstName: "John"})
			.set("userUUID", "facebook-testUser1")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with no data provided', function(done){
	    	request(app)
			.post("/users/search")
            .send({firstName: "John"})
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });
  	});

	describe('put', function(){
		it('should create with valid oauth', function(done){
			request(app)
			.put("/friends/request")
            .send(friendReq)
			.set("userUUID", "facebook-testUser1")
			.set("accessToken", "validtoken")
			.expect(200)
			.then(function (res) {
				assert.ok(res.body.sentOn);
				done();
			})
			.catch(function(error){
				done(error);
			});
		});

	    it('should fail with userUUID invalid accessToken valid', function(done){
			request(app)
			.put("/friends/request")
            .send(friendReq)
			.set("userUUID", "google-testUser1")
			.set("accessToken", "validtoken")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with userUUID valid accessToken invalid', function(done){
	    	request(app)
	    	.put("/friends/request")
            .send(friendReq)
			.set("userUUID", "facebook-testUser1")
			.set("accessToken", "faketoken")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with no userUUID & accessToken valid', function(done){
	    	request(app)
	    	.put("/friends/request")
            .send(friendReq)
			.set("accessToken", "faketoken")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with userUUID valid & no accessToken', function(done){
	    	request(app)
	    	.put("/friends/request")
            .send(friendReq)
			.set("userUUID", "facebook-testUser1")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with no data provided', function(done){
	    	request(app)
	    	.put("/friends/request")
            .send(friendReq)
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });
  	});
});