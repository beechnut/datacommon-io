/*

  Boundaries
*/

var pg      = require('pg');
var spatial = require('./shared.js').spatial();


var findTableObjectWithName = function(dataset_name) {
  tables = spatial.tables;
  for(t=0; t<tables.length; t++){
    if(tables[t].name === dataset_name) {
      return(tables[t]);
    }
  }
}


var makeGeoJSONQueryString = function(schema_name, table_name, callback) { 
  query = 'SELECT ST_AsGeoJSON(the_geom) from ';
  query = query + schema_name + '.' + table_name;
  callback();
}


var queryForGeoJSON = function(querystring, callback){
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




exports.dataset = function(request, response){
  var dataset = request.params.dataset.split(',').join(', ');
  var response_obj
    , table_name;
  
  table_object = findTableObjectWithName(dataset);
  if (table_object) table_name = table_object.table_name;

  makeGeoJSONQueryString('gisdata', table_name, function (){
    queryForGeoJSON(query, function (result) {
      response.send(result);
    });
  }); 
}


exports.meta = function(request, response){
  dataset = request.params.dataset.split(',');
  dataset = dataset.join(', ');
  response.send(findTableObjectWithName(dataset));
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