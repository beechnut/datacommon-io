var pg   = require('pg');
var _    = require('underscore');
var util = require('util');

exports.spatial = function() {
  return require('../lib/spatial_meta.yaml');
}

exports.boundaries = function() {
  return require('../lib/boundaries_meta.yaml');
}

exports.tabular = function() {
  return require('../lib/tabular_meta.yaml');
}


var spatial    = exports.spatial();
var boundaries = exports.boundaries();
var tabular    = exports.tabular();

var categories = _.map([spatial, boundaries, tabular], function(c) { return c[0] });

var category_names = _.map(categories, function(c) { return c.category });

var tables = {}
_.map(categories, function(c) { tables[c.category] = c.tables; });

var response_error = {
      'status': 'error',
      'reason': 'Category in /:category/list must be one of: ' + category_names.join(', '),
      'accepted_categories': category_names
    }


var tablesFor = function(category_name){
  return tables[category_name];
}


var findCategoryObject = function(category, callback){
  var table = eval(category);
  for(var t=0 ; t<table.length ; t++){
    if (table[t].category == category) { 
      if (callback) callback(table[t]);
    }
  }
}


var getTableList = function(category, callback) {
  findCategoryObject(category, function(category_obj) {
    var array = [];
    var tables = category_obj.tables;
    for(var t=0 ; t<tables.length ; t++){
      array.push( { title : tables[t].title, name : tables[t].name } );
    }
    if (callback) callback(array);
  });
}


var list = function(request, verbose){
  var category = request.params.category;
  var response;

  if (category_names.indexOf(category) > -1) {
    if(verbose == true){
      response = tablesFor(category);
    } else {
      getTableList(category, function(array){ response = array; });
    }
  } else {
    response = response_error;
  }
  return response;
}




exports.find = function (needle, haystack, value){
  for(t=0; t < haystack.length; t++){
    if(eval('haystack[t][value]') === needle) return(haystack[t]);
  }
}


exports.getTable = function(category, dataset_name) {
  var cat_tables = tablesFor(category);
  return exports.find(dataset_name, cat_tables, 'name');
}




exports.meta = function(request, response) {
  category = request.params.category;
  dataset  = request.params.dataset;
  response.send(exports.getTable(category, dataset));
}


exports.list = function(request, response){
  response.send( list(request, false) );
};


exports.verbose = function(request, response){
  response.send( list(request, true) );
};




exports.query_database = function(querystring, callback){
  var conn   = process.env.DB_URL || 'postgres://localhost/gisdata';
  var client = new pg.Client(conn);

  client.connect(function (err){
    if(err) return console.error('Could not connect to postgres.', err);

    client.query(querystring, function (err, result) {
      if(err) return console.error('Error with query.', err);
      if(callback) { callback(result); }
    });
  });
}


exports.sample_geojson = function() {
  return '{"type":"Polygon","coordinates":[[[-71.41937255859375,41.98195261665715]'
       + ',[-71.41937255859375,42.70060440808085],[-70.88104248046875,42.70060440808085]'
       + ',[-70.88104248046875,41.98195261665715],[-71.41937255859375,41.98195261665715]]]}}'
}
