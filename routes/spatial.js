/*

  Boundaries
*/

var pg      = require('pg');
var tables = require('./shared.js').spatial()[0].tables;
var shared  = require('./shared.js');


var findTableMeta = function(dataset_name) {
  for(t=0; t<tables.length; t++){
    if(tables[t].name === dataset_name) {
      return(tables[t]);
    }
  }
}


var makeGeoJSONQueryString = function(schema_name, table, callback) { 
  query = 'SELECT ' + table.key + ' AS key, ST_AsGeoJSON(the_geom) AS geojson FROM ';
  query = query + schema_name + '.' + table.table_name;
  if(callback) { callback(query); }
}


function postGISQueryToFeatureCollection(queryResult, callback) {
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
      "geometry": JSON.parse(queryResult[i].geojson)
    };
    // finally for each property/extra field, add it to the feature as properties as defined in the GeoJSON spec.
    for(prop in queryResult[i]) {
      if (prop !== "geojson" && queryResult[i].hasOwnProperty(prop)) {
        feature[prop] = queryResult[i][prop];
      }
    }
    // Push the feature into the features array in the geojson object.
    geojson.features.push(feature);
  }
  // return the FeatureCollection geojson object.
  if (callback) callback(geojson);
}




exports.dataset = function(request, response){
  var dataset = request.params.dataset.split(',').join(', ');
  var response_obj
    , table_name;
  
  table = findTableMeta(dataset);

  makeGeoJSONQueryString('gisdata', table, function (query){
    shared.query_database(query, function (result) {
      postGISQueryToFeatureCollection(result.rows, function (geojson){
        response.send(geojson);
      });
    });
  }); 
}


exports.meta = function(request, response){
  dataset = request.params.dataset.split(',');
  dataset = dataset.join(', ');
  response.send(findTableMeta(dataset));
}


exports.intersect = function(request, response){
  dataset = request.params.dataset;
  posted_geojson = request.params.posted_geojson;

  response_obj = {
    dataset: dataset,
    content: 'GeoJSON of intersection between layers',
    layers:  [dataset, posted_geojson]
  }
  response.send(response_obj);
}