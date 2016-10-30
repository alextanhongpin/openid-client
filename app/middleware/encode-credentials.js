module.exports = function encode(clientId, clientSecret) {
	// client credentials are encoded in the format client_id:client_secret
	return new Buffer(`${ clientId }:${ clientSecret }`).toString('base64');
}