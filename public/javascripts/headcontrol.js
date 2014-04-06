var videoInput = document.getElementById('headtrackrVideo');
var canvasInput = document.getElementById('headtrackrCanvas');

/*var headcontrol = makeHeadcontrol(videoInput, canvasInput);
headcontrol.start();
*/
function makeHeadcontrol(videoInput, canvasInput){

  var headcontrol = {};

  headcontrol.start = function() {
    htracker.start();
  };

  headcontrol.getX = function(){
    return positionControl.getX();
  }

  headcontrol.getY = function(){
    return positionControl.getY();
  }

  headcontrol.getTheta = function(){
  	return positionControl.getTheta();
  }

  headcontrol.setVelocity = function(velocity_x, velocity_y){
    positionControl.velocity.x = velocity_x;
    positionControl.velocity.y = velocity_y;
  }

  headcontrol.getVelocity = function(){
    return positionControl.velocity;
  }

  // position changed event listeners.
  headcontrol.addEventListener = function(eventType, listener){
    listeners.push({eventType: eventType, func: listener});
  };

  var listeners = [];
  var invokeListeners = function(eventType){
    listeners.forEach(function(listener){
      if (listener.eventType === eventType){
        listener.func && listener.func(headcontrol.getX(), headcontrol.getY(), headcontrol.getTheta());
      }
    });
  }

  // canvas context containing video of user
  var headtrackrCtx = canvasInput.getContext('2d');
  headtrackrCtx.strokeStyle = "lightgreen";
  headtrackrCtx.lineWidth = 2;

  // library head movement tracker.
  var htracker = new headtrackr.Tracker({ui : false, calcAngles : true});
  htracker.init(videoInput, canvasInput);

  // position controller that interprets head movements.
  var positionControl = makePositionController(canvasInput.width, canvasInput.height);

  // function called when head position updates.
  var headUpdater = (function(){
    var updateHeadPos = makeHeadPosDrawer(canvasInput.width, canvasInput.height, headtrackrCtx);

    return function (event){
      window.requestAnimFrame(function(){
        headtrackrCtx.clearRect(0, 0, canvasInput.width, canvasInput.height);
        positionControl.faceMoved(event.x, event.y, event.angle);
        updateHeadPos(event.x, event.y);
        invokeListeners("pos");
      });
    };

  })();

  document.addEventListener("facetrackingEvent", function (event) {
      headUpdater(event);
  });
  /*document.addEventListener('headtrackrStatus', function (event) {
  });
  document.addEventListener('headtrackrEvent', function (event){
  });*/

  return headcontrol;

};

lastx = 0;
lasty = 0;
transy = 100;
transyx = 100;
Number.prototype.mod = function(n) {
return ((this%n)+n)%n;
}

function makePositionController(width, height){
  var accumulatedX = 0;
  var accumulatedY = 0;
  var lastTheta = 0;
  var angle = 1.6;

  control = {};
  control.velocity = {x : 1, y : 1};

  control.getX = function(startX){
    if (startX === undefined){
      startX = 0;
    }
    return startX + accumulatedX;
  }

  control.getY = function(startY){
    if (startY === undefined){
      startY = 0;
    }
    return startY + accumulatedY;
  }

  control.getTheta = function(){
  	return lastTheta;
  }

  control.faceMoved = function(x, y, theta){
    // x <- [-1, 1]
    // y <- [-1, 1]
    lastTheta = theta;
   transx = -((x / width) - 0.5);
   //console.log(transx);
    angle = (angle + (0.3*transx)).mod(2*Math.PI);
    /*console.log(angle*180/Math.PI);
    transy =  transx + 40*Math.cos(Math.abs(angle));
  	transx -= 40*Math.sin(angle);*/

    accumulatedY += 1 * Math.cos(Math.abs(angle));//transx;
    accumulatedX += 1 * Math.sin(-angle);//transy;
}

  return control;
};

function makeHeadPosDrawer(width, height, ctx){

  return function(x, y) {

    // normalise values
    x = (x / 320) * width
    y = (y / 240) * height;

    // flip horizontally
    x = width - x;

    // draw marker, from x,y position
    ctx.beginPath();
    ctx.moveTo(x-5,y);
    ctx.lineTo(x+5,y);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x,y-5);
    ctx.lineTo(x,y+5);
    ctx.closePath();
    ctx.stroke();
  };
};

function makeLineUpdater(ctx){
  var prevXs = [];
  var prevYs = [];

  return function(x, y){
    ctx.beginPath();
    for (i = 0; i < prevXs.length - 1; i++){
      ctx.moveTo(prevXs[i], prevYs[i]);
      ctx.lineTo(prevXs[i + 1], prevYs[i + 1]);
    }
    ctx.stroke();
    ctx.closePath();
    prevXs.push(x);
    prevYs.push(y);
  };
};