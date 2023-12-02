//establish the variable
const http = require('http'), //imports the http modules
    fs = require(fs), //imports the file system module
    url = require(url); //imports the url module 

http.createServer((request, response) => { //in this line are two arguments of the function passed into createServer()
    let addr = request.url, //inputs requested url
    q = new URL(addr, 'http://' + request.headers.host);

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimeStamp: ' + newDate() + '\n\n', (err) => {
        if(err) {
            console.log(err);
        } else {
            console.log('added to log');
        }
    })
    
    if(q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    response.writeHead(200, {'Content-Type': 'text/plain'}); //adds a header ot the response that will be returned, along with the HTTP status code 200 for ok
    response.end('Hello Node!\n'); //ends the response by sending back the message "hello node"
}).listen(8080); // listens for a response on port 80

console.log('My first Node test server is running on Port 8080.');

//test