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

//todo later replace with real canvas dims
var CANVAS_WIDTH = 480 * 3;
var CANVAS_HEIGHT = 320 * 3;

Game = require("./public/javascripts/game.js");

game = new Game.Game(CANVAS_WIDTH, CANVAS_HEIGHT);

var io = require('socket.io').listen(server);
io.set('log level', 1);

io.sockets.on('connection', function(socket) {

	socket.on('ready', function() {
		game.addPlayer(socket.id);
	});

	socket.on('getGame', function() {
		game.update();
		socket.volatile.emit('game', game.export());
	});

	socket.on('shoot', function() {
		game.playerShoots(socket.id);
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit("left", {
			id : socket.id
		})
		game.removePlayer(socket.id);
	})

	socket.on('playerpos', function(pos) {
		game.updatePlayerPos(socket.id, pos);
	});

	socket.on('msg', function(data) {
		socket.broadcast.emit('lol', {
			id : socket.id,
			pos : data
		});
	});

});
