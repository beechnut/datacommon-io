
/*
 * Get verbose information on categories of datasets,
 * including lists of 
 */

var pg = require('pg');
var spatial = require('./shared.js').spatial();


var getTableList = function(dataset) {
  
}

exports.list = function(request, response){

  category = request.params.category;
  categories = ['datasets','boundaries','spatial']; // TODO refactor/DRY

  if (categories.indexOf(category) > -1) {
    


    response.send(the_list);
  } else {
    response.send("category must be one of: " + categories.join(', '));
  }

};


exports.verbose = function(request, response){

  category = request.params.category;
  categories = ['datasets','boundaries','spatial'];

  if (categories.indexOf(category) > -1) {
    response.send("respond with a list of available datasets in the "
      + category + " category, as well as verbose metadata about "
      + category + " datasets");
  } else {
    response.send("category must be one of: " + categories.join(', '));
  }

};