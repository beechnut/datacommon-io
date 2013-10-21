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


var makeGeoJSONQueryString = function(schema_name, table_name, callback) { 
  query = 'SELECT ST_AsGeoJSON(the_geom) from ';
  query = query + schema_name + '.' + table_name;
  if(callback) { callback(query); }
}




exports.dataset = function(request, response){
  var dataset = request.params.dataset.split(',').join(', ');
  var response_obj
    , table_name;
  
  table_meta = findTableMeta(dataset);
  if (table_meta) table_name = table_meta.table_name;

  makeGeoJSONQueryString('gisdata', table_name, function (query){
    shared.query_database(query, function (result) {
      response.send(result);
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