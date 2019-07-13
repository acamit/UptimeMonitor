/*
 * Primary file for API
 */
//dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
const fs = require('fs');

var _data = require('./lib/data');

_data.delete('test', 'newFile', function (err) {
    console.log(err);
});

//The server should respond to all requests with a string to all request
//instantiate http server
var httpServer = http.createServer(function (req, res) {
    unifiedServer(req, res);
});

//start the server on port 3000
httpServer.listen(config.httpPort, function () {
    console.log(`Server is listening on port ${config.httpPort} in ${config.envName} environment`);
});

var httpsServerOptions = {
    // 'key':fs.readFileSync('./https/key.pem'),//create using open ssl
    //'cert':fs.readFileSync('./https/cert.pem')
};

//instantitate  the HTTPS Server
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
    unifiedServer(req, res);
});


//start the https server
httpsServer.listen(config.httpsPort, function () {
    console.log(`Server is listening on port ${config.httpsPort} in ${config.envName} environment`);
});

// All The server logic for bot http and https server
var unifiedServer = function (req, res) {

    //get url and parse it
    var parsedURL = url.parse(req.url, true); //true also parses the query string data

    //get the path
    var path = parsedURL.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // get the query string as an object
    var queryStringObject = parsedURL.query;

    //get the HTTP method
    var method = req.method.toLowerCase();

    // get the headers as an object
    var headers = req.headers;

    //get the payload if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function (data) {
        buffer += decoder.write(data);
    });

    req.on('end', function () {
        buffer += decoder.end();

        //chose the handler or call not found handler
        var chosenHandler = typeof (router[trimmedPath]) != 'undefined' ? router[trimmedPath] : handlers.notFound;

        //construct the data object to send to the handler
        var data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            'payload': buffer
        }

        //Route the request to handler specified in the router
        chosenHandler(data, function (statusCode, payload) {

            // default status code to 200
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            //default payload to empty object
            payload = typeof (payload) == 'object' ? payload : {};

            //convert payload to string
            var payloadString = JSON.stringify(payload);

            //send the respone
            res.setHeader('Content-Type', 'application/json');

            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });

    //log the request path
    console.log('Request recieved on path:' + trimmedPath);
};

//Define Handlers
var handlers = {};
handlers.ping = function (data, callback) {
    //callback a http status code and a payload object
    callback(200)
};
//Not found handler
handlers.notFound = function (data, callback) {
    callback(404)
};

// Define a request router
var router = {
    'ping': handlers.ping
};