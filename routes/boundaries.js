/*

  Boundaries

*/

exports.dataset = function(request, response){
  dataset = request.params.dataset.split(',');
  dataset = dataset.join(', ');

  response_obj = {
    dataset: dataset,
    content: 'GeoJSON boundaries'
  }
  response.send(response_obj);
}


exports.meta = function(request, response){
  dataset = request.params.dataset;

  response_obj = {
    dataset: dataset,
    content: 'verbose metadata',
    example_fields: [ 'extent'
                    , 'data_stewards'
                    , 'data_providers'
                    , 'summary_level'
                    ]
  }
  response.send(response_obj);
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