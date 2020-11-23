const express = require("express");
const app = express();
// Static files
app.use(express.static("public"));

////////////////////WEBSOCKETZ///////////////////////
const socket = require("socket.io");

const server = require('http').createServer(app);
const io = require('socket.io')(server,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

exports.myio = io;

// test
var path = require('path');
var fs = require('fs');


//  mera...............

/*
io.on("connection", function (socket) {
    console.log("Made socket connection fun again");


    // DENNA: https://github.com/silas/node-jenkins
    var jenkins_second_lib = require('jenkins')({ baseUrl: 'http://admin:admin@localhost:8080', crumbIssuer: true });

    jenkins_second_lib.job.get('test3', function(err, data) {
        if (err) throw err;

        var log = jenkins_second_lib.build.logStream('test3', data.builds[0].number ,String,3000);

        log.on('data', function(text) {

            var stream = ss.createStream();

            ss(socket).emit('jenkins-log', stream,text);

        });

        log.on('error', function(err) {
            console.log('error', err);
        });

        log.on('end', function() {
            console.log('end');
        });

    });

});
*/

server.listen(3000);

//////////////////////////////////////////////////////


var cors = require('cors')
var logger = require('morgan');
var index = require('./routes/index');
//var app = express();


/*
var mongoose = require("mongoose");

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/db", {useNewUrlParser: true,  useUnifiedTopology: true } );  // 'commits' verkar vara en collection?!?! inte en DB namn?? wtf..????
let db = mongoose.connection;
db.once("open", () => console.log("connected to the database"));
// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

*/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// set path for static assets
app.use(express.static(path.join(__dirname, 'public')));

// CORS request -allow all
app.use(cors())


// routes
app.use('/', index);


//
// CORS settings.. maybe not needed since cors module installed: https://www.npmjs.com/package/cors
//
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "localhost"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.render('error', {status:err.status, message:err.message});
});

module.exports = app;
