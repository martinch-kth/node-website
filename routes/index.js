const express = require("express");

var router = express.Router();

var browseDir = require("browse-directory");
const dirTree = require("directory-tree");

var _= require('lodash');
const jsonfile = require('jsonfile')

var Comments = require('.././comments');

var file1 = require('../app.js')

const axios = require('axios');

var ss = require('socket.io-stream');

const Jenkins_async_lib = require('node-async-jenkins-api');

var child_process = require('child_process');

const {
  dynamic: { setIntervalAsync: setIntervalAsyncD },
  fixed: { setIntervalAsync: setIntervalAsyncF },
  legacy: { setIntervalAsync: setIntervalAsyncL },
  clearIntervalAsync
} = require('set-interval-async')

//const app = require('app')

// https://stackoverflow.com/questions/19051041/cannot-overwrite-model-once-compiled-mongoose

//comment_id:String, // two filenames.. the path..host + module name..
//    username:String,
//    comment:String
/*
var minicommit = new Comments({ "comment_id" : "66645","username" : "123","comment" : "123" });

console.log(minicommit.comment_id); // 'Silence'

minicommit.save(function (err, fluffy) {
    if (err) return console.error(err);

    console.log("saveed")
});


Comments.find(function (err, commits) {
    if (err) return console.error(err);
    console.log(commits);
})

router.get('/:tagId', function(req, res) {

    var query  = Comments.where({ commit_id: req.params.tagId });

    console.log('letar ...')

    query.findOne(function (err, commit) {
        if (err) return handleError(err);
        if (commit) {
            // doc may be null if no document matched
            console.log('hittade ...')

            res.send(commit);
            // res.json(commit);  // kan även vara:....    res.send(commit)
        }
    });

})


*/


async function createTreemapData(file) {
  try {
    const file_data = await jsonfile.readFile(file, 'utf8');

    var content = file_data.modules

    // sort errors by occurrences
    for (var i = 0; i < content.length; i++) {

      var err = content[i].errors

      for (var j = 0; j < err.length; j++)
      {
        err[j].occurrences = parseInt(err[j].occurrences)
      }

      var funcResult = _.orderBy(content[i].errors, [(errors) => errors.occurrences, (occurrences) => occurrences], ["desc", "asc"])

      Object.assign(content[i].errors, funcResult) // replaces array with sorted array
    }

    var treemap_data_errors = []

    for (var i = 0; i < content.length; i++) {

      var total_string_log = ""

      // Check if json was errors or warnings..
      if (content[i].hasOwnProperty('errors')) {

        var total_errors = 0

        for (var j = 0; j < content[i].errors.length; j++) {
          total_errors += parseInt(content[i].errors[j].occurrences)

          occurrences_string = "Occurrences: " + content[i].errors[j].occurrences + "\n"

          // sätt occurences...
          // ta ut felmeddelandet, dela upp det så det finns radbrytning var 50:e tecken..
          // i slutet så lägger du även till htlm <BR> så att Semantic UI ska förstå .... . . .
          total_string_log += occurrences_string + explode(content[i].errors[j].message,50) + "<br>"
        }
      }

      treemap_data_errors.push({
        "key": total_string_log,
        "region": content[i].onHost,
        "subregion": content[i].moduleName,
        "value": total_errors
      })
    }

    return treemap_data_errors

  } catch (e) {
    console.error(e);
  }
}





// detta måste köras så for en ny fil kommer in...
// eller ska jag köra den så fort man byter fil? ... Finns jobb kvar...
function getAllFiles() {

  var dirFiles = browseDir.browseFiles("public/data");

  return dirFiles.map(element => element.src).reverse()      // reverse order of files in directory
}


//
// få all filer... .json filer...

function getAllFilesTreemap(callback) {

// funkar..  var stdout=cp.exec('git diff --no-index public/data/reff1/YYYY-MM-DD_TT-TT-TT_Longname_number5/fluxion/ public/data/reff2/YYYY-MM-DD_TT-TT-TT_Longname_number3/fluxionChanged/ > comparison.diff').stdout

  var child = child_process.spawnSync("find", ["public/data","-maxdepth","3"], { encoding : 'utf8' });
  console.log("Process finished.");
  if(child.error) {
    console.log("ERROR: ",child.error);
  }

  var file_array = child.stdout.split(/\n/)

  var dirFiles_fixed = []

  for (element of file_array)
  {
      var extension = element.substring(element.lastIndexOf('.') + 1);

      if (extension === "json")
      {
          dirFiles_fixed.push(element)
      }
  }

  return dirFiles_fixed.reverse()     // reverse order of files in directory
}

function getJstree_light() {


  // public/data/reff1/YYYY-MM-DD_TT-TT-TT_Longname_number10/original-data-structure-errors.json


  // få alla kataloger...  dela dess med split??...

  // vette fan..


  var jstree = []

  function eachRecursive(data) {

    // remove "public/" from path, not needed.
    data.path = data.path.substring(7, data.path.length)

    // remove everything after & including the last forward slazh!
    var afterWithout = data.path.substr(0, data.path.lastIndexOf("/"));

    if (data.type === "directory") {

      // Måste göra så för att ROOT folder ska få sin '#'....
      if (data.path.split("/").length <= 2)
      {
        var dirobj = { id: data.path , parent: "#" ,a_attr: {class:"no_checkbox"},text: data.name };
      }
      else
      {
        // Is not root node
        var dirobj = { id: data.path , parent: afterWithout ,text: data.name };
      }

      /*
            // if directory is empty, dont set any checkbox.
            if (data.children.length <= 0)
            {
              var dirobj = { id: data.path , parent: "#" ,a_attr: {class:"no_checkbox"},text: data.name };
            }
            else
            {
              var dirobj = { id: data.path , parent: "#" ,text: data.name };
            }
      */

      jstree.push(dirobj);

      // Ta hand om barnen
      if (Array.isArray(data.children))
      {
        data.children.forEach(eachRecursive)
      }

    } else if (data.type === "file")
    {
      var fileobj = { id: data.path , parent: afterWithout, text: data.name, icon : " glyphicon glyphicon-file" };

      jstree.push(fileobj);
    }
  }

  tree.forEach(eachRecursive);
  return jstree
}


function getJstree() {

  const treed = Object.values(dirTree("public/data"));
  const tree = treed[2]


  //console.log(tree)
  // skippa ovan.. gör om till bara kataloger... fuuuuuukk.. va fult :-)...


  var jstree = []

  function eachRecursive(data) {

    // remove "public/" from path, not needed.
    data.path = data.path.substring(7, data.path.length)

    // remove everything after & including the last forward slazh!
    var afterWithout = data.path.substr(0, data.path.lastIndexOf("/"));

    if (data.type === "directory") {

      // Måste göra så för att ROOT folder ska få sin '#'....
      if (data.path.split("/").length <= 2)
      {
        var dirobj = { id: data.path , parent: "#" ,a_attr: {class:"no_checkbox"},text: data.name };
      }
      else
      {
        // Is not root node
        var dirobj = { id: data.path , parent: afterWithout ,text: data.name };
      }

      /*
            // if directory is empty, dont set any checkbox.
            if (data.children.length <= 0)
            {
              var dirobj = { id: data.path , parent: "#" ,a_attr: {class:"no_checkbox"},text: data.name };
            }
            else
            {
              var dirobj = { id: data.path , parent: "#" ,text: data.name };
            }
      */

      jstree.push(dirobj);

      // Ta hand om barnen
      if (Array.isArray(data.children))
      {
        data.children.forEach(eachRecursive)
      }

    } else if (data.type === "file")
    {
      var fileobj = { id: data.path , parent: afterWithout, text: data.name, icon : " glyphicon glyphicon-file" };

      jstree.push(fileobj);
    }
  }

  tree.forEach(eachRecursive);
  return jstree
}


function fleetCheck(){
  /*
  + echo fleet-check-started
  fleet-check-started
  + fleetctl list-units
  UNIT		MACHINE				ACTIVE	SUB
  hello.service	5810ec51.../192.168.43.59	active	running
  + echo fleet-check-ended
  fleet-check-ended

  */
}

// format text to a certain length width.
function explode(text, max) {
  text = text.replace(/  +/g, " ").replace(/^ /, "").replace(/ $/, "");
  if (typeof text === "undefined") return "";
  if (typeof max === "undefined") max = 50;
  if (text.length <= max) return text;
  var exploded = text.substring(0, max);
  text = text.substring(max);
  if (text.charAt(0) !== " ") {
    while (exploded.charAt(exploded.length - 1) !== " " && exploded.length > 0) {
      text = exploded.charAt(exploded.length - 1) + text;
      exploded = exploded.substring(0, exploded.length - 1);
    }
    if (exploded.length == 0) {
      exploded = text.substring(0, max);
      text = text.substring(max);
    } else {
      exploded = exploded.substring(0, exploded.length - 1);
    }
  } else {
    text = text.substring(1);
  }
  return exploded + "\n" + explode(text);
}

/* GET home page. */
router.get('/', async function (req, res, next) {

  res.render('index', {page: 'Home', menuId: 'home', filenames: getAllFilesTreemap()});
});

router.get('/treemapinput', async function(req, res) {

  // Access the provided 'file' query parameters
  let file = req.query.file;
  var result = await createTreemapData(file)

  res.json(result)
});

router.get('/rawfile', async function(req, res) {

  // Access the provided 'file' query parameters
  let file = req.query.file;

  const file_data = await jsonfile.readFile(file, 'utf8');

  var content = file_data.modules

  res.json(content)
});


router.get('/about', function(req, res, next) {
  res.render('about', {page:'About Us', menuId:'about'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {page:'Contact Us', menuId:'contact'});
});

router.get('/diff', function(req, res, next) {
  res.render('diff', {page:'Diff files', menuId:'diff',filenames: getAllFiles(), jstree: getJstree()});
});

async function run_jenkins_job_stream(socket,jenkins_url, jenkins_job_name, last_job_number){

  var jenkins_lib = require('jenkins')({ baseUrl: jenkins_url, crumbIssuer: true }); // https://www.npmjs.com/package/jenkins#build-log-stream

  jenkins_lib.job.get(jenkins_job_name, function(err, data) {
    if (err) throw err;

    //stream log of latest build                    data.id      //data.builds[0].number    2 second poll delay
    var log = jenkins_lib.build.logStream(jenkins_job_name, last_job_number, String, 2000);     //Parameters: name (String): job name, number (Integer): build number, type (String, enum: text, html, default: text): output format, delay (Integer, default: 1000): poll interval in milliseconds

    log.on('data', function (text) {

      var stream = ss.createStream();
      ss(socket).emit(jenkins_url, stream, text); // skickar text till denna url..
    });

    log.on('error', function (err) {
      console.log('error:', err);
    });

    log.on('end', function () {

      console.log('end:' + jenkins_url);

         var stream = ss.createStream();
         ss(socket).emit("end:" + jenkins_url, stream, jenkins_url); // skickar text till denna url..

    });
  })
}

async function axiosTest(url) {
  try
  {
    const {data:response} = await axios.get(url) //use data destructuring to get data from the promise object

    return response
  }

  catch (error) {
    console.log(error);
  }
}

async function get_jenkins_info(jenkins_url, jenkins_job_name,passw,reff_name) {
  try {

    const jenkins2 = new Jenkins_async_lib({
      url: jenkins_url,
      username: 'admin',
      password: passw
    });

    const result_jobinfo = await jenkins2.getJobInfo(jenkins_job_name)

    const result_lastbuild = await jenkins2.getLastBuildInfo(jenkins_job_name)

    var jenkins_info = {"getJobInfo":result_jobinfo.data.body, "getLastBuildInfo":result_lastbuild.data.body, "reff_name":reff_name}

    return jenkins_info
  }
  catch (e) {
    console.error(e);
  }
}


router.get('/buildstatus', async function (req, res, next) {

  var jenkins_info_reff1 = ""
  var jenkins_info_reff2 = ""

  var jenkins_info_reff3 = ""
  var jenkins_info_reff4 = ""

  var jenkins_info_reff5 = ""
  var jenkins_info_reff6 = ""


  //var reff1_url_no_psw = "http://localhost:8080" // no PASSWORD...
  //var reff2_url_no_psw = "http://admin:s***M@130.237.59.171:8080" // sätt tillbaka sen // var jenkins = require('jenkins')({ baseUrl: 'http://user:pass@localhost:8080', crumbIssuer: true });

  var reff1_url_no_psw = "http://hansolo:8080"
  var reff2_url_no_psw = "http://leia"
  var reff3_url_no_psw = "http://mandalorian:8080"
  var reff4_url_no_psw = "http://chewbacca:8080"  // ska komma in om 1 år..?
  var reff5_url_no_psw = "http://sebulba:8080"  // verkar inte vara uppsatt helt..
  var reff6_url_no_psw = "http://logray:8080"

  // 10.68.108.164 http://hansolo    IDE .. vore koolt att ha liten GIF vid varje reff.. så varje reff har ett TEMA :-)
  // 10.68.108.165 http://leia
  // 10.68.108.166 http://mandalorian
  // 10.68.108.167 http://chewbacca

  // 10.68.234.80 http://sebulba  vrefs
  // 10.68.234.81 http://logray

  file1.myio.on('connection', async function (socket) {

  console.log("Made socket connections fun again");

  const {
      setIntervalAsync,
      clearIntervalAsync
    } = require('set-interval-async/dynamic')

    const timer = setIntervalAsync(
        async () => {
          console.log('...polling...')

       //   var loop_reff1 = await get_jenkins_info(reff1_url_no_psw, "test3", "", "Ek1-Mini")
       //   var loop_reff2 = await get_jenkins_info(reff2_url_no_psw, "test","s**M","Ek2-Maxi")

          var loop_reff1 = await get_jenkins_info(reff1_url_no_psw, "install", "", "Han Solo")
          var loop_reff2 = await get_jenkins_info(reff2_url_no_psw, "install","","Leia")
          var loop_reff3 = await get_jenkins_info(reff3_url_no_psw, "install", "", "Mandalorian")
        //  var loop_reff4 = await get_jenkins_info(reff4_url_no_psw, "install","","Chewbacca")
          var loop_reff5 = await get_jenkins_info(reff5_url_no_psw, "install", "", "Sebulba")
          var loop_reff6 = await get_jenkins_info(reff6_url_no_psw, "install","","Logray")


          // checks if new job has started. their must be at least 1 job in history
          if ((JSON.stringify(jenkins_info_reff1) !== JSON.stringify(loop_reff1)) && (typeof loop_reff1.getJobInfo !== "undefined") && (loop_reff1.getJobInfo.firstBuild !== null))
          {

            jenkins_info_reff1 = loop_reff1 // update - compare against this next pollning..

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff1', stream, JSON.stringify(loop_reff1)); // skickar jenkins....info...

            run_jenkins_job_stream(socket, reff1_url_no_psw, loop_reff1.getJobInfo.name, loop_reff1.getLastBuildInfo.id);
          }

          if ((JSON.stringify(jenkins_info_reff2) !== JSON.stringify(loop_reff2)) && (typeof loop_reff2.getJobInfo !== "undefined") && (loop_reff2.getJobInfo.firstBuild !== null))
          {

            jenkins_info_reff2 = loop_reff2

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff2', stream, JSON.stringify(loop_reff2));

            run_jenkins_job_stream(socket, reff2_url_no_psw, loop_reff2.getJobInfo.name, loop_reff2.getLastBuildInfo.id);
          }

          if ((JSON.stringify(jenkins_info_reff3) !== JSON.stringify(loop_reff3)) && (typeof loop_reff3.getJobInfo !== "undefined") && (loop_reff3.getJobInfo.firstBuild !== null))
          {

            jenkins_info_reff3 = loop_reff3

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff3', stream, JSON.stringify(loop_reff3));

            run_jenkins_job_stream(socket, reff3_url_no_psw, loop_reff3.getJobInfo.name, loop_reff3.getLastBuildInfo.id);
          }
/*
          if ((JSON.stringify(jenkins_info_reff4) !== JSON.stringify(loop_reff4)) && (typeof loop_reff4.getJobInfo !== "undefined") && (loop_reff4.getJobInfo.firstBuild !== null))
          {

            jenkins_info_reff4 = loop_reff4

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff4', stream, JSON.stringify(loop_reff4));

            run_jenkins_job_stream(socket, reff4_url_no_psw, loop_reff4.getJobInfo.name, loop_reff4.getLastBuildInfo.id);
          }
*/
          if ((JSON.stringify(jenkins_info_reff5) !== JSON.stringify(loop_reff5)) && (typeof loop_reff5.getJobInfo !== "undefined") && (loop_reff5.getJobInfo.firstBuild !== null))
          {

            jenkins_info_reff5 = loop_reff5

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff5', stream, JSON.stringify(loop_reff5));

            run_jenkins_job_stream(socket, reff5_url_no_psw, loop_reff5.getJobInfo.name, loop_reff5.getLastBuildInfo.id);
          }

          if ((JSON.stringify(jenkins_info_reff6) !== JSON.stringify(loop_reff6)) && (typeof loop_reff6.getJobInfo !== "undefined") && (loop_reff6.getJobInfo.firstBuild !== null))
          {

            jenkins_info_reff6 = loop_reff6

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff6', stream, JSON.stringify(loop_reff6));

            run_jenkins_job_stream(socket, reff6_url_no_psw, loop_reff6.getJobInfo.name, loop_reff6.getLastBuildInfo.id);
          }

        },
        10000) // brukar köra med 5000 annars..dvs 5 sek..men testa nu med mer för att inte "överbelasta nätet"
  });

  res.render('buildstatus', {page: 'Build status', menuId: 'buildstatus'});
});

module.exports = router;
