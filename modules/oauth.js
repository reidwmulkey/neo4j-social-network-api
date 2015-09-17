var https = require('https');
var request = require('request');
var q = require('q');
var config = require('./config');
var appIds = config.appIds;
var facebookAuthToken;

module.exports.error = function(res){
	res.status(401).send("Could not validate credentials from Social Media login.");
}

//headers:
//provider - string of the provider they used to login
//accessToken - the access token the user received from the provider
//resolves with "<provider>-<user_id>", which can be used for the userUUID
module.exports.login = function(req){
	var deferred = q.defer();

	var provider = req.get('provider');
	var providerCall;
	// console.log('logging in with provider: ' + provider);

	if(provider === 'facebook') providerCall = makeFacebookCall;
	else if(provider === 'google') providerCall = makeGoogleCall;
	
	providerCall && providerCall(req.get('accessToken')).then(function(user_id){
		deferred.resolve(provider + '-' + user_id);
	}).catch(function(error){
		deferred.reject(error);
	});
	providerCall || deferred.reject('Invalid provider.');

	return deferred.promise;
};

//headers:
//userUUID - userUUID of the user being validated
//accessToken - access token from the provider
//validates the access token was given by the provider for the user
module.exports.validate = function(req){
	var deferred = q.defer();

	var uuid = req.get('userUUID');
	var provider = uuid.substring(0,uuid.indexOf('-'));
	var id = uuid.substring(uuid.indexOf('-'));
	var providerCall;

	if(provider === 'facebook') providerCall = makeFacebookCall;
	else if(provider === 'google') providerCall = makeGoogleCall;
	providerCall && providerCall(req.get('accessToken')).then(function(user_id){
		if(id === user_id)
			deferred.resolve(user_id);
		else
			deferred.reject('This access token was not granted to the userUUID: ' + uuid);
	}).catch(function(error){
		deferred.reject(error);
	});
	providerCall || deferred.reject('Invalid provider.');
	return deferred.promise;
};

//function called in order to verify the accessToken of a user is valid for a google login
function makeGoogleCall(accessToken){
	var deferred = q.defer();
	var options = {
	  host: 'www.googleapis.com',
	  path: '/oauth2/v1/tokeninfo?access_token=' + accessToken + "&client_id=" + appIds.google.appId + "&client_secret=" + appIds.google.appSecret
	};

	var req = https.get(options, function(res) {
	  // console.log('HEADERS: ' + JSON.stringify(res.headers));

	  var bodyChunks = [];
	  res.on('data', function(chunk) {
	    bodyChunks.push(chunk);
	  }).on('end', function() {
	  	// console.log(Buffer.concat(bodyChunks).toString());
	    var body = JSON.parse(Buffer.concat(bodyChunks).toString());
	    if(body && body.expires_in > 0){
	    	deferred.resolve(body.user_id);
	    }
	    else
	    	deferred.reject(body);
	  })
	});

	req.on('error', function(e) {
	  deferred.reject(e);
	});

	req.end();
	return deferred.promise;
};

//function called in order to verify the accessToken of a user is valid for a facebook login
function makeFacebookCall(accessToken){
	var deferred = q.defer();

	var options = {
	  host: 'graph.facebook.com',
	  path: '/debug_token?input_token=' + accessToken + '&access_token=' + facebookAuthToken
	};

	var req = https.get(options, function(res) {
	  // console.log('STATUS: ' + res.statusCode);
	  // console.log('HEADERS: ' + JSON.stringify(res.headers));

	  var bodyChunks = [];
	  res.on('data', function(chunk) {
	    bodyChunks.push(chunk);
	  }).on('end', function() {
	    var body = JSON.parse(Buffer.concat(bodyChunks).toString());
	    console.log('BODY: ', body.data);
	    if(body.data && body.data.is_valid){
	    	deferred.resolve(body.data.user_id);
	    }
	    else
	    	deferred.reject(body);
	  })
	});

	req.on('error', function(e) {
	  deferred.reject(e);
	});

	req.end();
	return deferred.promise;
};

//global function called to get the authorization token for the server
module.exports.getFacebookToken = function(){
	console.log('getting facebook token');
	var options = {
	  host: 'graph.facebook.com',
	  path: '/oauth/access_token?grant_type=client_credentials&client_id=' + appIds.facebook.appId + '&client_secret=' + appIds.facebook.appSecret 
	};

	var req = https.get(options, function(res) {
	  var bodyChunks = [];
	  res.on('data', function(chunk) {
	    bodyChunks.push(chunk);
	  }).on('end', function() {
	    var body = Buffer.concat(bodyChunks);
	    facebookAuthToken = body.toString();
	    facebookAuthToken = facebookAuthToken.substring(facebookAuthToken.indexOf('access_token=') + ('access_token=').length);
	    console.log('facebookAuthToken retrieved.');
	  })
	});

	req.on('error', function(e) {
	  console.log('ERROR: ' + e.message);
	});

	req.end();
};