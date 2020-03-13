var express = require('express');
var router = express.Router();


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
        for (var j = 0; j < original_DATA[i].errors.length; j++) {
          total_errors += parseInt(original_DATA[i].errors[j].occurrences)
          total_string_log += original_DATA[i].errors[j].message + "\n"
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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {page:'Home', menuId:'home',hosts: Array.from(new Set(hosts)).length.toString() , modules: Array.from(new Set(modules)).length.toString(),amount_errors: amount_errors.toString()});
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
