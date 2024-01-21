const express = require('express'),
    morgan = require('morgan'),
    //app = require('express'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

const { check, validationResult } = require('express-validator');

// requiring mongoose, as well as importing files and models from models.js file
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director; 

mongoose.createConnection( process.env.CONNECTION_URI, {} );
//mongoose.createConnection('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

let topMovies = [     // using express to make syntax easier
    {
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont'
    },
    {
        title: 'The Godfather',
        director: 'Francis Ford Coppola'
    },
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan'
    },
    {
        title: 'The Godfather pt. 2',
        director: 'Francis Ford Coppola'
    },
    {
        title: '12 Angry Men',
        director: 'Sidney Lumet'
    },
    {
        title: 'Schindler\'s List',
        director: 'Steven Spielberg'
    },
    {
        title: 'The Lord of the Rings: The Return of the King',
        director: 'Peter Jackson'
    },
    {
        title: 'Pulp Fiction',
        director: 'Quentin Tarantino'
    },
    {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        director: 'Peter Jackson'
    },
    {
        title: 'The Good, the Bad and the Ugly',
        director: 'Sergio Leone'
    },
];

const app = express();

//serving static file
app.use(express.static('public'));

//using morgan to log info
app.use(morgan('common'));

//using body parser
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

/* code for allowing specific origins(need to expand)
let allowedOrigins = ['http://localhost:8080', 'http://teststite.com'];
app.use(cors( {
    origin: (origin, callback) => {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1) { // if a specific origin isn't found on the list of allowed origins
            let message = 'The CORS policty for this application does not allow access from origin ' + origin;
            return callback(new Error(message ), false);
        }
        return callback(null, true);
    }
}));
*/

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

//list of movies requests
app.get('/movies', /*passport.authenticate('jwt', { session: false }),*/ async (req, res) => {
  await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentaion.html', { root: __dirname });
});

//return data about a single movie
app.get('/movies/:Title', async (req, res) => {
    await Movies.findOne({ Title: req.params.Title})
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(err);
        });
});

//return data about a genre
app.get('/genres/:Name', async (req, res) => {
    await Genres.findOne({ Name: req.params.Name })
        .then((genre) => {
            res.json(genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(err);
        });
});

//return data about a director
app.get('/directors/:Name', async (req, res) => {
    await Directors.findOne({ Name: req.params.Name })
        .then((director) => {
            res.json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(err);
        });
});

//user registration
/*app.post('/users', (req, res) => {
    res.send('your new account has been created');
})
*/
/* expecting JSON in this format
{ ID: Integer, Username: String, Password: String, Email: String, Birthday: Date } */
app.post('/users', async (req, res) => {
    [ // validation logic, can chain methods(line 161 means 'is not empty'), line 159 requires a minimum of 5 characters
        check('Username', 'Username is required').isLength({min: 5}),
        check('Username', 'Username contains non alphanumeric characters - not allowed').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], async (req, res) => {
        let errors = validationResult(req); // check the validation object for errors

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
    }
    
    let hashedPassword = Users.hashPassword(req.body.Password); //will hash the password and store in database
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
                .create({
                    Username: req.body.Username,
                    Password: hashedPassword,
                    Email: req.body.Email,
                    Birthday: req.body.Birthday
                })
                .then((user) => {res.status(201).json(user) })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

// Get all users
app.get('/users', async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get a user by username
app.get('/users/:Username', async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Update a user's info by username
/* expected in JSON format
{ Username: String (required), Password: String (required), Email: String(required), Birthday: Date}
*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    
    //condition to check
    if(req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission Denied');
    }
    
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
    }
},
{ new: true}) // this line makes sure that the updated document is returned
.then((updatedUser) => {
    res.json(updatedUser);
})
.catch((err) => {
    console.error(err);
    res.status(500).send('Error: '+ err);
})
});
    
//Add a movie to user's list of favorites
app.post('/users/:Username/movies/:MovieId', passport.authenticate('jwt', { session: false }),async (req, res) => {
    
    //condition to check
    if(req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission Denied');
    }

    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { FavoriteMovies: req.params.MovieId }
    },
    { new: true }) //this line makes sure that the updated document is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Deleting a movie from favorite movie list
app.delete('/users/:Username/movies/:MovieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull:  {FavoriteMovies: req.params.Title },
        },
        { new: true }) //this line makes sure updated document is returned
        .then((updatedList) => {
            res.json(updatedList);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error ' + err);
        })
})

// Delete a user by username
app.delete('/users/:Username', async (req, res) => {
    
    //condition to check
    if(req.user.Username !== req.params.Username) {
            return res.status(400).send('Permission Denied');
        }
        
    
    await Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if(!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.')
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops! Something went wrong!');
});

//listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
    console.log('listening on port' + port);
});


console.log('My first Node test server is running on port 8080');


/* understanding url requests by using node modules
const http = require('http'),
    url = require('url');

http.createServer((request, response) => {
    let requestURL = url.parse(request.url, true);
    if (requestURL.pathname == '/documentation.html') {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Documentation on the bookclub API. \n');
    } else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end('Welcome to my bookclub!\n');
    }
}).listen(8080);
*/