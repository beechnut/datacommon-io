var shared = require('./shared.js');
var pg = require('pg');
var _ = require('underscore');

var makeQuery = function(s_schema_name, t_schema_name, s_table, t_table, fields, suffix, key, callback) {

  var query = "SELECT g.the_geom, " + fields + ""
            + " FROM "+ s_schema_name +"."+ s_table.table_name +" g"
            + " JOIN "+ t_schema_name +"."+ t_table.table_name +"_" + suffix + " a"
            + " ON g."+ key +" = a."+ key +";"

  console.log(query);
  if (callback) callback(query);
}

exports.dataset = function(request, response) {
  var s_dataset = request.params.s_dataset;
  var t_dataset = request.params.t_dataset;
  
  var s_table   = shared.getTable('spatial', s_dataset);
  var t_table   = shared.getTable('tabular', t_dataset);

  var key    = s_table.key;
  var suffix = s_table.key.slice(0,2);

  var fields  = "*"

  if (request.params.fields) {
    fields = _.map(request.params.fields.split(','), function (el) {
      return el = "a." + el;
    });
    fields.push('a.' + key);
    fields = fields.join(',');
  }

  makeQuery('gisdata', 'mapc', s_table, t_table, fields, suffix, key, function (query) {
    shared.query_database(query, function (result) {
      response.send(result.rows);
    });
  });
}
