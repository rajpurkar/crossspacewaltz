Array.prototype.average = function() {
	var sum = 0;
	var j = 0;
	for (var i = 0; i < this.length; i++) {
		if (isFinite(this[i])) {
			sum = sum + parseFloat(this[i]);
			j++;
		}
	}
	if (j === 0) {
		return 0;
	} else {
		return sum / j;
	}

}
Painter = function() {

	function drawCircle(context, x, y, radius, lineWidth, colorStyle, fill) {

		context.beginPath();
		context.fillStyle = context.strokeStyle = colorStyle;
		context.arc(x, y, radius, 0, 2 * Math.PI, false);

		context.lineWidth = lineWidth;
		context.stroke();
		if (fill) {
			context.fill();
		}
	}

	function Painter(color) {
		this.x = 0;
		this.y = 0;
		this.theta = 0;
		this.exposes = [];
		this.c = color || '255,40,155';
		this.radius = 70;
		this.active = true;
		this.lastmove = {
			x : 0,
			y : 0
		};
	}


	Painter.prototype.update = function(x, y, theta, relevant) {
		if (!this.active)
			return;

		relevant = relevant || [0];

		this.x = x;
		this.y = y;
		this.theta = theta;

		thick = 6 - 2 * theta;
		thick = thick < 1 ? 1 : thick;
		old = this.lastmove;
		if (Math.sqrt((x - old.x) * (x - old.x) + (y - old.y) * (y - old.y)) > 40) {
			this.lastmove = {
				x : x,
				y : y
			};
			this.exposes.push({
				x : x,
				y : y,
				r : relevant[0],
				thick : thick
			});
		}
	}

	Painter.prototype.draw = function(context, xView, yView, relevant, time) {
		relevant = relevant || [0];

		var outerthis = this;

		this.exposes.forEach(function(data) {
			drawCircle(context, data.x - xView, data.y - yView, 0.1 + data.r + Math.pow(relevant.average(), 2) / 1000, 2, 'rgba(' + outerthis.c + ',0.9)', true);
			if(data.r < 30){
				data.r += (Math.random() - 0.5) * 4;
			}else{
				data.r += (Math.random()-1) * 2;
			}
			data.x += (Math.random() - 0.5);
			data.y += (Math.random() - 0.5);
			if (data.r < 0)
				data.r = 1;
		});
		if (this.active) {
			//drawCircle(context, this.x - xView, this.y - yView, this.radius, 5, this.color);
			for (var i = 0; i < relevant.length; ++i) {
				var xrand = Math.random();
				var yrand = Math.random();
				var magnitude = relevant[i];
				drawCircle(context, this.x + (xrand - 0.5) * 10 - xView, this.y - yView + (yrand - 0.5) * 10, 20 + relevant[i] * 0.5, 'rgba(' + outerthis.c + ',0.9)', false);
			}
		}

	}

	window.drawCircle = drawCircle;

	return Painter;
}();

Map = function() {
	function Map(width, height, src) {
		// map dimensions
		this.width = width;
		this.height = height;

		// map texture
		this.image = new Image();
		this.image.src = src;
		this.image.width = width;
		this.image.height = height;
	}

	// draw the map adjusted to camera
	Map.prototype.draw = function(context, xView, yView) {
		// easiest way: draw the entire map changing only the destination coordinate in canvas
		// canvas will cull the image by itself (no performance gaps -> in hardware accelerated environments, at least)
		//context.drawImage(this.image, 0, 0, this.image.width, this.image.height, -xView, -yView, this.image.width, this.image.height);

		// didactic way:

		var sx, sy, dx, dy;
		var sWidth, sHeight, dWidth, dHeight;

		// offset point to crop the image
		sx = xView;
		sy = yView;

		// dimensions of cropped image
		sWidth = context.canvas.width;
		sHeight = context.canvas.height;

		// if cropped image is smaller than canvas we need to change the source dimensions
		if (this.image.width - sx < sWidth) {
			sWidth = this.image.width - sx;
		}
		if (this.image.height - sy < sHeight) {
			sHeight = this.image.height - sy;
		}

		// location on canvas to draw the croped image
		dx = 0;
		dy = 0;
		// match destination with source to not scale the image
		dWidth = sWidth;
		dHeight = sHeight;

		context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
	}
	return Map
}();
