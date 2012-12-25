/*
* Android
*/
/*
var agent = navigator.userAgent;
if (location.href.indexOf('android') == -1 && agent.indexOf('Android') != -1){
    location.href = ver_android;
}
*/
/*
* Main Routine
*/

$(document).ready(
	function(){
	main.init("canvas");
	main.setStage(new Stage());
	main.start();
	}
);

var main = {
	wireframe: false,
    id: null,
    context: null,
    canvas: null,
    timer: null,
	stage: null,
    stageWidth: 0,
    stageHeight: 0,
    mouseX: 0,
    mouseY: 0,
    timerDelay:33,
    bAdjustSize: true,
	
    init: function(id, w, h){
		this.id = id;
        this.canvas = document.getElementById( this.id );
        if( !this.canvas ||  !this.canvas.getContext) return;
        this.context = this.canvas.getContext("2d");
		this.updateScreenSize();
		
		// Interaction Events
		var interactionEvents = ["touchstart", "touchmove", "touchend", "gesturestart", "gesturechange", "gestureend",
		"mousemove", "mousedown", "mouseup"];
		for (var i =0; i <interactionEvents.length; i ++) {
			document.addEventListener(interactionEvents[i], this.interactionHandler, false);
		 }
		//Window Events
		var windowEvents = ["resize", "load", "keydown", "keyup"];
		for (var i =0; i < windowEvents.length; i ++) {
			window.addEventListener(windowEvents[i], this.windowHandler, false);
		 }
    },
    start: function(){
        this.enterFrame();
        this.internal = setInterval( this.bind( this, this.enterFrame ), this.timerDelay );
    },
    stop: function(){
        clearInterval( this.internal );
    },
    enterFrame: function(){
		if (this.stage) {
			this.stage.enterFrame();
		}
    },
	setStage: function(stage) {
		this.stage = stage;
	},
	updateScreenSize: function() {
		main.canvas.width =  main.canvas.height = 1;
		console.log("screen size : w" + $(window).width() + " - h" + $(window).height());
		main.canvas.width = $(window).width();
		main.canvas.height = $(window).height();
		var rect = main.canvas.getBoundingClientRect();
		this.stageWidth = rect.width;
		this.stageHeight = rect.height;
	},
	interactionHandler: function(event) {
  		switch(event.type) {
  			case "touchmove":
			case "touchstart":
  				var rect = main.canvas.getBoundingClientRect();
  				main.mouseX = event.touches[0].clientX - rect.left;
            	main.mouseY = event.touches[0].clientY - rect.top;
            	if (main.mouseX < 70 && main.mouseY < 70) {
            		location.href = "../index.html";
            	}
            break;
  			case "mousemove":
  				var rect = main.canvas.getBoundingClientRect();
  				main.mouseX = event.clientX - rect.left;
            	main.mouseY = event.clientY - rect.top;
            break;
			default:
			break;
  		}
		main.stage.interactionHandler(event);
  		event.preventDefault();
	},
	windowHandler: function(event) {
  		switch(event.type) {
  			case "resize":
  			case "load":
  			
				if(!main.bAdjustSize) { return };
			  main.updateScreenSize();
            break;
			case "keyup":
				console.log("keyup: " + event.keyCode);
				if (event.keyCode == 90) { main.wireframe = !main.wireframe; }
			break;
  		}
  		event.preventDefault();
	},
	bind: function(){
        var args=[];
        if(arguments){
            for(var i=0,n=arguments.length;i<n;i++){
                args.push(arguments[i]);
            }
        }
        var object=args.shift();
        var func=args.shift();
        return function(event) {
            return func.apply(object,[event||window.event].concat(args));
        }
    }
};

/*
*
*	Geometory
*
*/

var geom = {};

/**** Point ****/
geom.Point = function(_x, _y) {
	this.type = 'point';
	this.x =_x;
	this.y =_y;
}
geom.Point.prototype = {
	draw: function() {
		graphics.drawCircle("#0000ff", this.x, this.y, 2);
	}
}

/**** Line Segment ****/
geom.LineSegment = function(_x1, _y1, _x2, _y2) {
	this.type = 'line segment';
	this.x1 = _x1;
	this.y1 = _y1;
	this.x2 = _x2;
	this.y2 = _y2;
}
geom.LineSegment.prototype = {
	draw: function() {
		graphics.drawLine("#990000", this.x1, this.y1, this.x2, this.y2);
	}
}

/**** Circle ****/
geom.Circle = function(_x, _y, _radius) {
	this.type = 'circle';
	this.x =_x;
	this.y =_y;
	this.radius = _radius;
}
geom.Circle.prototype = {
	hitTest: function(tx, ty) {
		var distSquare = (this.x - tx) * (this.x - tx) + (this.y - ty) *(this.y - ty);
		return distSquare <= this.radius * this.radius;
	},
	draw: function() {
		graphics.drawCircle("#0000ff", this.x, this.y, this.radius);
	}
}

/**** Rectangle ****/
geom.Rectangle = function(_x1, _y1, _x2, _y2) {
	this.type = 'rectangle';
	this.x1 =_x1;
	this.y1 =_y1;
	this.x2 = _x2;
	this.y2 = _y2;
	this.width = this.x2 - this.x1;
	this.height = this.y2 - this.y1
}
geom.Rectangle.prototype = {
	hitTest:function(tx, ty) {
		return this.x1 <= tx && tx <= this.x2 && this.y1 <= ty && ty <= this.y2;
	},
	getWidth: function() {
		return this.x2 - this.x1;
	}, 
	getHeight: function() {
		return this.y2 - this.y1;
	},
	draw: function() {
		main.context.save();
		main.context.strokeStyle ="#0000ff";
		main.context.strokeRect(this.x1, this.y1, this.getWidth(),  this.getHeight());
		main.context.restore();
	}
}

/*
*
*	Graphics
*
*/

var graphics ={
	clear: function() {
		main.context.clearRect( 0, 0, main.stageWidth, main.stageHeight );
	},
	drawGrid: function() {
		graphics.drawLine("#ff9999", 0, 0, main.stageWidth, main.stageHeight);
		graphics.drawLine("#ff9999", main.stageWidth, 0, 0, main.stageHeight);
		
		for (var i = 0; i < main.stageWidth; i +=100) {
			graphics.drawLine("#9999ff", i, 0, i, main.stageHeight);
		}
		for (var i = 0; i < main.stageHeight; i +=100) {
			graphics.drawLine("#9999ff", 0,i, main.stageWidth, i);
		}
	},
	drawLine :function(color, x1, y1, x2, y2, alpha) {
		if (!alpha) { alpha = 1 }
		main.context.save();
		main.context.globalAlpha = alpha;
		main.context.strokeStyle = color;
		main.context.beginPath();
		main.context.moveTo(x1, y1);
		main.context.lineTo(x2, y2);
		main.context.stroke();
		main.context.restore();
	},
	drawCircle: function(color, x, y, radius, alpha) {
		if (!alpha) { alpha = 1 }
		main.context.save();
		main.context.globalAlpha = alpha;
		main.context.strokeStyle = color;
		main.context.beginPath();
		main.context.arc(x, y, radius, Math.PI * 2, false);
		main.context.stroke();
		main.context.restore();
	},
	fillCircle: function(color, x, y, radius, alpha) {
		if (!alpha) { alpha = 1 }
		main.context.save();
		main.context.globalAlpha = alpha;
		main.context.fillStyle = color;
		main.context.beginPath();
		main.context.arc(x, y, radius, Math.PI * 2, false);
		main.context.fill();
		main.context.restore();
	}
}

/**** Graphics Manager ****/
graphics.graphicsManager = function() {
	this.sprites = [];
	this.dragObj = [];
}

graphics.graphicsManager.prototype = {
	drawWireFrame: function() {
		for (var i = 0; i < this.sprites.length; i ++) {
			this.sprites[i].drawBoundary();
		}
	},
	addSprite: function(s) {
		this.sprites.push(s);
	},
	update: function() {
		for (var i = 0; i < this.sprites.length; i ++) {
			this.sprites[i].update();
		}
		for (var j = 0; j < this.dragObj.length; j ++) {
			this.dragObj[j].target.x = this.dragObj[j].x + main.mouseX;
			this.dragObj[j].target.y = this.dragObj[j].y + main.mouseY;
		}
	},
	draw: function() {
		for (var i = 0; i < this.sprites.length; i ++) {
			this.sprites[i].draw();
		}
	},
	addDragTarget: function(obj) {
		this.dragObj.push({target: obj, x: obj.x - main.mouseX, y: obj.y - main.mouseY});
	},
	clearDragTarget: function() {
		this.dragObj = [];
	}
}

/**** Sprite ****/
graphics.Sprite = function(_x, _y, _boundaries) {
	this.parant = null;
	this.bindTarget = null;
	this.image = null;
	this.imageReady = false;
	this.x = _x;
	this.y = _y;
	this.rotation = 0;
	this.boundaries = _boundaries;
	this.visible = true;
}

graphics.Sprite.prototype = {
	bind: function(_target) {
		this.bindTarget = _target;
	},
	loadImage: function(src) {
		this.image = new Image();
		this.image.sprite = this;
		this.image.src = src;
		this.image.onload = this.onImageLoad;
	},
	onImageLoad: function() {
		this.sprite.imageReady = true;
	},
	hitTest: function(_x, _y) {
		var tx0 = _x - this.x;
		var ty0 = _y - this.y;
		var tx = tx0 * Math.cos(- this.rotation) - ty0 * Math.sin(- this.rotation);
		var ty = tx0 * Math.sin(- this.rotation) + ty0 * Math.cos(- this.rotation);
		for (var i = 0; i < this.boundaries.length; i ++) {
			if (this.boundaries[i].hitTest(tx, ty)) {
				return true;
			}
		}
		return false;
	},
	drawBoundary: function() {
		main.context.save();
		main.context.translate(this.x, this.y);
		main.context.rotate(this.rotation);
		
		graphics.drawCircle("#00ffff", 0, 0, 5);
		if (this.boundaries && this.boundaries.length > 0) {
			for (var i = 0; i < this.boundaries.length; i ++) {
				this.boundaries[i].draw();
			}
		} else {
			graphics.drawCircle("#ff00ff", 0, 0, 1);
		}
		main.context.restore();
	},
	toGlobalPos: function(_x, _y) {
		var dx = _x * Math.cos(this.rotation) - _y * Math.sin(this.rotation);
		var dy = _x * Math.sin(this.rotation) + _y * Math.cos(this.rotation);
		if (this.parent) {
			var p = this.parent.toGlobalPos(0,0);
			var tx = this.x * Math.cos(p.rotation) - this.y * Math.sin(p.rotation);
			var ty = this.x * Math.sin(p.rotation) + this.y * Math.cos(p.rotation);
			return {x: tx + p.x + dx, y: ty +p.y + dy, rotation: this.rotation +p.rotation};
		} else {
			return {x: this.x + dx, y: this.y + dy, rotation: this.rotation};
		}
	},
	update: function(){
		if (!this.bindTarget) { return }
		switch (this.bindTarget.type) {
			case "stick":
			case "viewNode":
				this.x = (this.bindTarget.p1.x + this.bindTarget.p2.x) / 2;
				this.y = (this.bindTarget.p1.y + this.bindTarget.p2.y) / 2;
				this.rotation = Math.atan2(this.bindTarget.p1.y - this.bindTarget.p2.y, this.bindTarget.p1.x - this.bindTarget.p2.x) +Math.PI / 2;
			break;
			case "point":
				this.x = this.bindTarget.x;
				this.y = this.bindTarget.y;
			break;
		}
	},
	toLocalPos: function(_x, _y) {
		if (this.parent) {
			var p = this.parent.toLocalPos(_x, _y);
			var tx0 = p.x - this.x;
			var ty0 = p.y - this.y;
			var tx = tx0 * Math.cos(- this.rotation) - ty0 * Math.sin(- this.rotation);
			var ty = tx0 * Math.sin(- this.rotation) + ty0 * Math.cos(- this.rotation);
			return {x: tx, y: ty}
		} else {
			var tx0 = _x - this.x;
			var ty0 = _y - this.y;
			var tx = tx0 * Math.cos(- this.rotation) - ty0 * Math.sin(- this.rotation);
			var ty = tx0 * Math.sin(- this.rotation) + ty0 * Math.cos(- this.rotation);
			return {x: tx, y: ty}
		}
	},
	draw: function() {
		if (!this.imageReady || !this.visible) return;
		main.context.save();
		main.context.translate(this.x, this.y);
		main.context.rotate(this.rotation);
		main.context.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
		
		main.context.restore();
	}
}


/**** Sprite Group****/
graphics.SpriteGroup = function(_x, _y) {
	this.parant = null;
	this.sprites =[];
	this.x = _x;
	this.y = _y;
	this.rotation = 0;
	this.visible = true;
}
graphics.SpriteGroup.prototype = {
	hitTest: function(_x, _y) {
		var tx0 = _x - this.x;
		var ty0 = _y - this.y;
		var tx = tx0 * Math.cos(- this.rotation) - ty0 * Math.sin(- this.rotation);
		var ty = tx0 * Math.sin(- this.rotation) + ty0 * Math.cos(- this.rotation);
		for (var i = 0; i < this.sprites.length; i ++) {
			if (this.sprites[i].hitTest(tx, ty)) {
				return true;
			}
		}
		return false;
	},
	drawBoundary: function() {
		main.context.save();
		main.context.translate(this.x, this.y);
		main.context.rotate(this.rotation);
		graphics.drawCircle("#00ffff", 0, 0, 5);
		for (var i = 0; i < this.sprites.length; i ++) {
			if (this.sprites[i].drawBoundary()) {
				return true;
			}
		}
		main.context.restore();
	},
	addSprite: function(s) {
		this.sprites.push(s);
		s.parent = this;
	},
	toGlobalPos: function(_x, _y) {
		var dx = _x * Math.cos(this.rotation) - _y * Math.sin(this.rotation);
		var dy = _x * Math.sin(this.rotation) + _y * Math.cos(this.rotation);
		if (this.parent) {
			var p = this.parent.toGlobalPos(0,0);
			var tx = this.x * Math.cos(p.rotation) - this.y * Math.sin(p.rotation);
			var ty = this.x * Math.sin(p.rotation) + this.y * Math.cos(p.rotation);
			return {x: tx + p.x + dx, y: ty +p.y + dy, rotation: this.rotation +p.rotation};
		} else {
			return {x: this.x + dx, y: this.y + dy, rotation: this.rotation};
		}
	},
	toLocalPos: function(_x, _y) {
		if (this.parent) {
			var p = this.parent.toLocalPos(_x, _y);
			var tx0 = p.x - this.x;
			var ty0 = p.y - this.y;
			var tx = tx0 * Math.cos(- this.rotation) - ty0 * Math.sin(- this.rotation);
			var ty = tx0 * Math.sin(- this.rotation) + ty0 * Math.cos(- this.rotation);
			return {x: tx, y: ty}
		} else {
			var tx0 = _x - this.x;
			var ty0 = _y - this.y;
			var tx = tx0 * Math.cos(- this.rotation) - ty0 * Math.sin(- this.rotation);
			var ty = tx0 * Math.sin(- this.rotation) + ty0 * Math.cos(- this.rotation);
			return {x: tx, y: ty}
		}
	},
	draw: function() {
		
		if (!this.visible) return;
		main.context.save();
		main.context.translate(this.x, this.y);
		main.context.rotate(this.rotation);
		for (var i = 0; i < this.sprites.length; i ++) {
			if (this.sprites[i].draw()) {
				return true;
			}
		}
		main.context.restore();
	}
}


/**** Math Util ****/

var MathUtil = {
	getIntersection: function(x00, y00, x01, y01, x10, y10, x11, y11) {
		f0 = x01 - x00;
		f1 = x11 - x10;
		g0 = y01 - y00;
		g1 = y11 - y10;
		var det = f1 * g0 - f0 * g1;
		if (det == 0) {return null}
		
		var dx = x10 - x00
		var dy = y10 - y00
		var t0 = (f1 * dy - g1 * dx) / det;
		var t1 = (f0 * dy - g0 * dx) / det;
		
		var ix = x00 + f0 * t0;
		var iy = y00 + g0 * t0;
		return {x:ix, y:iy};
	},
	getIntersection2: function(x00, y00, x01, y01, x10, y10, x11, y11) {
		f0 = x01 - x00;
		f1 = x11 - x10;
		g0 = y01 - y00;
		g1 = y11 - y10;
		var det = f1 * g0 - f0 * g1;
		if (det == 0) {return null}
		
		var dx = x10 - x00
		var dy = y10 - y00
		var t0 = (f1 * dy - g1 * dx) / det;
		var t1 = (f0 * dy - g0 * dx) / det;
		if (t0 >= 0 && t0 <= 1 && t1 >= 0 && t1 <= 1) {
			var ix = x00 + f0 * t0;
			var iy = y00 + g0 * t0;
			return {x:ix, y:iy};
		} else {
			return null
		}
	},
	getDistance: function(x0, y0, x1, y1) {
		return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1)); 	
	} 
}


