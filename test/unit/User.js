var assert = require("assert");
var User = require('../../models/User');
var neo = require('../../modules/neo');
var stub = require('../stub/data');
var q = require('q');
var uuids = [];

describe('User', function(){
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
			return stub.createTestUser('testUser4', "Zizzak", "Quambo", "All hail the overlord")
		})
		.then(function(){
			return stub.createTestUser('testUser5', "zxcv", "uiop", "zxcvuiop")
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
		}).catch(function(e){
			console.error(e);
			throw "unable to clean up testing data";
		});
	});

	describe('get()', function(){
		it('should fail with invalid parameters', function(done){
    		User.get({ something: "bad" }).then(function(data){
    			done(data);
    		}).catch(function(error){
    			done();
    		});
    	});

    	it('should fail with empty data', function(done){
    		User.get({}).then(function(data){
    			done(data);
    		}).catch(function(error){
    			done();
    		});
    	});

		describe('all', function(){
	    	it('should get all with no parameters provided', function(done){
	    		User.getAll().then(function(data){
	    			assert.equal(data.length, 5);
	    			done();
	    		}).catch(function(error){
	    			done(error);
	    		});
	    	});
		});

		describe('single', function(){
			it('should pass with valid uuid', function(done){
	    		User.get({
	    			userUUID: "testUser1"
	    		}).then(function(data){
	    			assert.equal(data.uuid, "testUser1");
	    			assert.equal(data.firstName, "Johnny");
	    			assert.equal(data.lastName, "Climbington");
	    			assert.equal(data.profile, "This is my profile");
	    			done();
	    		}).catch(function(error){
	    			done(error);
	    		});
	    	});

	    	it('should return {} with invalid uuid', function(done){
	    		User.get({ userUUID: "asdfasdf" }).then(function(data){
	    			assert.equal(data, {});
	    			done();
	    		}).catch(function(error){
	    			done();
	    		});
	    	});
		});
	});

	describe('update()', function(){
	    it('should update with valid data', function(done){
			User.update({
				userUUID: "testUser4",
				firstName: "Zizzaks",
				lastName: "Quambos",
				profile: "International Climbing sensation"
			}).then(function(data){
				assert.equal(data.uuid, "testUser4");
				assert.equal(data.firstName, "Zizzaks");
				assert.equal(data.lastName, "Quambos");
				assert.equal(data.profile, "International Climbing sensation");
				done();
			}).catch(function(e){
				done(e);
			});
	    });

	    it('should fail with valid data but invalid uuid', function(done){
			User.update({
				userUUID: "asdfasdf",
				firstName: "Zizzaks",
				lastName: "Quambos",
				profile: "International Climbing sensation"
			}).then(function(data){
				done(data);
			}).catch(function(e){
				done();
			});
	    });

	    it('should fail with invalid data', function(done){
			var query = User.update({
				senderUUID:"asdfasdf"
			}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with no data', function(done){
			var query = User.update().then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});

	describe('search()', function(){
		describe('all', function(){
			it('should return all users with all styles selected and no search text', function(done){
		    	User.search({}).then(function(data){
		    		assert.equal(data.length, 5);
		    		assert.equal(data[0].uuid, "testUser1");
		    		assert.equal(data[0].firstName, "Johnny");
		    		assert.equal(data[0].lastName, "Climbington");
		    		assert.equal(data[0].profile, "This is my profile");
		    		assert.equal(data[1].uuid, "testUser2");
		    		assert.equal(data[1].firstName, "Sally");
		    		assert.equal(data[1].lastName, "Climbington");
		    		assert.equal(data[1].profile, "Yo I am sally");
		    		assert.equal(data[2].uuid, "testUser3");
		    		assert.equal(data[2].firstName, "Johnny");
		    		assert.equal(data[2].lastName, "Johnson");
		    		assert.equal(data[2].profile, "This is my profile");
		    		assert.equal(data[3].uuid, "testUser4");
		    		assert.equal(data[3].firstName, "Zizzaks");
		    		assert.equal(data[3].lastName, "Quambos");
		    		assert.equal(data[3].profile, "International Climbing sensation");
		    		assert.equal(data[4].uuid, "testUser5");
		    		assert.equal(data[4].firstName, "zxcv");
		    		assert.equal(data[4].lastName, "uiop");
		    		assert.equal(data[4].profile, "zxcvuiop");
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });

		    it('should return all with firstName entered but null', function(done){
		    	User.search({firstName:null}).then(function(data){
		    		assert.equal(data.length, 5);
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });
		    it('should return all with lastName entered but null', function(done){
		    	User.search({lastName:null}).then(function(data){
		    		assert.equal(data.length, 5);
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });
		});

	    describe("first name", function(){
	    	it('should return both Johnnys with firstname filter', function(done){
		    	User.search({firstName:"Johnny"}).then(function(data){
		    		assert.equal(data.length, 2);
		    		assert.equal(data[0].uuid, "testUser1");
		    		assert.equal(data[0].firstName, "Johnny");
		    		assert.equal(data[0].lastName, "Climbington");
		    		assert.equal(data[0].profile, "This is my profile");
		    		assert.equal(data[1].uuid, "testUser3");
		    		assert.equal(data[1].firstName, "Johnny");
		    		assert.equal(data[1].lastName, "Johnson");
		    		assert.equal(data[1].profile, "This is my profile");
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });

		    it('should return all with first name filter of "y"', function(done){
		    	User.search({firstName:"y"}).then(function(data){
		    		assert.equal(data.length, 3);
		    		assert.equal(data[0].uuid, "testUser1");
		    		assert.equal(data[0].firstName, "Johnny");
		    		assert.equal(data[0].lastName, "Climbington");
		    		assert.equal(data[0].profile, "This is my profile");
		    		assert.equal(data[1].uuid, "testUser2");
		    		assert.equal(data[1].firstName, "Sally");
		    		assert.equal(data[1].lastName, "Climbington");
		    		assert.equal(data[1].profile, "Yo I am sally");
		    		assert.equal(data[2].uuid, "testUser3");
		    		assert.equal(data[2].firstName, "Johnny");
		    		assert.equal(data[2].lastName, "Johnson");
		    		assert.equal(data[2].profile, "This is my profile");
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });

		    it('should return all with first name filter of "Y"', function(done){
		    	User.search({firstName:"Y"}).then(function(data){
		    		assert.equal(data.length, 3);
		    		assert.equal(data[0].uuid, "testUser1");
		    		assert.equal(data[0].firstName, "Johnny");
		    		assert.equal(data[0].lastName, "Climbington");
		    		assert.equal(data[0].profile, "This is my profile");
		    		assert.equal(data[1].uuid, "testUser2");
		    		assert.equal(data[1].firstName, "Sally");
		    		assert.equal(data[1].lastName, "Climbington");
		    		assert.equal(data[1].profile, "Yo I am sally");
		    		assert.equal(data[2].uuid, "testUser3");
		    		assert.equal(data[2].firstName, "Johnny");
		    		assert.equal(data[2].lastName, "Johnson");
		    		assert.equal(data[2].profile, "This is my profile");
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });

		    it('should return no one with first name filter of "Incredibly Complicated Name"', function(done){
		    	User.search({firstName:"Incredibly Complicated Name"}).then(function(data){
		    		assert.equal(data.length, 0);
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });
	    });

	    describe("last name", function(){
	    	it('should return both Climbingtons with lastname filter', function(done){
		    	User.search({lastName:"Climbington"}).then(function(data){
		    		assert.equal(data.length, 2);
		    		assert.equal(data[0].uuid, "testUser1");
		    		assert.equal(data[0].firstName, "Johnny");
		    		assert.equal(data[0].lastName, "Climbington");
		    		assert.equal(data[0].profile, "This is my profile");
		    		assert.equal(data[1].uuid, "testUser2");
		    		assert.equal(data[1].firstName, "Sally");
		    		assert.equal(data[1].lastName, "Climbington");
		    		assert.equal(data[1].profile, "Yo I am sally");
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });

		    it('should return all with lastname filter of "on"', function(done){
		    	User.search({lastName:"on"}).then(function(data){
		    		assert.equal(data.length, 3);
		    		assert.equal(data[0].uuid, "testUser1");
		    		assert.equal(data[0].firstName, "Johnny");
		    		assert.equal(data[0].lastName, "Climbington");
		    		assert.equal(data[0].profile, "This is my profile");
		    		assert.equal(data[1].uuid, "testUser2");
		    		assert.equal(data[1].firstName, "Sally");
		    		assert.equal(data[1].lastName, "Climbington");
		    		assert.equal(data[1].profile, "Yo I am sally");
		    		assert.equal(data[2].uuid, "testUser3");
		    		assert.equal(data[2].firstName, "Johnny");
		    		assert.equal(data[2].lastName, "Johnson");
		    		assert.equal(data[2].profile, "This is my profile");
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });

		    it('should return all with lastname filter of "ON"', function(done){
		    	User.search({lastName:"ON"}).then(function(data){
		    		assert.equal(data.length, 3);
		    		assert.equal(data[0].uuid, "testUser1");
		    		assert.equal(data[0].firstName, "Johnny");
		    		assert.equal(data[0].lastName, "Climbington");
		    		assert.equal(data[0].profile, "This is my profile");
		    		assert.equal(data[1].uuid, "testUser2");
		    		assert.equal(data[1].firstName, "Sally");
		    		assert.equal(data[1].lastName, "Climbington");
		    		assert.equal(data[1].profile, "Yo I am sally");
		    		assert.equal(data[2].uuid, "testUser3");
		    		assert.equal(data[2].firstName, "Johnny");
		    		assert.equal(data[2].lastName, "Johnson");
		    		assert.equal(data[2].profile, "This is my profile");
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });

		    it('should return no one with last name filter of "Incredibly Complicated Name"', function(done){
		    	User.search({lastName:"Incredibly Complicated Name"}).then(function(data){
		    		assert.equal(data.length, 0);
		    		done();
		    	}).catch(function(error){
		    		done(error);
		    	});
		    });
	    });

		describe('errors', function(){
			it('should fail with no text entered', function(done){
		    	User.search().then(function(data){
		    		done(data);
		    	}).catch(function(error){
		    		done();
		    	});
		    });
		});
	});

	describe('create()', function(){
	    it('should pass with valid data', function(done){
			User.create({
				firstName: "Johnny",
				lastName: "Climbington",
				userUUID: "facebook-123",
				profile: "This is my profile"
			}).then(function(returnedUUID){
				uuids.push(returnedUUID);
				assert.equal(returnedUUID, "facebook-123");
				done();
			}).catch(function(e){
				done(e);
			});
	    });

	    it('should fail with valid data but taken uuid', function(done){
			User.create({
				firstName: "Sally",
				lastName: "Climbington",
				userUUID: "facebook-123",
				profile: "International climbing sensation"
			}).then(function(returnedUUID){
				done(returnedUUID);
			}).catch(function(error){
				done();
			});
	    });

	    it('should fail with invalid data', function(done){
			var query = User.create({
				senderUUID:"asdfasdf"
			}).then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });

	    it('should fail with no data', function(done){
			var query = User.create().then(function(data){
				done(data);
			}).catch(function(){
				done();
			});
	    });
  	});
});