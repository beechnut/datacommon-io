var pg = require('pg');

exports.spatial = function() {
  return require('../lib/spatial_meta.yaml');
}

exports.boundaries = function() {
  return require('../lib/boundaries_meta.yaml');
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

exports.sample_geojson = function() {
  return '{"type":"Polygon","coordinates":[[[-71.41937255859375,41.98195261665715]'
       + ',[-71.41937255859375,42.70060440808085],[-70.88104248046875,42.70060440808085]'
       + ',[-70.88104248046875,41.98195261665715],[-71.41937255859375,41.98195261665715]]]}}'
}