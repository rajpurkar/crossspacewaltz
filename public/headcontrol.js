var videoInput = document.getElementById('headtrackrVideo');
          var canvasInput = document.getElementById('headtrackrCanvas');
          
          var headtrackrCtx = canvasInput.getContext('2d');
          headtrackrCtx.strokeStyle = "lightgreen";
          headtrackrCtx.lineWidth = 2;
          
          var htracker = new headtrackr.Tracker({ui : false});
          htracker.init(videoInput, canvasInput);
          htracker.start();     

          var drawIdent = function(canvasCtx, x, y) {

            // normalise values
            x = (x / 320) * canvasInput.width;
            y = (y / 240) * canvasInput.height;

            // flip horizontally
            x = canvasInput.width - x;

            // clean canvas
            canvasCtx.clearRect(0,0,canvasInput.width,canvasInput.height);

            // draw marker, from x,y position
            canvasCtx.beginPath();
            canvasCtx.moveTo(x-5,y);
            canvasCtx.lineTo(x+5,y);
            canvasCtx.closePath();
            canvasCtx.stroke();

            canvasCtx.beginPath();
            canvasCtx.moveTo(x,y-5);
            canvasCtx.lineTo(x,y+5);
            canvasCtx.closePath();
            canvasCtx.stroke();
          };

          var positionController = function(){
            var accumulatedX = 0;
            var accumulatedY = 0;
            var lastX, lastY, lastTheta;

            control = {};
            control.velocity = 1;
            
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

            control.faceMoved = function(x, y, width, height){
                var scalex = control.velocity / width;
                var scaley = control.velocity / height;
                x -= width / 2;
                y -= height / 2;

                accumulatedX += x * scalex;
                accumulatedY += y * scaley;
            }
          
            return control;

          }();

          var updateLine = function(initialX, initialY, canvasCtx){
            var prevX = initialX;
            var prevY = initialY;
            var ctx   = canvasCtx;

            return function(x, y){
              ctx.beginPath();
              ctx.moveTo(prevX, prevY);
              ctx.lineTo(x, y);
              ctx.stroke();
              ctx.closePath();
              prevX = x;
              prevY = y;
            }

          }(0, 0, document.getElementById('myCanvas').getContext('2d'));

          document.addEventListener("facetrackingEvent", function (event) {
            drawIdent(headtrackrCtx, event.x, event.y);
            positionController.faceMoved(event.x, event.y, canvasInput.width, canvasInput.height);
            updateLine(positionController.getX(), positionController.getY());
          });

          document.addEventListener('headtrackrStatus', function (event) {

          });

          document.addEventListener('headtrackrEvent', function (event){

          });