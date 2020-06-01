var express = require('express');
var router = express.Router();

var browseDir = require("browse-directory");

// Måste nollställa vid varje..reset.. mmm  s'tt in det någonstan..
var hosts = []
var modules = []

var amount_errors = 0 // får ta tag i det från..någon metod...

const jsonfile = require('jsonfile')

async function createTreemapData(file) {
  try {
    const file_data = await jsonfile.readFile(file, 'utf8');

    var content = file_data.modules

    var treemap_data_errors = []

    for (var i = 0; i < content.length; i++) {
      hosts.push(content[i].onHost)
      modules.push(content[i].moduleName)

      // errors array
      var total_errors = 0
      var total_string_log = ""

      // Check if json was errors or warnings..
      if (content[i].hasOwnProperty('errors')) {

        for (var j = 0; j < content[i].errors.length; j++) {
          total_errors += parseInt(content[i].errors[j].occurrences)

          // få in occurances in i strängen.. -> Error log:
          //                                     occurrences: 1

          occurrences_string = "Occurrences: " + content[i].errors[j].occurrences + "\n"

          // sätt occurences...
          // ta ut felmeddelandet, dela upp det så det finns radbrytning var 50:e tecken..
          // i slutet så lägger du även till htlm <BR> så att Semantic UI ska förstå .... . . .

          total_string_log += occurrences_string + explode(content[i].errors[j].message,50) + "<br />"
        }
      }

      amount_errors += total_errors

      treemap_data_errors.push({
        "key": total_string_log,
        "region": content[i].onHost,
        "subregion": content[i].moduleName,
        "value": total_errors
      })
    }

    console.log("total host: " + Array.from(new Set(hosts)).length)
    console.log("total modules: " + Array.from(new Set(modules)).length)
    console.log("total errors: " + amount_errors)

    console.log("-------------------------------------------")

    return treemap_data_errors

  } catch (e) {
    console.error(e);
  }
}

function getAllFiles() {

  var dirFiles = browseDir.browseFiles("public/data");

  return dirFiles.map(element => element.src)
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


// så.. detta vill man egentligen inte ha med nått...med...

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {page:'Home', menuId:'home',hosts: Array.from(new Set(hosts)).length.toString() , modules: Array.from(new Set(modules)).length.toString(),filenames: getAllFiles(),amount_errors: amount_errors.toString()});
});

router.get('/treemapinput', async function(req, res) {

  // Access the provided 'file' query parameters
  let file = req.query.file;
  var result = await createTreemapData(file)

  res.json(result)
});

router.get('/about', function(req, res, next) {
  res.render('about', {page:'About Us', menuId:'about'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {page:'Contact Us', menuId:'contact'});
});

module.exports = router;
