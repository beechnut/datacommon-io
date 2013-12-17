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


var mock_summary_level = "municipality"
  , mock_keys = [19, 21]
  , mock_body = {
      table: 'means_transportation_to_work_by_residence'
    , field: 'ctv_p'
    , summary_level: mock_summary_level
    , keys: mock_keys
}



exports.get_field = function(request, response) {
  console.log(mock_body)
  // console.log(request.body)

  /* input should be: 
    data:
      table: 'api-called-table-name'
      field: 'field-name-value'
      summary_level: 'census_blockgroup'
      keys: [array, of, ids]
  */

  var body          = request.body
    , table         = body.table
    , field         = body.field
    , keys          = body.keys
    , summary_level = body.summary_level
    , key           = shared.getKey(summary_level)
    , result        = {}
    , alias         = shared.getAlias(table, field)

  if ( field.slice(-2) === '_p' ) {
    adj_field = 'AVG('+ field +')'
  } else { 
    adj_field = 'SUM('+ field +')'
  }

  // console.log('field')
  // console.log(field)

  var select = 'SELECT ' + adj_field + ' AS the_field'
    , from   = 'FROM '
    , where  = 'WHERE '+ key +' IN (' + body.keys.join(', ') + ')'
    , query  = ''
    , the_table  = shared.getTable('tabular', table)
    , suffix = shared.rightSuffixFromObject(the_table, summary_level)
    , from   = from + 'mapc.' + the_table.table_name + suffix

  query = select + ' ' + from + ' ' + where

  // console.log('query')
  // console.log(query)

  // console.log('The query: ' + query)
  shared.query_database(query, function (result) {
    // console.log('field:' + field)
    // console.log('result val')
    var result_val = result.rows[0].the_field
    // console.log(result_val)
    response.send( { title: alias, value: result_val } )
  })

}


exports.get_category = function(request, response) {
  console.log(request.method)
  console.log(request.body)

  var body          = request.body
    , category      = body.category
    , keys          = body.keys
    , summary_level = body.summary_level
    , key           = shared.getKey(summary_level)
    , results = {}
    , counter = 0
  
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
        results[category.category].fields.push( { title: aliases[i], value: res[i] } )
      }
      
      console.log('counter: ' + counter)
      console.log('datalen: ' + category.data.length)

      if (counter == category.data.length) {
        response.send(results)
      }
    })
  })


}
