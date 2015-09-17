//This is where you store constants used throughout the application, and any
//static information you want the API to serve, e.g., a list of countries that
//the user can select in a dropdown.
module.exports = (function(){
	var globals = {
		someFileURL: "http://www.google.com/",
		countries: [
			'America',
			'Germany',
			'France',
			'Russia'
		]
	};

	//The benefit of using this self-executing function schema is that the var "globals"
	//cannot be modified anywhere in your code, i.e., you can have multiple versions of 
	//the constants.js module around in your code and they are all guaranteed to retrieve
	//the same information.
	return globals;
})();