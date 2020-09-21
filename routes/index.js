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

  // gör om till array!?!..

  const tree = treed[2]

  var latest_parent = "";
  var jstree = []

  function eachRecursive(data) {
    if (data.type === "directory") {
      var dirobj = { id: data.name, parent: "#", text: data.name };
      latest_parent = data.name;

      jstree.push(dirobj);
    } else if (data.type === "file") {
      // man skulle kunnna spara namnet på .. den i en TMP var.. fukk va dåligT!!!
      var fileobj = { id: data.name, parent: latest_parent, text: data.name };

      jstree.push(fileobj);
    }

    // Ta hand om barnen
    if (Array.isArray(data.children)) {
      // varning.. vad händer.. då data.children INTE finns alls...
      for (var i = 0; i < data.children.length; i++) {
        eachRecursive(data.children[i]);
      }
    }
  }

  tree.forEach(eachRecursive);

  console.log("borde va nptt...: "+ jstree);

  return jstree
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

module.exports = router;
