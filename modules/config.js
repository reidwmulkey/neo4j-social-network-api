//This file is used to store the private information of the API (oauth app info, database passwords, etc.)
//This file should be added to the .gitignore so that you can maintain a server copy and your local development copy
//and production passwords/oauth id's & secrets are never stored in a repository.
module.exports = (function(){
	var config = {
		dbURL: 'http://127.0.0.1:7474/db/data/', //This is the default URL
		// dbURL: 'http://username:login@127.0.0.1:7474/db/data/' //if you have a password added to your database
		appIds: {
			google: {
				appId: "app id from google",
				appSecret: "app secret from google"
			},
			facebook: {
				appId: "app id from facebook",
				appSecret: "app secret from facebook"
			}
		}
	};

	return config;
})();