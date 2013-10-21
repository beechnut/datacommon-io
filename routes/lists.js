
/*
 * Get verbose information on categories of datasets,
 * including lists of 
 */

var spatial = require('./shared.js').spatial();


var findCategoryObject = function(category, callback){
  for(var t=0 ; t<spatial.length ; t++){
    if (spatial[t].category == category) { 
      if (callback) {
        callback(spatial[t]);
      }
    }
  }
}


var getTableList = function(category, callback) {
  findCategoryObject(category, function(category_obj) {
    var array = [];
    var tables = category_obj.tables;
    for(var t=0 ; t<tables.length ; t++){
      array.push( { title : tables[t].title, name : tables[t].name } );
    }
    if (callback) callback(array);
  });
}

var getVerboseTableList = function(category, callback) {
  findCategoryObject(category, function (category_obj) {
    if (callback) callback(category_obj.tables);
  });
}




exports.list = function(request, response){
  category = request.params.category;
  categories = ['datasets','boundaries','spatial']; // TODO refactor/DRY

  if (categories.indexOf(category) > -1) {

    getTableList(category, function(array){
      response.send( array );
    });
    
  } else {
    response.send("category must be one of: " + categories.join(', '));
  }
};


exports.verbose = function(request, response){

  category = request.params.category;
  categories = ['datasets','boundaries','spatial'];

  if (categories.indexOf(category) > -1) {
    getVerboseTableList(category, function (tables) { 
      response.send(tables);
    });
  } else {
    response.send("category must be one of: " + categories.join(', '));
  }

};