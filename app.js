const express = require("express");
const app = express();
// Static files
app.use(express.static("public"));

var cors = require('cors')
//var logger = require('morgan');
var index = require('./routes/index_local'); // kör lokalt med -> index_local

const chokidar = require('chokidar');
const fs = require("fs");
var shell = require('shelljs');

var root_path = "public/data"


////////////////////WEBSOCKETZ///////////////////////

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

server.listen(3000);

//////////////////////////////////////////////////////
/*

// Order directories by time
function readFile (dir, callback){
    try
    {
        fs.readdir(dir, function(err, files)
        {
            files = files.map(function (fileName)
            {
                return {
                    name: fileName,
                    time: fs.statSync(dir + '/' + fileName).mtime.getTime()
                };
            })
                .sort(function (a, b) {
                    return b.time - a.time; })
                .map(function (v) {
                    return v.name; });

            return callback(files)
        });

    }catch (e) {
        console.log("could not delete directories!: " + e)
    }
}
// Cleans up dirs, max 10 folders
try {
    chokidar.watch(root_path).on('all', (event, path) => {

        readFile(root_path, function (reffs){

            for (let i = 0; i <reffs.length ; i++) {

                readFile(root_path+'/'+ reffs[i], function (reffs_folder){

                    if (reffs_folder.length > 10) // max 10 foldrar ..testar bara..
                    {
                        for (var j = 10; j < reffs_folder.length; j++)
                        {
                            // console.log("deleting this:" + reffs_folder[j])
                            shell.rm('-rf', root_path + '/' + reffs[i] + '/' + reffs_folder[j]);
                        }
                    }
                });
            }
        });
    });
}
catch (e) {
    console.log("could not watch directories!: " + e)
}
*/

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
