var q = require('q');

module.exports.error = function(res){
	res.status(401).send("Could not validate credentials from Social Media login.");
}

module.exports.login = function(req){
	var deferred = q.defer();
	if((req.get("userUUID") === "facebook-testUser1") && (req.get("accessToken") === "validtoken"))
		deferred.resolve("facebook-testUser1");
	else
		deferred.reject({
			statusCode: 401,
			message: "Could not validate credentials from Social Media login."
		});

	return deferred.promise;
};

module.exports.validate = function(req){
	var deferred = q.defer();
	var userUUID = req.get("userUUID");
	var accessToken = req.get("accessToken");
	if((userUUID === "facebook-testUser1") && (accessToken === "validtoken"))
		deferred.resolve("facebook-testUser1");
	else if((userUUID === "google-testUser1") && (accessToken === "validtoken"))
		deferred.reject({
			statusCode: 401,
			message: "This access token was not granted to the userUUID: " + req.get("userUUID")
		});
	else
		deferred.reject({
			statusCode: 401,
			message: "Could not validate credentials from Social Media login."
		});

	return deferred.promise;
};