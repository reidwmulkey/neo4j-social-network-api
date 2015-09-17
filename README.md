Purpose
==============
This is an example REST API for a social media site that uses neo4j and express. Some of the features you will find here are:

-Best practice of module creation for integration testing (actual integration testing performed using supertest-as-promised and mocha)

-Unit testing (using mocha)

-OAuth login 

-Friend lists, sending requests, and resolving requests

-Creating, updating, and searching users

-Sending messages between users

-Rotating access logs (using morgan)

-Best practice for storing oauth information, database information, etc. securely

-Serving lists of static information to be consumed on the front-end

The main purpose is to be used for mobile apps, so it does not use modules like passportJS to handle OAuth. It does so by taking the provider the user is using, their uuid for that providers site, and the accessToken retrieved from the oauth provider. This information is validated with each put and post request in the endpoints/middleware.js router. When implemented, HTTPS should be used to protect this information. Our current production setup uses NGINX as a load-balancer and to proxy HTTPS requests, something I can describe in detail if there is interest.

Setup
==============
Prior to running this application, you must setup a neo4j database. The community edition can be downloaded here for free: http://neo4j.com/download/. You can access their install guide here: http://neo4j.com/docs/stable/server-installation.html.

After setting up neo4j, you can replace the dbURL in modules/constants.js with the URL of your neo4j install:

	...
	var config = {
		dbURL: 'http://127.0.0.1:7474/db/data/', //This is the default URL
	...

You will also need to obtain facebook and google oauth app id's and secrets.

-Facebook developer console: https://developers.facebook.com/

-Google developer console: https://console.developers.google.com/project/_/apiui/credential

In order to install the dependencies, from the root of the project, run the following command in terminal or cmd:

	npm install

Tests
==============
In order to run the unit tests and integration tests, you must install mocha globally:
	
	npm install mocha -g

From the root of the project, you can run the tests	using:
	mocha test/int
	mocha test/unit

These tests use the test/stub/data.js functions, which create nodes with the label "Test". After the tests have completed, all relationships between nodes with the "Test" label are deleted, and then the "Test" nodes are deleted. I know this isn't exactly the best practice for testing, but I have yet to find something better for the REST API (unit testing is quite easy with the Java adapter). If you find something better, please send me a message :)

Strategic Vision
==============
I'm working on my own neo4j express adapter (found here: https://github.com/reidwmulkey/opin-neo) that will solve some frustrations I have had with neo4j thus far. Eventually I would like to transition this project to that adapter, and implement Socket.IO for messaging.