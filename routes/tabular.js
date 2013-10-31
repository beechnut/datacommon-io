var shared = require('./shared.js');
var pg = require('pg');

var makeQuery = function(schema_name, table_name, fields, callback) {
  var suffix = "m"
  var query = "SELECT array_to_json(array_agg(row_to_json(s))) FROM "
            + "(SELECT " + fields + " from " + schema_name
              + "." + table_name + "_" + suffix + ") s;";

  console.log(query);
  if (callback) callback(query);
}


exports.dataset = function(request, response) {
  var dataset = request.params.dataset;
  var table   = shared.getTable('tabular', dataset);
  console.log('TABLE!!!' + table);

  makeQuery('mapc', table.table_name, "*", function (query) {
    shared.query_database(query, function (result) {
      response.send(result.rows[0].array_to_json);
    });
  });
}

exports.dataset_fields = function(request, response) {
  var dataset = request.params.dataset;
  var table   = shared.getTable('tabular', dataset);
  console.log('TABLE!!!' + table);

  var fields  = request.params.fields;
  if (fields != "*") fields = fields + ",muni_id"

  makeQuery('mapc', table.table_name, fields, function (query) {
    shared.query_database(query, function (result) {
      response.send(result.rows[0].array_to_json);
    });
  });
}
