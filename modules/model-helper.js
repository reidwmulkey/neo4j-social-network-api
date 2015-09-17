module.exports.validateData = function(data, keys){
	if(!data) return "No data received.";
	if(Array.isArray(keys)){
		for(var i = 0; i < keys.length; i++)
			if(!(data.hasOwnProperty(keys[i]) && data[keys[i]] !== null)) return "Expected parameter: " + keys[i];	
	} else if(keys){
		if(!(data.hasOwnProperty(keys) && data[keys] !== null)) return "Expected parameter: " + keys;	
	}
	return true;
};