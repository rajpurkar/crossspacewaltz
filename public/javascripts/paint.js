
Painter = function(){


function drawCircle(context, x, y, radius, lineWidth, colorStyle){
	context.beginPath();

	context.arc(x, y, radius, 0, 2 * Math.PI, false);
	context.fillStyle = colorStyle;
	context.fill();
	context.lineWidth = lineWidth;
	context.strokeStyle = '#003300';

	context.stroke();
}

function Painter(color){
	this.x = 0;
	this.y = 0;
	this.theta = 0;
	this.exposes = [];
	this.color = color || "green";
	this.radius = 70;
	this.active = true;
	this.lastmove = {x : 0, y : 0};
}

Painter.prototype.update = function(x, y, theta, relevant){
	if (!this.active)
		return;

	relevant = relevant || [0];

	this.x = x;
	this.y = y;
	this.theta = theta;

	thick = 6 - 2 * theta;
	thick = thick < 1 ? 1 : thick;
	old = this.lastmove;
	if (Math.sqrt((x - old.x) * (x - old.x) + (y - old.y) * (y - old.y)) > 40){
			this.lastmove = {x : x, y : y};
			this.exposes.push({x : x, y : y, r : relevant[0], thick : thick});
	}
}

Painter.prototype.draw = function(context, xView, yView, relevant){
	relevant = relevant || [0];
	
	if (this.active){
		//drawCircle(context, this.x - xView, this.y - yView, this.radius, 5, this.color);
		for (var i = 0; i < relevant.length; ++i) {
			var magnitude = relevant[i];
			var radius = 5;
			drawCircle(context, this.x - xView, this.y - yView, radius + magnitude / 20, 5, '#ff2525');

			if (magnitude > 5) {
				drawCircle(context, this.x - xView, this.y - yView, radius, magnitude / 7 + 3, "#ff2525");
			}
		}
	}

	this.exposes.forEach(function(data) {
		drawCircle(context, data.x - xView, data.y - yView, 0.1 + data.r / 8 + relevant[0] / 6, 2,
					'rgba(200,100,255,'+(2+1)/10+')');
		data.r += (Math.random() - 0.5);
		data.x += (Math.random() - 0.5);
		data.y += (Math.random() - 0.5);
		if(data.r < 0) data.r = 1;
	});

}

return Painter;
}();