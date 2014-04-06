/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', function(req, res) {
	res.sendfile("public/main.html");
});

var server = http.createServer(app)

server.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {

	socket.emit('news', {
		hello : 'world'
	});

	socket.on('msg', function(data) {
		socket.broadcast.emit('lol', {
			id: socket.id,
			pos: data
		});
		console.log('Chat message by ', socket.id);
		console.log('Chat message by ', data.x, data.y);
	});

});