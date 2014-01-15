var shared = require('./shared.js');
var pg = require('pg');
var _ = require('underscore');




var makeQuery = function(s_schema_name, t_schema_name, s_table, t_table, fields, suffix, key, callback) {

  var query = "SELECT "+ fields +", ST_AsGeoJSON(ST_Transform(g.the_geom, 4326)) AS geojson "
            + " FROM "+ s_schema_name +"."+ s_table.table_name +" g"
            + " JOIN "+ t_schema_name +"."+ t_table.table_name + shared.rightSuffix(suffix) + " a"
            + " ON g."+ key +" = a."+ key + " ;"

  console.log(query);
  if (callback) callback(query);
}


var makeIntersectQuery = function(s_schema_name, t_schema_name, s_table, t_table, fields, suffix, key, geojson, callback){

  // var query = "SELECT subquery.* FROM ("
  // + "SELECT "+ fields +", ST_AsGeoJSON("
  //   + "ST_Intersection("
  //     + "ST_SetSRID(ST_GeomFromGeoJSON('"+ JSON.stringify(geojson, shared.floatOnOkay) +"'), 4326),"
  //     + "ST_Transform(g.the_geom, 4326)"
  //   + ")"
  // + ") AS geojson"
  // + " FROM "+ s_schema_name +"."+ s_table.table_name +" g"
  // + " JOIN "+ t_schema_name +"."+ t_table.table_name + shared.rightSuffix(suffix) + " a"
  // + " ON g."+ key +" = a."+ key +" ) AS subquery"
  // + " WHERE geojson <> '{\"type\":\"GeometryCollection\",\"geometries\":[]}';"

  var query = "SELECT subquery.* FROM("
            +   "SELECT "+ fields +","
            +   "ST_AsGeoJSON(ST_Transform(g.the_geom, 4326)) AS geojson"
            +   " FROM "+ s_schema_name +"."+ s_table.table_name +" g"
            +   " JOIN "+ t_schema_name +"."+ t_table.table_name + shared.rightSuffix(suffix) +" a"
            +   " ON g."+ key +" = a."+ key
            +   " WHERE ST_Intersects("
            +     "ST_SetSRID("
            +       "ST_GeomFromGeoJSON('"+ JSON.stringify(geojson, shared.floatOnOkay) +"')"
            +       ", 4326)"
            +   ", ST_Transform(ST_Simplify(g.the_geom, 1000), 4326))) AS subquery"
            + " WHERE geojson <> '{\"type\":\"GeometryCollection\",\"geometries\":[]}';"

  console.log(query);
  if (callback) callback(query);
}


exports.dataset = function(request, response) {
  var s_dataset = request.params.s_dataset;
  var t_dataset = request.params.t_dataset;
  
  var s_table   = shared.getTable('spatial', s_dataset);
  var t_table   = shared.getTable('tabular', t_dataset);

  var key    = s_table.key;
  var suffix = s_table.key.slice(0,2); // TODO: do this better

  var fields  = "a.*"

  if (request.params.fields) {
    fields = _.map(request.params.fields.split(','), function (el) {
      return el = "a." + el;
    });
    fields.push('a.' + key);
    fields = fields.join(',');
  }

  // TODO: make this function legible & object-oriented
  makeQuery('gisdata', 'mapc', s_table, t_table, fields, suffix, key, function (query) {
    shared.query_database(query, function (result) {
      shared.postGISQueryToFeatureCollection(result.rows, function(geojson){
        response.send(geojson);
      });
    });
  });
}


exports.intersect = function(request, response) {
  var s_dataset = request.params.s_dataset;
  var t_dataset = request.params.t_dataset;

  
  var posted_geojson;

  if (request.method == 'GET') {
    posted_geojson = JSON.parse(request.params.posted_geojson);
  }
  if (request.method == 'POST'){
    posted_geojson = request.body;
  }
  console.log(request.method, posted_geojson);

  console.log(s_dataset)
  var s_table   = shared.getTable('spatial', s_dataset);
  var t_table   = shared.getTable('tabular', t_dataset);

  var key    = s_table.key;
  var suffix = s_table.suffix; // TODO: do this better

  var fields  = "a.*"

  if (request.params.fields) {
    fields = _.map(request.params.fields.split(','), function (el) {
      return el = "a." + el;
    });
    fields.push('a.' + key);
    fields = fields.join(',');
  }

  // TODO: make this function legible & object-oriented
  makeIntersectQuery('gisdata', 'mapc', s_table, t_table, fields, suffix, key, posted_geojson, function (query) {
    shared.query_database(query, function (result) {
      shared.postGISQueryToFeatureCollection(result.rows, function(geojson){
        response.send(geojson);
      });
    });
  });
}