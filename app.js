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

/*Game = require("./public/javascripts/game.js");

var CANVAS_WIDTH = 480 * 3;
var CANVAS_HEIGHT = 320 * 3;

var game = new Game.Game(CANVAS_WIDTH, CANVAS_HEIGHT);
setInterval(game.update.bind(game), 100);

var controller = Game.GameController(game);

*/

var controller = function(socket){

	socket.on("pos", function(pos){
		socket.broadcast.emit("pos", {
			id : socket.id,
			pos : pos
		});
	});

	socket.on('disconnect', function() {
		socket.broadcast.emit("left", socket.id);
	});
}

var io = require('socket.io').listen(server);
io.set('log level', 1);

io.sockets.on('connection', controller);
