
/**
 * Module dependencies.
 */

var express = require('express');
var yaml    = require('js-yaml');

var routes     = require('./routes');
var spatial    = require('./routes/spatial');
var tabular    = require('./routes/tabular');
var geographic = require('./routes/geographic');
var report     = require('./routes/report');
var shared     = require('./routes/shared');

// var boundaries = require('./routes/boundaries');

var http    = require('http');
var path    = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 2474);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', routes.index);

app.get('/topics', shared.topics);  //=> List of topics
app.get('/topics/:topic', shared.tables);  //=> List of tables for a topic
app.get('/tables/:table', shared.table);
app.get('/tables/:table/fields', shared.fields);  //=> List of fields in a table
app.get('/tables/:table/geographies', shared.geographies);  //=> List geographies for a tables


app.get('/:category/list',          shared.list);
app.get('/:category/list/verbose',  shared.verbose);
app.get('/:category/:dataset/meta', shared.meta)

// there's a way to get this to
// /:category/:dataset with some conditionals
// but beware typechecking overuse
app.get('/spatial/overlap', spatial.overlap);
app.get('/spatial/:dataset', spatial.dataset);
app.get('/spatial/:dataset/intersect/:posted_geojson', spatial.intersect);
app.post('/spatial/:dataset/intersect', spatial.intersect);

app.get('/tabular/:dataset',         tabular.dataset);
app.get('/tabular/:dataset/:fields', tabular.dataset);
// app.get('/tabular/:dataset/:field/:keys/:percent', tabular.sum)

app.get('/geographic/spatial/:s_dataset/tabular/:t_dataset/:fields', geographic.dataset);
app.post('/geographic/spatial/:s_dataset/tabular/:t_dataset/:fields/intersect', geographic.intersect);
app.post('/geographic/spatial/:s_dataset/tabular/:t_dataset/intersect', geographic.intersect);

app.post('/report', report.get_category)

app.get('/report/field',  report.get_field)
app.post('/report/field', report.get_field)


// TODO: Ripe for refactoring:
// boundaries are just a subset of spatial
// app.get('/boundaries/:dataset',      boundaries.dataset);
// app.get('/boundaries/:dataset/meta', boundaries.meta);
// app.get('/boundaries/:dataset/intersect/:posted_geojson', boundaries.intersect);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
