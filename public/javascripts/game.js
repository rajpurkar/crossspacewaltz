if (typeof exports === "undefined"){
	window.GameObj = {};
	window.exports = window.GameObj;
}

function Rectangle(left, top, width, height){
	this.left = left || 0;
	this.top = top || 0;
	this.width = width || 0;
	this.height = height || 0;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
}

Rectangle.prototype.set = function(left, top, /*optional*/width, /*optional*/height){
	this.left = left;
	this.top = top;
	this.width = width || this.width;
	this.height = height || this.height
	this.right = (this.left + this.width);
	this.bottom = (this.top + this.height);
}

Rectangle.prototype.within = function(r) {
	return (r.left <= this.left && 
		r.right >= this.right &&
		r.top <= this.top && 
		r.bottom >= this.bottom);
}		

Rectangle.prototype.overlaps = function(r) {
	return (this.left < r.right && 
		r.left < this.right && 
		this.top < r.bottom &&
		r.top < this.bottom);
}

function Bullet(x, y, speed) {
	this.x = x;
	this.y = y;
	this.speed = speed;

	this.active = true;
	this.xVelocity = 0;
	this.yVelocity = -this.speed;
	this.width = 3;
	this.height = 3;
	this.color = "#000";
}


Bullet.prototype.inBounds = function(worldWidth, worldHeight) {
		return this.x >= 0 && this.x <= worldWidth && this.y >= 0 && this.y <= worldHeight;
};

Bullet.prototype.update = function(worldWidth, worldHeight) {
		this.x += this.xVelocity;
		this.y += this.yVelocity;
		this.active = this.active && this.inBounds(worldWidth, worldHeight);
};

Bullet.prototype.explode = function() {
	this.active = false;
};

function Enemy(x, y) {

	this.active = true;
	this.age = Math.floor(Math.random() * 128);

	this.x = x;
	this.y = y;

	this.color = "#A2B";

	this.xVelocity = 0
	this.yVelocity = 2;

	this.width = 32;
	this.height = 32;
}

Enemy.prototype.inBounds = function(worldWidth, worldHeight) {
		return this.x >= 0 && this.x <= worldWidth && this.y >= 0 && this.y <= worldHeight;
};

Enemy.prototype.update = function(worldWidth, worldHeight) {
		this.x += this.xVelocity;
		this.y += this.yVelocity;

		this.xVelocity = 3 * Math.sin(this.age * Math.PI / 64);

		this.age++;

		this.active = this.active && this.inBounds(worldWidth, worldHeight);
};

Enemy.prototype.explode = function() {
		this.active = false;
};

// Camera constructor
function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight)
{
	// position of camera (left-top coordinate)
	this.xView = xView || 0;
	this.yView = yView || 0;

	// distance from followed object to border before camera starts move
	this.xDeadZone = 0; // min distance to horizontal borders
	this.yDeadZone = 0; // min distance to vertical borders

	// viewport dimensions
	this.wView = canvasWidth;
	this.hView = canvasHeight;			

	// allow camera to move in vertical and horizontal axis
	this.axis = "both";	

	// object that should be followed
	this.followed = null;

	// rectangle that represents the viewport
	this.viewportRect = new Rectangle(this.xView, this.yView, this.wView, this.hView);				

	// rectangle that represents the world's boundary (room's boundary)
	this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight);
}

// gameObject needs to have "x" and "y" properties (as world(or room) position)
Camera.prototype.follow = function(gameObject, xDeadZone, yDeadZone)
{		
	this.followed = gameObject;	
	this.xDeadZone = xDeadZone;
	this.yDeadZone = yDeadZone;
}					

Camera.prototype.update = function()
{
	// keep following the player (or other desired object)
	if(this.followed != null)
	{		
		if(this.axis == "horizontal" || this.axis == "both") {		
			// moves camera on horizontal axis based on followed object position
			if (this.followed.x - this.xView  + this.xDeadZone > this.wView){
				this.xView = this.followed.x - (this.wView - this.xDeadZone);
				console.log({xview: this.xView, x : this.followed.x});
			} else if(this.followed.x  - this.xDeadZone < this.xView){
				this.xView = this.followed.x  - this.xDeadZone;
			}
		}
		
		if (this.axis == "vertical" || this.axis == "both") {
			// moves camera on vertical axis based on followed object position
			if(this.followed.y - this.yView + this.yDeadZone > this.hView)
				this.yView = this.followed.y - (this.hView - this.yDeadZone);
			else if(this.followed.y - this.yDeadZone < this.yView)
				this.yView = this.followed.y - this.yDeadZone;
			}						
		}		

		// update viewportRect
		this.viewportRect.set(this.xView, this.yView);

		// don't let camera leaves the world's boundary
		if (!this.viewportRect.within(this.worldRect)) {
			if(this.viewportRect.left < this.worldRect.left)
				this.xView = this.worldRect.left;
			if(this.viewportRect.top < this.worldRect.top)					
				this.yView = this.worldRect.top;
			if(this.viewportRect.right > this.worldRect.right)
				this.xView = this.worldRect.right - this.wView;
			if(this.viewportRect.bottom > this.worldRect.bottom)					
				this.yView = this.worldRect.bottom - this.hView;
		}
}

function Player(x, y){
	this.x = x || 50;
	this.y = y || 270;

	this.width = 20;
	this.height = 30;

	this.color = "#00A";
	this.active = true;
}

Player.prototype.update = function(worldWidth, worldHeight){
	if(this.x - this.width / 2 < 0){
		this.x = this.width / 2;
	}
	if(this.y - this.height / 2 < 0){
		this.y = this.height / 2;
	}
	if(this.x + this.width / 2 > worldWidth){
		this.x = worldWidth - this.width / 2;
	}
	if(this.y + this.height / 2 > worldHeight){
		this.y = worldHeight - this.height / 2;
	}
}

Player.prototype.shoot = function() {
	var bulletPosition = this.midpoint();
	return new Bullet(bulletPosition.x, bulletPosition.y, 5);
};

Player.prototype.midpoint = function() {
	return {
		x : this.x + this.width / 2,
		y : this.y + this.height / 2
	};
};

Player.prototype.explode = function() {
	this.active = false;
};

function Game(worldWidth, worldHeight){
	this.players = {};
	this.enemies = [];
	this.bullets = [];
	this.worldWidth = worldWidth;
	this.worldHeight = worldHeight;
};

Game.prototype.update = function(){
	var worldWidth = this.worldWidth;
	var worldHeight = this.worldHeight;
	for (key in this.players) {
		var player = this.players[key];
		player.update(worldWidth, worldHeight);
	}

	this.bullets.forEach(function(bullet) {
		bullet.update(worldWidth, worldHeight);
	});

	this.bullets = this.bullets.filter(function(bullet) {
		return bullet.active;
	});

	this.enemies.forEach(function(enemy) {
		enemy.update(worldWidth, worldHeight);
	});

	this.enemies = this.enemies.filter(function(enemy) {
		return enemy.active;
	});

	this.handleCollisions();

	if (this.enemies.length < 10) {
		this.enemies.push(new Enemy(worldWidth / 4 + Math.random() * worldWidth / 2, 0));
	}
}

Game.prototype.handleCollisions = function() {
	var outerthis = this;
	this.bullets.forEach(function(bullet) {
		outerthis.enemies.forEach(function(enemy) {
			if (collides(bullet, enemy)) {
				enemy.explode();
				bullet.active = false;
			}
		});
	});

	this.enemies.forEach(function(enemy) {
		for (key in outerthis.players) {
			var player = outerthis.players[key];
			if (collides(enemy, player)) {
				enemy.explode();
				player.explode();
			}
		}
	});
}

Game.prototype.export = function(){
	return {
		'players' : this.players,
		'bullets' : this.bullets,
		'enemies' : this.enemies,
		'worldWidth' : this.worldWidth,
		'worldHeight' : this.worldHeight
	}
}

Game.prototype.addPlayer = function(id){
	this.players[id] = new Player();
}

Game.prototype.removePlayer = function(id){
	delete this.players[id];
}

Game.prototype.playerShoots = function(id){
	this.bullets.push(this.players[id].shoot());
}

Game.prototype.updatePlayerPos = function(id, pos){
	var player = this.players[id];

	if(player == null) return;

	player.x = pos.x;
	player.y = pos.y;

}

function collides(a, b) {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

var GameController = function(game){

	return function(socket){
		socket.on('ready', function() {
			game.addPlayer(socket.id);
		});

		socket.on('getGame', function() {
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
	}

};

exports.Enemy = Enemy;
exports.Rectangle = Rectangle;	
exports.Bullet = Bullet;	
exports.Camera = Camera;
exports.Player = Player;
exports.Game = Game;
exports.GameController = GameController;