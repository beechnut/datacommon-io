
/**
 * Module dependencies.
 */

var express = require('express');

var routes     = require('./routes');
var lists      = require('./routes/lists');
var boundaries = require('./routes/boundaries');

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


app.get('/', routes.index);

app.get('/:category/list',         lists.list);
app.get('/:category/list/verbose', lists.verbose);

app.get('/boundaries/:dataset',     boundaries.dataset);
app.get('/boundaries/:dataset/meta', boundaries.meta);
app.get('/boundaries/:dataset/intersect/:posted_geojson', boundaries.intersect);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
