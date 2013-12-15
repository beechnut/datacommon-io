var shared = require('./shared.js')
  , pg = require('pg')
  , _ = require('underscore');



exports.index = function (request, response) {
  response.send({hey: 'no'})
}


exports.check = function (request, response) {
  /* three objects:

      + category object
      + keys
      + summary level


      Use the RestClient gem (Ruby) to access this method:

      `response = RestClient.post 'http://localhost:2474/report/check', obj.to_json, content_type: :json`
  */

  var body          = request.body
    , category      = body.category
    , keys          = body.keys.join(', ')
    , summary_level = body.summary_level

  if (request.method === 'GET') { body = {trouble: 'yeah'} }

  response.send(JSON.stringify( { category: category, keys: keys, summary_level: summary_level, first_key: keys[0] } ))
}


var sumlev = "municipality"

var category = { category: 'transportation',
    data: [
    {
      table: 'means_transportation_to_work_by_residence', 
      fields: ['ctv_p', 'pubtran_p', 'bicycle_p', 'walk_p', 'other_p'] },
    {
      table: 'travel_time_to_work', 
      fields: ['mlt15_p', 'm15_30_p', 'm30_45_p', 'm45_60_p', 'm60ovr_p'] },
    {
      table: 'vehicles_per_household', 
      fields: ['c0_p', 'c1_p', 'c2_p', 'c3p_p'] }
    ]}

keys = [19, 21]

var mock_body = {
    category:      category
  , summary_level: sumlev
  , keys:          keys
}



exports.get_field = function(request, response) {

}


exports.get_category = function(request, response) {
  console.log(request.method)

  var body          = mock_body // request.body
    , category      = body.category
    , keys          = body.keys
    , summary_level = body.summary_level
    , key           = shared.getKey(summary_level)
    , results = {}
    , counter = 0
    , results = {}
  
  results[category.category] = ({ category: category.category, fields: [] })

  _.each(category.data, function (table) {
    var select = 'SELECT array_agg(s) as results FROM (SELECT'
    , from   = 'FROM '
    , where  = 'WHERE a.'+ key +' IN (' + body.keys.join(', ') + ')) AS s'
    , query  = ''
    , the_table  = shared.getTable('tabular', table.table)
    , suffix = shared.rightSuffixFromObject(the_table, summary_level)
    , from   = from + 'mapc.' + the_table.table_name + suffix + ' AS a '

    var aliases = _.map(table.fields, function(fieldname) {
      return shared.getAlias(table.table, fieldname)
    })

    var mapped_fields = _.map(table.fields, function(field) { return 'a.' + field })

    mapped_fields = _.map(mapped_fields, function(field) { 
      if ( field.slice(-2) === '_p' ) {
        return ' AVG('+ field +')'
      } else { return ' SUM('+ field +')' }
    })
    select = select + mapped_fields


    query = select + ' ' + from + ' ' + where

    // console.log('The query: ' + query)
    shared.query_database(query, function (result) {
      
      counter++
      // create an array of the result values

      var res = result.rows[0].results.split(',')
      res[0] = res[0].slice(3)
      res[res.length-1] = res[res.length-1].slice(0,-3)
      

      for(var i = 0 ; i < aliases.length ; i++) {
        console.log(i)
        console.log(aliases[i])
        console.log(res[i])
        results[category.category].fields.push( { name: aliases[i], value: res[i] } )
      }
      
      console.log('counter: ' + counter)
      console.log('datalen: ' + category.data.length)

      if (counter == category.data.length) {
        response.send(results)
      }
    })
  })


}
