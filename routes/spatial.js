/*

  Spatial

  postGISQueryToFeatureCollection from https://gist.github.com/samgiles/2299524

*/

var pg     = require('pg');
var tables = require('./shared.js').spatial()[0].tables;
var shared = require('./shared.js');
var sample_geojson = require('./shared.js').sample_geojson();
var _ = require('underscore');

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
  if(callback) callback(query);
}

var makeIntersectQueryString = function(schema_name, table, posted_geojson, callback) { 
  query = 'SELECT ' + table.key + ' AS key, ST_AsGeoJSON(ST_Intersection(ST_SetSRID('
        + 'ST_GeomFromGeoJSON(\'' + posted_geojson + '\'), 4326),'
        + 'ST_Transform(the_geom, 4326))) AS geojson FROM ' + schema_name + '.' + table.table_name;
  if(callback) callback(query);
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
    if (!feature.geometry.geometries) geojson.features.push(feature);
  }
  console.log(geojson.features.length);
  // return the FeatureCollection geojson object.
  if (callback) callback(geojson);
}




exports.dataset = function(request, response){
  var dataset = request.params.dataset.split(',').join(', ');
  var table = findTableMeta(dataset);

  if(!table) response.send("There is no dataset by that name."
                            + "Try <a href=\"/spatial/list\">"
                            + "datacommon.io/datasets/list</a> to see"
                            + "all available datasets.");

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

  if (_.isEmpty(JSON.parse(posted_geojson))) posted_geojson = sample_geojson;

  table = findTableMeta(dataset);

  if(!table) response.send("There is no dataset by that name."
                            + "Try <a href=\"/spatial/list\">"
                            + "datacommon.io/datasets/list</a> to see"
                            + "all available datasets.");
  
  makeIntersectQueryString('gisdata', table, posted_geojson, function (query){
    shared.query_database(query, function (result) {
      postGISQueryToFeatureCollection(result.rows, function (geojson){
        response.send(geojson);
      });
    });
  }); 
}