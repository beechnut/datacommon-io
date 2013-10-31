/*

  Spatial

  postGISQueryToFeatureCollection from https://gist.github.com/samgiles/2299524

*/

var pg     = require('pg');
var shared = require('./shared.js');
var sample_geojson = require('./shared.js').sample_geojson();
var _ = require('underscore');
var util = require('util');


var makeGeoJSONQueryString = function(schema_name, table, callback) { 
  query = 'SELECT ' + table.key + ' AS key, ST_AsGeoJSON('
  query = query + 'ST_Transform(the_geom, 4326)) AS geojson FROM '
  query = query + schema_name + '.' + table.table_name;
  console.log(query);
  if(callback) callback(query);
}

var floatOnOkay = function (key, value) {
  if (util.isArray(value)) {
    if (typeof(value[0]) == 'string'){
      return Array(parseFloat(value[0]), parseFloat(value[1]));
    } else {
      return value;
    }
  }
  return value;
}

var makeIntersectQueryString = function(schema_name, table, posted_geojson, callback) { 
  query = "SELECT subquery.key, subquery.geojson FROM ("
            + " SELECT " + table.key + " AS key, ST_AsGeoJSON("
            + "ST_Intersection("
              + "ST_SetSRID(ST_GeomFromGeoJSON("
                  + "'" + JSON.stringify(posted_geojson, floatOnOkay) + "'), 4326)"
                  + ", ST_Transform(the_geom, 4326)"
                + ")"
              + ") AS geojson"
            + " FROM gisdata." + table.table_name
          + ") AS subquery WHERE geojson <> '{\"type\":\"GeometryCollection\",\"geometries\":[]}';"
  console.log(query);
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
    if (feature.geometry != null){
      geojson.features.push(feature);
    }
  }
  console.log(geojson.features.length + " features returned.");
  // return the FeatureCollection geojson object.
  if (callback) callback(geojson);
}




exports.dataset = function(request, response){
  var dataset = request.params.dataset.split(',').join(', ');
  var table   = shared.getTable('spatial', dataset);

  if(!table) response.send("There is no dataset by that name."
                            + "Try <a href=\"/spatial/list\">"
                            + "datacommon.io/datasets/list</a> to see"
                            + " all available datasets.");

  makeGeoJSONQueryString('gisdata', table, function (query){
    shared.query_database(query, function (result) {
      postGISQueryToFeatureCollection(result.rows, function (geojson){
        response.send(geojson);
      });
    });
  }); 
}


exports.intersect = function(request, response){
  dataset = request.params.dataset;
  var posted_geojson;

  if (request.method == 'GET') {
    posted_geojson = JSON.parse(request.params.posted_geojson);
  }
  if (request.method == 'POST'){
    posted_geojson = request.body;
  }
  console.log(request.method, posted_geojson);

  if (_.isEmpty(posted_geojson)) posted_geojson = sample_geojson;

  table = shared.getTable('spatial', dataset);

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