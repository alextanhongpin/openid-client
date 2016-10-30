

const express = require('express');
const app = express();

const querystring = require('querystring');
const bodyParser = require('body-parser');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');

const OAuth2 = require('./app/middleware/oauth2.js');

const oauth2 = OAuth2({
	client_id: 'b692c6e43d58ad3befe9ca6b1e30ef73',
	client_secret: 'ff5138fd16782b85c0af7173e262a7df$dd106704ae26d0005ea02e81b255fe32$fadb76500f1dcb9db09463f543ae4634ff419a0d',
	redirect_uri: 'http://localhost:3000/oauth/callback',
});

	


app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/oauth2/token', oauth2.token);
app.post('/oauth2/inspector', oauth2.inspector);
app.get('/oauth2/authorize', oauth2.authorize);
app.get('/oauth/callback', oauth2.authorizeCallback);

app.get('/home', auth, (req, res) => {
	res.render('home');
});




/*
 * Authorization Request
**/

app.get('/register', (req, res) => {
	// carry out authorization after registration
	const referrer = req.query.referrer + 'authorize';
	const url = querystring.escape(referrer);
	const original_url = querystring.escape(req.query.referrer);
	res.redirect('http://localhost:4000/register?referrer=' + url);
});


function auth(req, res, next) {
	next();
}

app.get('/', (req, res) => {

	res.render('index');
});

app.listen(3000, () => {
	console.log('listening to port *:3000. press ctrl + c to cancel');
});;