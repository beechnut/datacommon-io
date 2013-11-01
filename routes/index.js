
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Metro Boston Data Common API' });
};