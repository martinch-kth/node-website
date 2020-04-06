var express = require('express');
var router = express.Router();

var browseDir = require("browse-directory");

var dirFiles = browseDir.browseFiles("public/data");

// transform array
const filenames= dirFiles.map(element => element.name);

var treemap_data_errors   = [] // globalt... :-/
var treemap_data_warnings = []

var hosts = []
var modules = []

var amount_errors = 0
var amount_warnings = 0

// mystuff.json till json objekt..

const jsonfile = require('jsonfile')
const file_errors   = 'public/data/original-data-structure-errors.json'
const file_warnings = 'public/data/original-data-structure-warnings.json'

createTreemapData(file_errors)

createTreemapData(file_warnings)

//----------------------------------------------------------------------------
function createTreemapData(file) {
  jsonfile.readFile(file, function (err, obj) {
    if (err) console.error(err)

    var original_DATA = obj.modules

    for (var i = 0; i < original_DATA.length; i++) {
      hosts.push(original_DATA[i].onHost)
      modules.push(original_DATA[i].moduleName)

      // errors , warnings array
      var total_errors = 0
      var total_warnings = 0
      var total_string_log = ""

      // Check if json was errors or warnings..
      if (original_DATA[i].hasOwnProperty('errors')) {

        // Gå igenom ..
        for (var j = 0; j < original_DATA[i].errors.length; j++) {
          total_errors += parseInt(original_DATA[i].errors[j].occurrences)

          // få in occurances in i strängen.. -> Error log:
          //                                     occurrences: 1

          occurrences_string = "Occurrences: " + original_DATA[i].errors[j].occurrences + "\n"

          // sätt occurences...

          // ta ut felmeddelandet, dela upp det så det finns radbrytning var 50:e tecken..

          // i slutet så lägger du även till htlm <BR> så att Semantic UI ska förstå .... . . .

          total_string_log += occurrences_string + explode(original_DATA[i].errors[j].message,50) + "<br />"
        }
      }


      else if (original_DATA[i].hasOwnProperty('warnings')) {
        for (var j = 0; j < original_DATA[i].warnings.length; j++) {
          total_warnings += parseInt(original_DATA[i].warnings[j].occurrences)
          total_string_log += original_DATA[i].warnings[j].message + "\n"
        }
      }

      amount_errors += total_errors
      amount_warnings += total_warnings

      treemap_data_errors.push({
        "key": total_string_log,
        "region": original_DATA[i].onHost,
        "subregion": original_DATA[i].moduleName,
        "value": total_errors
      })

      treemap_data_warnings.push({
        "key": total_string_log,
        "region": original_DATA[i].onHost,
        "subregion": original_DATA[i].moduleName,
        "value": total_warnings
      })

    }

    console.log("total host: " + Array.from(new Set(hosts)).length)
    console.log("total modules: " + Array.from(new Set(modules)).length)
    console.log("total errors: " + amount_errors)
    console.log("total warnings: " + amount_warnings)

    console.log("-------------------------------------------")
  })
}

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
  res.render('index', {page:'Home', menuId:'home',hosts: Array.from(new Set(hosts)).length.toString() , modules: Array.from(new Set(modules)).length.toString(),filenames: filenames,amount_errors: amount_errors.toString()});
});


/* GET treemap data */
router.get('/treemap', function(req, res, next) {
  res.json(treemap_data_errors)
});


router.get('/about', function(req, res, next) {
  res.render('about', {page:'About Us', menuId:'about'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact', {page:'Contact Us', menuId:'contact'});
});

module.exports = router;
