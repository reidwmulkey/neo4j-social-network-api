var q = require('q');
var assert = require("assert");
var request = require('supertest-as-promised');
var neo = require('../../modules/neo');
var stub = require('../stub/data');
var oauth = require('../stub/oauth');
var app = require('../../main')(oauth);
var uuids = [];

describe('users', function(){
	before(function(done){
		neo.setup()
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

	describe('login()', function(){
		it('should pass with valid data', function(done){
	    	request(app)
			.post("/users/login")
			.set("userUUID", "facebook-testUser1")
			.set("accessToken", "validtoken")
			.expect(200)
			.then(function (res) {
				assert.equal("facebook-testUser1", res.text);
				done();
			})
			.catch(done);
	    });

		it('should fail with userUUID invalid accessToken valid', function(done){
			request(app)
			.post("/users/login")
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
			.post("/users/login")
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
			.post("/users/login")
			.set("accessToken", "faketoken")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with userUUID valid & no accessToken', function(done){
	    	request(app)
			.post("/users/login")
			.set("userUUID", "facebook-testUser1")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });

	    it('should fail with no data provided', function(done){
	    	request(app)
			.post("/users/login")
			.expect(401)
			.then(function(data){
				assert.equal("Could not validate credentials from Social Media login.", data.text);
				done();
			});
	    });
  	});
});