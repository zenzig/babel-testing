var bodyParser = require('body-parser');    // get body-parser
var User       = require('../models/user');
var Sport       = require('../models/sport');
var jwt        = require('jsonwebtoken');
var config     = require('../../config');
// super secret for creating tokens
var superSecret = config.secret;

module.exports = function(app, express) {

	var apiRouter = express.Router();

	// route to authenticate a user: POST --> http://localhost:3000/api/authenticate
	apiRouter.post('/authenticate', function(req, res) {

		// find the user
		User.findOne({
			username: req.body.username
		}).select('name username password').exec(function(err, user) {

			if (err) throw err;

			// no user with that username was found
			if (!user) {
				res.json({ success: false, message: 'Authentication failed. User not found.' });
			} else if (user) {

				// check if password matches
				var validPassword = user.comparePassword(req.body.password);
				if (!validPassword) {
					res.json({ success: false, message: 'Authentication failed. Wrong password.' });
				} else {

					// if user is found and password is right
					// create a token
					var token = jwt.sign({
						name: user.name,
						username: user.username
					}, superSecret, {
						expiresInMinutes: 1440 // expires in 24 hours
					});

					// return the information including token as JSON
					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				} 	

			}

		});
	});
/*	
	// route middleware to verify a token
	apiRouter.use(function(req, res, next) {
		// do logging
		console.log('Somebody just came to our app!');

		// check header or url parameters or post parameters for token
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		// decode token
		if (token) {

			// verifies secret and checks exp
			jwt.verify(token, superSecret, function(err, decoded) { 		 

				if (err) {
					res.status(403).send({ success: false, message: 'Failed to authenticate token.' }); 		 
				} else { 
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
							
					next(); // make sure we go to the next routes and don't stop here
				}
			});

		} else {

			// if there is no token
			// return an HTTP response of 403 (access forbidden) and an error message
			res.status(403).send({ success: false, message: 'No token provided.' });
			
		}
	});
*/

	// test route to make sure everything is working : GET --> http://localhost:3000/api
	apiRouter.get('/', function(req, res) {
		res.json({ message: 'hooray! welcome to our api!' });	
	});

	// on routes that end in /users
	// ----------------------------------------------------
	apiRouter.route('/users')

		// create a user : POST --> http://localhost:3000/users
		.post(function(req, res) {
			console.log(req.body);
			
			var user = new User();		// create a new instance of the User model
			user.name = req.body.name;  // set the users name (comes from the request)
			user.username = req.body.username;  // set the users username (comes from the request)
			user.password = req.body.password;  // set the users password (comes from the request)
            user.usertype = req.body.usertype;  // set the users password (comes from the request)
            
			user.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A user with that username already exists. '});
					else 
						return res.send(err);
				}

				// return a message
				res.json({ message: 'User created!' });
			});

		})

		// get all the users: GET --> http://localhost:3000/api/users
		.get(function(req, res) {
			User.find({}, function(err, users) {
				if (err) res.send(err);
				// return the users
				res.json(users);
			});
		});

	// on routes that end in /users/:user_id
	// ----------------------------------------------------
	apiRouter.route('/users/:user_id')

		// get the user with that id
		.get(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {
				if (err) res.send(err);
				// return that user
				res.json(user);
			});
		})

		// update the user with this id
		.put(function(req, res) {
			User.findById(req.params.user_id, function(err, user) {

				if (err) res.send(err);

				// set the new user information if it exists in the request
				if (req.body.name) user.name = req.body.name;
				if (req.body.username) user.username = req.body.username;
				if (req.body.password) user.password = req.body.password;
				if (req.body.usertype) user.type = req.body.usertype;

				// save the user
				user.save(function(err) {
					if (err) res.send(err);

					// return a message
					res.json({ message: 'User updated!' });
				});

			});
		})

		// delete the user with this id
		.delete(function(req, res) {
			User.remove({
				_id: req.params.user_id
			}, function(err, user) {
				if (err) res.send(err);
				res.json({ message: 'Successfully deleted' });
			});
		});
		
	////////////////////////////////////////////////////////////////////////////	
	// on routes that end in /sports
	// ----------------------------------------------------
	apiRouter.route('/sports')
		.post(function(req, res) {
			var sport = new Sport();		// create a new instance of the User model
			sport.name = req.body.name;  // set the users name (comes from the request)
			sport.save(function(err) {
				if (err) {
					// duplicate entry
					if (err.code == 11000) 
						return res.json({ success: false, message: 'A sport with that name already exists. '});
					else 
						return res.send(err);
				}
				res.json({ message: 'Sport created!' });
			});
		})

		.get(function(req, res) {
			Sport.find({}, function(err, sports) {
				if (err) res.send(err);
				// return the users
				res.json(sports);
			});
		});
/*
	// on routes that end in /sports/:sport_id
	// ----------------------------------------------------
	apiRouter.route('/sports/:sport_id')
		.get(function(req, res) {
			Sport.findById(req.params.sport_id, function(err, sport) {
				if (err) res.send(err);
				console.log(sport);
				res.json(sport);
			});
		})
		.put(function(req, res) {
			Sport.findById(req.params.sport_id, function(err, sport) {
				if (err) res.send(err);
				if (req.body.name) sport.name = req.body.name;
				sport.save(function(err) {
					if (err) res.send(err);
					res.json({ message: 'Sport updated!' });
				});
			});
		})
		.delete(function(req, res) {
			Sport.remove({
				_id: req.params.sport_id
			}, function(err, user) {
				if (err) res.send(err);
				res.json({ message: 'Successfully deleted' });
			});
		});
*/		
////////////////////////////////////////////////////////////////////////////////
	// on routes that end in /sports/:name
	// ----------------------------------------------------
	apiRouter.route('/sports/:name')
		.get(function(req, res) {
			this.sportName = req.params.name;
			this.sport = {
            	 "name": "Cycling",
                 "goldMedals": [{
	                 "division": "Mens Sprint",
	                 "country": "UK",
	                  "year": 2012
                  }, {
	                  "division": "Women's Sprint",
	                  "country": "Australia",
	                  "year": 2012
                  }]
                };
                res.json(this.sport);
			
		});

////////////////////////////////////////////////////////////////////////////////
		
	

	// api endpoint to get user information
	apiRouter.get('/me', function(req, res) {
		res.send(req.decoded);
	});

	return apiRouter;
};