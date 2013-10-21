var pg = require('pg');

exports.spatial = function() {
  return require('../lib/spatial_meta.yaml');
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