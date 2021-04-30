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

var path    = require("path");

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

function getAllFilesTreemap(callback) {

// funkar..  var stdout=cp.exec('git comp --no-index public/data/reff1/YYYY-MM-DD_TT-TT-TT_Longname_number5/fluxion/ public/data/reff2/YYYY-MM-DD_TT-TT-TT_Longname_number3/fluxionChanged/ > comparison.comp').stdout

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


  var child = child_process.spawnSync("find", ["public/data","-maxdepth","2"], { encoding : 'utf8' });
  console.log("Process finished.");
  if(child.error) {
    console.log("ERROR: ",child.error);
  }

  var file_array = child.stdout.split(/\n/)

  /*
  public/data
  public/data/reff4
  public/data/reff4/YYYY-MM-DD_TT-TT-TT_Longname_number8
  public/data/reff4/YYYY-MM-DD_TT-TT-TT_Longname_number9
  public/data/reff4/YYYY-MM-DD_TT-TT-TT_Longname_number10

  $('#using_json').jstree({ 'core' : {
      'data' : [
         'Simple root node',
         {
           'text' : 'Root node 2',
           'state' : {
             'opened' : true,
             'selected' : true
           },
           'children' : [
             { 'text' : 'Child 1' },
             'Child 2'
           ]
        }
      ]
  } });

   */

  var custom_jstree = []

  var parent = ""

  for (element of file_array)
  {
    var paths = element.split("/");

      if (paths.length > 2 && paths.length <= 3)  // tex public/data/reff2 (x >= 0.001 && x <= 0.009)
      {
        console.log("borde va reff:" + element)

        var dirobj = { id: element , parent: "#" ,a_attr: {class:"no_checkbox"},text: paths[paths.length-1] };

        parent = element

        custom_jstree.push(dirobj)

      }
      if (paths.length > 3)
      {
        // Is not root node
        var dirobj = { id: element , parent: parent ,text: paths[paths.length-1] };

        custom_jstree.push(dirobj)

        console.log("borde va katalog:" + element)
      }
  }

  return custom_jstree

}
/*
// old function..  deprecated.. takes to much resources,, nice recursion :-(
function getJstree() {

  const treed = Object.values(dirTree("public/data"));
  const tree = treed[2]

  var jstree = []

  function eachRecursive(data, level) {

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


            // if directory is empty, dont set any checkbox.
            if (data.children.length <= 0)
            {
              var dirobj = { id: data.path , parent: "#" ,a_attr: {class:"no_checkbox"},text: data.name };
            }
            else
            {
              var dirobj = { id: data.path , parent: "#" ,text: data.name };
            }


      jstree.push(dirobj);


      // Ta hand om barnen..nää

      if (Array.isArray(data.children) && (level < 1))
      {
        data.children.forEach(eachRecursive, level)

        level++
      }

    }

    else if (data.type === "file")
    {
      var fileobj = { id: data.path , parent: afterWithout, text: data.name, icon : " glyphicon glyphicon-file" };

      jstree.push(fileobj);
    }

  }

  tree.forEach(eachRecursive);
  return jstree
}
*/

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

router.get('/difffile', async function(req, res) {

  // Access the provided 'file' query parameters
  let firstfolder = req.query.firstfolder;
  let secondfolder = req.query.secondfolder;

  const { exec } = require('child_process');

  console.log("firstfolder: " + firstfolder)
  console.log("secondfolder: " + secondfolder)

  exec('git diff --no-index '+ firstfolder +'/comp/ '+ secondfolder +'/comp/ | cat ', (err, stdout, stderr) => {

        const Diff2html = require('diff2html');
        const diffJson = Diff2html.parse(stdout.toString())
        const diffHtml = Diff2html.html(diffJson, {  matching: 'none' ,drawFileList: true });

        res.send(diffHtml);
      });
});


router.get('/about', function(req, res, next) {
  res.render('about', {page:'About Us', menuId:'about'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {page:'Contact Us', menuId:'contact'});
});

router.get('/diff', function(req, res, next) {

  res.render('diff', {page:'Diff files', menuId:'diff', jstree: getJstree_light()});
});

async function run_jenkins_job_stream(socket,jenkins_url, jenkins_job_name, last_job_number){

  var jenkins_lib = require('jenkins')({ baseUrl: jenkins_url, crumbIssuer: true }); // https://www.npmjs.com/package/jenkins#build-log-stream

  jenkins_lib.job.get(jenkins_job_name, function(err, data) {
    if (err) throw err;

    //stream log of latest build                    data.id      //data.builds[0].number    2 second poll delay
    var log = jenkins_lib.build.logStream(jenkins_job_name, last_job_number, String, 2000);

    log.on('data', function (text) {

     var log = text.split("\n")  // split on each line..

     var clean_out = []
      var stream_me = true

     for (const line of log)
     {
          if (line.includes("Finished:"))
          {

              // skippa anropa metoden..kör allt här...
              var spawn = require('child_process').spawn;

              var child = spawn("ls",{ shell:true});

              child.stderr.on('data', function (data) {
                console.error("STDERR:", data.toString());
              });
              child.on('exit', function (exitCode) {
                console.log("Child exited with code: " + exitCode);
              });
              child.stdout.on('data', function (data) {

             //   console.log("STDOUT:", data.toString());

                var dead_modules = ["hello.service   14ffe4c3.../10.132.249.212  inactive    dead",
                  "hello.service   14ffe4c3.../10.132.249.212  inactive    dead",
                  "hello.service   14ffe4c3.../10.132.249.212  inactive    dead",
                  "hello.service   14ffe4c3.../10.132.249.212  inactive    dead"] //data.toString().split(/\n/)

                //   var modules_status = ssh_to_fleetctl(jenkins_url)

                for (const line of dead_modules)
                {
                  if (line !== "")
                  {
                    var clean = line.split(/\s{2,}|\t/)

                    clean[0] = clean[0].substring(0, clean[0].lastIndexOf("."))

                    clean[1] = /[^/]*$/.exec(clean[1])[0];

                    clean_out.push(clean[0] + " " + clean[1] +" "+ clean[3])
                  }
                }
                console.log(clean_out)
                stream_me = false
                var stream = ss.createStream();
                ss(socket).emit(jenkins_url, stream, text, clean_out.join('\n'));
              })

          }
     }

     // får tomt data.... alltså clean_out är tom när den skickas nedan...men det kommer ut i loopen.. med consol.log...YYYY????
      if (stream_me) // this means no ssh was done..just stream text..
      {
        var stream = ss.createStream();
        ss(socket).emit(jenkins_url, stream, text, clean_out.join('\n'));
      }

    });

    log.on('error', function (err) {
      console.log('error:', err);
    });

    log.on('end', function () {

      console.log('end:' + jenkins_url);

         var stream = ss.createStream();
         ss(socket).emit("end:" + jenkins_url, stream, jenkins_url);

    });
  })
}



function ssh_to_fleetctl(url) {
  try
  {
    var ip = url.split('/')[2].split(':')[0];

        // fleet-ctl list-units | grep dead
        // fleet-ctl list-units | grep inactive
        // failed  <- finns också... ska den med kanske?

      var spawn = require('child_process').spawnSync;

      var child = spawn("ssh root@"+ ip +" ssh mcf1 fleetctl --endpoint http://127.0.0.1:49153 list-units | grep dead", {
          shell: true
      });
      child.stderr.on('data', function (data) {
          console.error("STDERR:", data.toString());
      });
      child.on('exit', function (exitCode) {
          console.log("Child exited with code: " + exitCode);
      });
      child.stdout.on('data', function (data) {
         console.log("STDOUT:", data.toString());

        var dead_modules = child.stdout.split(/\n/)

        var child_second = spawn("ssh root@"+ ip +" ssh mcf1 fleetctl --endpoint http://127.0.0.1:49153 list-units | grep failed", {
          shell: true
        });
        child_second.stderr.on('data', function (data) {
          console.error("STDERR:", data.toString());
        });
        child_second.on('exit', function (exitCode) {
          console.log("Child exited with code: " + exitCode);
        });
        child_second.stdout.on('data', function (data) {
          console.log("STDOUT:", data.toString());

          var failed_modules = child_second.stdout.split(/\n/)

          console.log(dead_modules.concat(failed_modules))

          return dead_modules.concat(failed_modules);
        });

      });
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

router.get('/buildstatus_local', async function (req, res, next) {

  var jenkins_info_reff1 = ""

  var reff1_url_no_psw = "http://localhost:8080" // no PASSWORD...



  file1.myio.on('connection', async function (socket) {

  console.log("Made socket connections fun again");

  const {
      setIntervalAsync,
      clearIntervalAsync
    } = require('set-interval-async/dynamic')

    const timer = setIntervalAsync(
        async () => {
          console.log('...polling...')

           var loop_reff1 = await get_jenkins_info(reff1_url_no_psw, "test3", "", "Ek1-Mini")

          // checks if new job has started. their must be at least 1 job in history
          if ((JSON.stringify(jenkins_info_reff1) !== JSON.stringify(loop_reff1.getLastBuildInfo.timestamp)) && (typeof loop_reff1 !== "undefined") && (typeof loop_reff1.getJobInfo !== "undefined") && (loop_reff1.getJobInfo.firstBuild !== null))
          {
            jenkins_info_reff1 = loop_reff1.getLastBuildInfo.timestamp // update - compare against this next pollning..

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff1', stream, JSON.stringify(loop_reff1));

            run_jenkins_job_stream(socket, reff1_url_no_psw, loop_reff1.getJobInfo.name, loop_reff1.getLastBuildInfo.id); // stream job info and module status
          }

        },
        10000) // brukar köra med 5000 annars..dvs 5 sek..men testa nu med mer för att inte "överbelasta nätet"
  });

  res.render('buildstatus_local', {page: 'Build status', menuId: 'buildstatus'});
});

router.get('/buildstatusscroller_local', async function (req, res, next) {

  var jenkins_info_reff1 = ""
  var jenkins_info_reff2 = ""


  var reff1_url_no_psw = "http://127.0.0.1:8080" // no PASSWORD...
  var reff2_url_no_psw = "http://localhost:8080"  // "http://admin:sudamerica77M!!!@130.237.59.171:8080" // sätt tillbaka sen // var jenkins = require('jenkins')({ baseUrl: 'http://user:pass@localhost:8080', crumbIssuer: true });

  file1.myio.on('connection', async function (socket) {

    console.log("Made socket connections fun again");

    const {
      setIntervalAsync,
      clearIntervalAsync
    } = require('set-interval-async/dynamic')

    const timer = setIntervalAsync(
        async () => {
          console.log('...polling...')

          var loop_reff1 = await get_jenkins_info(reff1_url_no_psw, "test3", "", "Ek1-Mini")
          var loop_reff2 = await get_jenkins_info(reff2_url_no_psw, "test3-ref1", "", "Ek2-Max")
      //    var loop_reff2 = await get_jenkins_info(reff2_url_no_psw, "test","sudamerica77M!!!","Ek2-Maxi")


          //         && (typeof loop_reff1.getLastBuildInfo.timestamp !== "undefined")

          // checks if new job has started. their must be at least 1 job in history
          if ((JSON.stringify(jenkins_info_reff1) !== JSON.stringify(loop_reff1.getLastBuildInfo.timestamp))&& (typeof loop_reff1.getLastBuildInfo.timestamp !== "undefined") && (typeof loop_reff1 !== "undefined") && (typeof loop_reff1.getJobInfo !== "undefined") && (loop_reff1.getJobInfo.firstBuild !== null))
          {
            jenkins_info_reff1 = loop_reff1.getLastBuildInfo.timestamp // update - compare against this next pollning..

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff1', stream, JSON.stringify(loop_reff1));

            run_jenkins_job_stream(socket, reff1_url_no_psw, loop_reff1.getJobInfo.name, loop_reff1.getLastBuildInfo.id); // stream job info and module status
          }

          if ((JSON.stringify(jenkins_info_reff2) !== JSON.stringify(loop_reff2.getLastBuildInfo.timestamp)) && (typeof loop_reff2.getLastBuildInfo.timestamp !== "undefined") && (typeof loop_reff2 !== "undefined") && (typeof loop_reff2.getJobInfo !== "undefined") && (loop_reff2.getJobInfo.firstBuild !== null))
          {
            jenkins_info_reff2 = loop_reff2.getLastBuildInfo.timestamp // update - compare against this next pollning..

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff2', stream, JSON.stringify(loop_reff2));

            run_jenkins_job_stream(socket, reff2_url_no_psw, loop_reff2.getJobInfo.name, loop_reff2.getLastBuildInfo.id); // stream job info and module status
          }

        },
        10000) // brukar köra med 5000 annars..dvs 5 sek..men testa nu med mer för att inte "överbelasta nätet"
  });

  res.render('buildstatusscroller_local', {page: 'Build status', menuId: 'buildstatusscroller_local'});
});

// Man skulle kunna ha såhär..men ..ja tror det blir fel att ladda om allt!...i loop..
router.get('/buildstatus12', async function (req, res, next) {

  var jenkins_info_reff1 = ""
  var jenkins_info_reff2 = ""

  var reff1_url_no_psw = "http://127.0.0.1:8080" // no PASSWORD...
  var reff2_url_no_psw = "http://localhost:8080"  // "http://admin:sudamerica77M!!!@130.237.59.171:8080" // sätt tillbaka sen // var jenkins = require('jenkins')({ baseUrl: 'http://user:pass@localhost:8080', crumbIssuer: true });

  file1.myio.on('connection', async function (socket) {

    console.log("Made socket connections fun again - reff 1_2");

    const {
      setIntervalAsync,
      clearIntervalAsync
    } = require('set-interval-async/dynamic')

    const timer = setIntervalAsync(
        async () => {
          console.log('...polling...reff 1-2..')

          var loop_reff1 = await get_jenkins_info(reff1_url_no_psw, "test3", "", "Ek1-Mini")
          var loop_reff2 = await get_jenkins_info(reff2_url_no_psw, "test3-ref1", "", "Ek2-Max")

          // checks if new job has started. their must be at least 1 job in history
          if ((JSON.stringify(jenkins_info_reff1) !== JSON.stringify(loop_reff1.getLastBuildInfo.timestamp)) && (typeof loop_reff1 !== "undefined") && (typeof loop_reff1.getJobInfo !== "undefined") && (loop_reff1.getJobInfo.firstBuild !== null))
          {
            jenkins_info_reff1 = loop_reff1.getLastBuildInfo.timestamp // update - compare against this next pollning..

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff1', stream, JSON.stringify(loop_reff1));

            run_jenkins_job_stream(socket, reff1_url_no_psw, loop_reff1.getJobInfo.name, loop_reff1.getLastBuildInfo.id); // stream job info and module status
          }
          if ((JSON.stringify(jenkins_info_reff2) !== JSON.stringify(loop_reff2.getLastBuildInfo.timestamp)) && (typeof loop_reff2 !== "undefined") && (typeof loop_reff2.getJobInfo !== "undefined") && (loop_reff2.getJobInfo.firstBuild !== null))
          {

            jenkins_info_reff2 = loop_reff2.getLastBuildInfo.timestamp

            var stream = ss.createStream();
            ss(socket).emit('jenkins_info_reff2', stream, JSON.stringify(loop_reff2));

            run_jenkins_job_stream(socket, reff2_url_no_psw, loop_reff2.getJobInfo.name, loop_reff2.getLastBuildInfo.id);
          }
        },
        10000) // brukar köra med 5000 annars..dvs 5 sek..men testa nu med mer för att inte "överbelasta nätet"
  });

  res.render('buildstatus_local', {page: 'Build status', menuId: 'buildstatus12'});
});

module.exports = router;
