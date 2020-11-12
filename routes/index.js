var express = require('express');
var router = express.Router();
var browseDir = require("browse-directory");

const dirTree = require("directory-tree");


var _ = require('lodash');
const jsonfile = require('jsonfile')

var Comments = require('.././comments');

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


function getJstree() {

  const treed = Object.values(dirTree("public/data"));
  const tree = treed[2]

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
        var dirobj = { id: data.path , parent: "#" ,text: data.name };
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

  /*  värKligheTen...

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
router.get('/', function(req, res, next) {
  res.render('index', {page:'Home', menuId:'home',filenames: getAllFiles()});
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


//
//  kräver att man kan lösenord.... funkar det här?...
//
router.get('/buildstatus', function(req, res, next) {

  var jenkinsapi = require('jenkins-api');


// username/password
  var jenkins = jenkinsapi.init("http://admin:admin@localhost:8080");

  jenkins.last_build_info('test3', function(err, data) {
    if (err){ return console.log(err); }
   // console.log(data)


    jenkins.console_output('test3', data.id,  function(err, data) {
      if (err){ return console.log(err); }


      var log = data.body.split("\n")  // split on each line..

      log.forEach(line => {

            var line_array = line.split(/ +/)  // split on spaces only

            line_array.forEach(element => {

              fleetCheck() // borde vara här..(?) .. element = fleet-check-started
                           // hemskt.. nu är den startad... man måste väl även få ended..INNAN man går vidare..

              //  if (fleet-check-started and fleet-check-ended ... då kan du få ut,,,åå..knepigt...!!

              if (element.includes("[") && element.includes("]"))
              {
                var step = line_array[line_array.indexOf(element)+1]

                if (step.charAt(step.length-1) === ")" )
                {
                  // här ska vi antagligen ...gör något beroende på nr?... eller lägga alla nr till en array?
                  // all_steps_so_far.push(nr....????)

                  console.log("this is it--> " +  step.substring(0, step.length - 1))
                }
              }
            });
      })
    });

  });




  // http://10.68.108.131:8080

/*
  var jenkins = require('jenkins')({ baseUrl: 'http://admin:admin@localhost:8080', crumbIssuer: true });

  jenkins.info(function(err, data) {
    if (err) throw err;

    console.log('info', data);
  });



  jenkins.last_build_info('test3', function(err, data) {
    if (err){ return console.log(err); }
    console.log(data)
  });

//     'baseUrl': 'http://10.68.108.131:8080',

*/

/*
  var JenkinsLogStream = require('jenkins-log-stream');
  var stream = new JenkinsLogStream({
    'baseUrl': 'http://admin:admin@localhost:8080',
    'job': 'test3',
    'build': 'lastBuild',
    'pollInterval': 1000
  });

  stream.pipe(process.stdout);

*/

  res.render('buildstatus', {page:'Build status', menuId:'buildstatus'});
});

module.exports = router;
