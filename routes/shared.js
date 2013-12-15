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


exports.rightSuffix = function (suffix) {
  console.log("suffix: " + suffix);
  if(_.isNull(suffix)) {
    return "";
  } else {
    return "_" + suffix;
  }
}


exports.getKey = function (summary_level) {
  console.log('#get')
  switch(summary_level){
    case 'municipality':
      return 'muni_id'
      break
    case 'census_blockgroup':
      return 'bg10_id'
      break
    case 'census_tract':
      return 'ct10_id'
      break
  }
}


exports.getAlias = function (table, fieldname) {
  
  var match
  if (typeof table === 'string') { 
    table = exports.getTable('tabular', table) }
  

  _.each(table.attributes, function(field) {
    if (field.field_name === fieldname) {
      // console.log('match: ' + field.alias)
      match = field.alias }
  })

  return match
}


exports.rightSuffixFromObject = function (table, summary_level) {
  if (typeof table === 'string') { table = exports.getTable('tabular', table) }
  
  var match

  _.each(table.summary_levels, function (level) {
    if (level.name === summary_level) { 
      match = exports.rightSuffix( level.suffix ) }
  })
  return match
}



exports.find = function (needle, haystack, value){
  for(t=0; t < haystack.length; t++){
    if(eval('haystack[t][value]') === needle){
      // console.log(haystack[t], needle)
      return(haystack[t]);
    } 
  }
}


exports.getTable = function(category, dataset_name) {
  var cat_tables = tablesFor(category);
  // console.log(dataset_name);
  // console.log(cat_tables);
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



exports.floatOnOkay = function (key, value) {
  if (util.isArray(value)) {
    if (typeof(value[0]) == 'string'){
      return Array(parseFloat(value[0]), parseFloat(value[1]));
    } else {
      return value;
    }
  }
  return value;
}


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

exports.postGISQueryToFeatureCollection = function(queryResult, callback) {
  // Initalise variables.
  var i = 0,
  prop = null,
  geojson = {
    "type": "FeatureCollection",
    "features": []
  }; // Set up the initial GeoJSON object.

  for(i = 0; i < queryResult.length; i++) { // For each result create a feature
    var feature = {
      "type": "Feature",
      "geometry": JSON.parse(queryResult[i].geojson),
      "properties": {}
    };
    // finally for each property/extra field, add it to the feature as properties as defined in the GeoJSON spec.
    for(prop in queryResult[i]) {
      if (prop !== "geojson" && queryResult[i].hasOwnProperty(prop)) {
        feature["properties"][prop] = queryResult[i][prop];
        // console.log("properties: " + prop);
        // console.log("feature[prop]: " + feature[prop]);
      }
    }
    // Push the feature into the features array in the geojson object.
    if (feature.geometry != null){
      geojson.features.push(feature);
    }
  }
  console.log(geojson.features.length + " features returned.");
  // return the FeatureCollection geojson object.
  if (callback) callback(geojson);
}


exports.sample_geojson = function() {
  return '{"type":"Polygon","coordinates":[[[-71.41937255859375,41.98195261665715]'
       + ',[-71.41937255859375,42.70060440808085],[-70.88104248046875,42.70060440808085]'
       + ',[-70.88104248046875,41.98195261665715],[-71.41937255859375,41.98195261665715]]]}}'
}
