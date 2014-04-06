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

//back end

Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
};

//todo later replace with real canvas dims
var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;

var playerBullets = [];

function Bullet(I) {
	I.active = true;

	I.xVelocity = 0;
	I.yVelocity = -I.speed;
	I.width = 3;
	I.height = 3;
	I.color = "#000";

	I.inBounds = function() {
		//to fix
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};

	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;
		I.active = I.active && I.inBounds();
	};

	I.explode = function() {
		I.active = false;
		// Extra Credit: Add an explosion graphic
	};
	return I;
}

var players = {}

function Player(I) {
	I = I || {};

	I.color = "#00A";
	//todo initialize player position
	I.x = 50;
	I.y = 270;
	I.width = 20;
	I.height = 30;

	I.shoot = function() {
		var bulletPosition = I.midpoint();

		playerBullets.push(Bullet({
			speed : 5,
			x : bulletPosition.x,
			y : bulletPosition.y
		}));
	};

	I.midpoint = function() {
		return {
			x : I.x + I.width / 2,
			y : I.y + I.height / 2
		};
	};

	I.explode = function() {
		I.active = false;
		// Extra Credit: Add an explosion graphic and then end the game
	};
	return I;
}

enemies = [];

function Enemy(I) {
	I = I || {};

	I.active = true;
	I.age = Math.floor(Math.random() * 128);

	I.color = "#A2B";

	I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
	I.y = 0;
	I.xVelocity = 0
	I.yVelocity = 2;

	I.width = 32;
	I.height = 32;

	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};

	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

		I.age++;

		I.active = I.active && I.inBounds();
	};

	I.explode = function() {
		//Sound.play("explosion");
		//send explosion message
		I.active = false;
		// Extra Credit: Add an explosion graphic
	};

	return I;
};

function collides(a, b) {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function handleCollisions() {
	playerBullets.forEach(function(bullet) {
		enemies.forEach(function(enemy) {
			if (collides(bullet, enemy)) {
				enemy.explode();
				bullet.active = false;
			}
		});
	});

	enemies.forEach(function(enemy) {
		for (key in players) {
			var player = players[key];
			if (collides(enemy, player)) {
				enemy.explode();
				player.explode();
			}
		}
	});
}

function update2() {
	for (key in players) {
		var player = players[key];
		player.x = player.x.clamp(0, CANVAS_WIDTH - player.width);
	}

	playerBullets.forEach(function(bullet) {
		bullet.update();
	});

	playerBullets = playerBullets.filter(function(bullet) {
		return bullet.active;
	});

	enemies.forEach(function(enemy) {
		enemy.update();
	});

	enemies = enemies.filter(function(enemy) {
		return enemy.active;
	});

	handleCollisions();

	if (enemies.length <10 ) {
		enemies.push(Enemy());
	}
}

function getPositions() {
	a = {
		'players' : players,
		'bullets' : playerBullets,
		'enemies' : enemies
	}
	return a;
}

setInterval(update2, 100);

var io = require('socket.io').listen(server);
io.set('log level', 1);

io.sockets.on('connection', function(socket) {

	socket.on('ready', function() {
		players[socket.id] = Player();
	});

	socket.on('getPositions', function() {
		socket.volatile.emit('pos', getPositions());
	});

	socket.on('shoot', function() {
		var player = players[socket.id];
		player.shoot();
	});
	socket.on('disconnect', function() {
		socket.broadcast.emit("left", {
			id : socket.id
		})
		delete players[socket.id];
	})

	socket.on('playerpos', function(pos) {
		var player = players[socket.id];
		if(player == null) return;
		player.x = pos.x;
		player.y = pos.y;
	});

	socket.on('msg', function(data) {
		socket.broadcast.emit('lol', {
			id : socket.id,
			pos : data
		});
	});

});
