module.exports.handleError = function(res, error){
	if(error.statusCode){
		res.status(error.statusCode).send(error.message);
	} else {
		res.status(500).send(error);
	}
};