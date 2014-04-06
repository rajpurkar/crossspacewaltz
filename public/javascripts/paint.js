
function Painter(color){
	this.x = 0;
	this.y = 0;
	this.theta = 0;
	this.exposes = [];
	this.color = color || "green";
	this.radius = 70;
	this.active = true;
}

Painter.prototype.update = function(x, y, theta){
	if (!this.active)
		return;

	this.x = x;
	this.y = y;
	this.theta = theta;

	thick = 6 - 2 * theta;
	thick = thick < 1 ? 1 : thick;
	this.exposes.push({x : x, y : y, thick : thick});
}

Painter.prototype.draw = function(context, xView, yView){
	if (this.active){
		context.beginPath();

		context.arc(this.x - xView, this.y - yView, this.radius, 0, 2 * Math.PI, false);
		context.fillStyle = this.color;
		context.fill();
		context.lineWidth = 5;
		context.strokeStyle = '#003300';

		context.stroke();
	}
	
	context.beginPath();
	
	context.fillStyle = 'blue';
	context.strokeStyle = '#003300';

	this.exposes.forEach(function(data) {
		context.lineWidth = 3;
		context.lineTo(data.x - xView, data.y - yView);
	});

	context.stroke();
}