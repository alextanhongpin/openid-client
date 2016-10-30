const fixedEncodeURIComponent = require('./encodeFormURI.js');
const encode = require('./encode-credentials.js');

const fullUrl = require('./url.js');
const request = require('request');
const querystring = require('querystring');
const crypto = require('crypto');

const AUTH_ENDPOINT = 'http://localhost:4000/oauth2/authorize';
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';
const INTROSPECT = 'http://localhost:4000/oauth2/introspect';
const TOKEN = 'http://localhost:4000/oauth2/token';
const REFRESH = 'http://localhost:4000/oauth2/token';



module.exports = function(params) {

	const options = Object.assign({
		response_type: 'code', 
		client_id: null,
		client_secret: null,
		redirect_uri: null,
		scope: 'openid public_profile user_posts'
	}, params);

	if (!options.client_id) {
		throw new Error({
			error: 'Invalid client id',
			error_description: 'Please provide a valid client id'
		});
	} else if (!options.client_secret) {
		throw new Error({
			error: 'Invalid client secret',
			error_description: 'Please provide a valid client secret'
		});
	} else if (!options.redirect_uri) {
		throw new Error({
			error: 'Invalid redirect url',
			error_description: 'Please provide a valid redirect url'
		});
	} else if (options.response_type !== 'code') {
		throw new Error({
			error: 'Invalid response type',
			error_description: 'Response type should be code'
		});		
	}


	const baseRequest = request.defaults({
  		headers: {
	  		'Authorization': 'Basic ' + encode(options.client_id, options.client_secret),
	  	}
	});

	const Oauth2 = {

		/*
		 * carries out the authorization request
		**/
		authorize(req, res, next) {
			const authorizationEndpoint = `${ AUTH_ENDPOINT }?${querystring.stringify(options)}`;
			res.redirect(authorizationEndpoint);
		},

		/*
		 * carries out the authorization callback request
		**/
		authorizeCallback(req, res, next) {



			console.log(req.query)

			// Error: Authorization Response
			if (req.query.error) {
				return res.status(400).json({
					error: req.query.error,
					error_description: req.query.error_description
				});
			}
			
			// Success: Authorization Response
			const { code, state } = req.query;

			baseRequest.post({
				url: TOKEN,
				form: {
				    grant_type: "authorization_code",
					code: code,
		            redirect_uri: REDIRECT_URI,
				},
				headers: {
			  		'user-agent': req.headers['user-agent']
			 	}
			}, (err, data, body) => {

				if (err) {
					return res.status(400).json(err)
				}
				if (!body) {
					return res.status(400).json({
						error: 'Invalid response',
						error_description: 'No response body is returned'
					});
				}
				const response = JSON.parse(body);
				console.log(response)

				if (response.error) {
					return res.status(400).json(response)
				} else if (response.access_token) {
					res.status(200).json(response);
					// res.locals.access_token = response.access_token;
					// res.locals.refresh_token = response.refresh_token;
					// res.render('home');
				}



			});
		},

		/*
		 * Inspect to check if the access token is valid
 		**/
		inspector(req, res, next) {

			console.log('oauth2:inspector')
			baseRequest.post({
				url: INTROSPECT,
				form: {
					token: req.body.token,
					token_type_hint: req.body.token_type_hint
				 //    grant_type: "authorization_code",
					// code: code,
		   //          redirect_uri: REDIRECT_URI,
				},
				headers: {
			  		'user-agent': req.headers['user-agent']
			 	}
			// request.post({
			// 	url: INTROSPECT,
			// 	headers: {
			// 		authorization: req.headers.authorization,
		 //        	'content-type': 'application/json',
		 //        	// should be of type x-www-form-urlencoded
		 //        	// should have basic authorization
		 //        	'user-agent': req.headers['user-agent']
			// 	},
			// 	body: JSON.stringify(req.body)
			}, (err, data, body) => {

				if (err) {
					return res.status(400).json(err);
				}
				return res.status(200).json(JSON.parse(body));
			});
		},

		token(req, res, next) {
			const scope = 'X01FS6';
			baseRequest.post(REFRESH, {
				form: {
					grant_type: 'refresh_token',
					refresh_token: req.body.refreshToken,
					scope: scope
				},
				headers: {
			  		'user-agent': req.headers['user-agent']
			 	}
			}, (err, httpResponse, body) => {
				if (err) {
					return res.status(400).json(err);
				}
				// var c1 = cookie.serialize('access_token', json.access_token, {httpOnly: true, path: '/', signed: true});
				// var c2 = cookie.serialize('refresh_token', json.refresh_token, {httpOnly: true, path: '/', signed: true});
				// res.setHeader('Set-Cookie', c1);
				// res.append('Set-Cookie', c2);

				//res.cookie('acccess_token', json)
				res.status(200).json(JSON.parse(body));
			});
		}
	}

	return Oauth2;
}


