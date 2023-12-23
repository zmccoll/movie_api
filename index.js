const express = require('express'),
    morgan = require('morgan'),
    //app = require('express'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');
    
// using express to make syntax easier
let topMovies = [
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

//list of movies requests
app.get('/movies', (req, res) => {
    res.send('Sucess, here is the list of movies!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentaion.html', { root: __dirname });
});
/*
app.get('/movies', (req, res) => {
    res.json(topMovies);
});
*/
//return data about a single movie
app.get('/movies/title/:title', (req, res) => {
    res.send('Here is data about the requested movie');
})

//return data about a genre
app.get('/movies/genre/:genre', (req, res) => {
    res.send('Here is movies based on your genre search');
})

//return data about a director
app.get('/movies/director/:director', (req, res) => {
    res.send('Here is info on the director you requested');
})

//user registration
app.post('/movies/newuser', (req, res) => {
    res.send('your new account has been created');
})

//error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Oops! Something went wrong!');
});

//listen for requests
app.listen(8080, () => {
    console.log('your app is listening on port 8080');
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