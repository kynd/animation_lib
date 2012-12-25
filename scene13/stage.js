/*****  Stage *****/

var Stage = function(){
    this.init();
};

Stage.prototype = {
    init: function(){
    	Client.check();
		console.log('init');
		/* system */
		this.system = new spider.System();
		this.system.addPoint(new spider.WebPoint(main.stageWidth / 2, 0, true));
		
		/* edge */
		this.edge = [
			{x0: 0, y0: 0, x1: main.stageWidth, y1: 0},
			{x0: main.stageWidth, y0: 0, x1: main.stageWidth, y1: main.stageHeight},
			{x0: 0, y0: main.stageHeight, x1: main.stageWidth, y1: main.stageHeight},
			{x0: 0, y0: 0, x1: 0, y1: main.stageHeight}
    	];
    	
    	/* variables */
    	this.intersectingPath;
    	this.intersectionCoord;
    	this.currentCoord = {};
    	this.bClick = false;
    	this.bDrag = false;
    	this.clickTarget = null;
    	this.stringLen = 0;
    	this.updateColor();
    	
    	// spider
    	this.spider = new graphics.Sprite(0,0);
    	this.spider.loadImage("images/spider.png");
    	this.spider.rotation = Math.PI;
    	
    	this.bg = new graphics.Sprite(main.stageWidth / 2, main.stageHeight / 2);
    	this.bg.loadImage("images/bg.jpg");
 	},
    enterFrame: function(){
		this.update();
		this.draw();
    },
	update: function() {
		this.system.update();
		this.updateString();
		
		if (this.bClick && !this.hitTestOne(this.clickTarget)) {
			this.bClick = false;	
		}
	}, 
	draw: function() {
		graphics.clear();
		main.context.fillStyle = "rgb(" + Math.floor(this.r) + "," + Math.floor(this.g) + "," + Math.floor(this.b) + ")";
		//main.context.fillRect(0, 0, main.stageWidth, main.stageHeight);
		this.drawBg();
		this.system.draw();
		this.drawNewString();
		if (this.bClick) {
			graphics.fillCircle("#0077ff", this.system.points[this.clickTarget].x,
			this.system.points[this.clickTarget].y, 20, 0.5);
		}
	},
	drawBg: function() {
		var ratio = Math.max(main.stageWidth / 1280, main.stageHeight  / 720);
		main.context.save();
		main.context.scale(ratio,ratio);
		this.bg.x = main.stageWidth / 2 / ratio;
		this.bg.y = main.stageHeight / 2 / ratio;
		this.bg.draw();
		main.context.restore();
	},
	updateColor: function() {
		this.tr = Math.random() * 255;
		this.tg = Math.min(this.tr / 2, Math.random() * 128);
		this.tb = Math.random() * 255;
	},
	drawNewString: function() {
		//graphics.drawCircle("#ffffff", this.currentCoord.x, this.currentCoord.y, 10);
		graphics.drawLine("#ffffff", this.system.lastPoint.x,
			this.system.lastPoint.y, this.currentCoord.x, this.currentCoord.y, 0.5);
		
		this.spider.draw();
	},
	updateString: function() {
		var dx = main.mouseX - this.system.lastPoint.x;
		var dy = main.mouseY - this.system.lastPoint.y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		
		
		if (this.bDrag && dist > 0) {
			var diff = dist + 150 - this.stringLen;
			if (diff > 150) {
				this.stringLen += 15;
			} else {
				this.stringLen += diff / 10;
			};
		} else {
			this.stringLen = Math.max(0, this.stringLen - 10);
		}
		
		
		var tx = this.system.lastPoint.x + dx / dist * this.stringLen;
		var ty = this.system.lastPoint.y + dy / dist * this.stringLen;
		if (tx < 0) tx = 0;
		if (tx > main.stageWidth) tx = main.stageWidth;
		if (ty < 0) ty = 0;
		if (ty > main.stageHeight) ty = main.stageHeight;
		
		
		this.currentCoord.x = tx;
		this.currentCoord.y = ty;
		
		/* check intersection */
		this.intersectingPath = null;
		this.intersectionCoord = null;
		var x0  = this.system.lastPoint.x;
		var y0 = this.system.lastPoint.y;
		var maxDist = 10000;
		
		// check intersection with the edges
		for (var i = 0; i < 4; i ++) {
			
			if (y0 < ty && i == 0) continue; 
			if (x0 > tx && i == 1) continue; 
			if (y0 > ty && i == 2) continue; 
			if (x0 < tx && i == 3) continue; 
			var intersection = MathUtil.getIntersection2(x0, y0, tx, ty, this.edge[i].x0, this.edge[i].y0, this.edge[i].x1, this.edge[i].y1);
			if (intersection) {
				var dist = MathUtil.getDistance(x0, y0, intersection.x, intersection.y);
				if (dist < maxDist) {
					maxDist = dist;
					this.intersectionCoord = intersection;
				}
				this.spider.rotation += Math.PI;
			}	
		}
		
		// check intersection with others strings
		for (var i = 0; i < this.system.strings.length; i ++) {
			if (this.system.strings[i].p0 == this.system.lastPoint ||
				this.system.strings[i].p1 == this.system.lastPoint) continue;
			var intersection = MathUtil.getIntersection2(x0, y0, 
				tx, ty, 
				this.system.strings[i].p0.x, this.system.strings[i].p0.y,
				this.system.strings[i].p1.x, this.system.strings[i].p1.y);
			if (intersection) {
				var dist = MathUtil.getDistance(x0, y0, intersection.x, intersection.y);
				if (dist < maxDist) {
					maxDist = dist;
					this.intersectionCoord = intersection;
					this.intersectingPath = this.system.strings[i];
				}
			}	
		}
		
		if (this.intersectionCoord) {
			this.stringLen = 0;
			this.addPoint();
		}
		
		//spider
		this.spider.x = this.currentCoord.x;
		this.spider.y = this.currentCoord.y;
		if (!this.stringLen == 0) {
			this.spider.rotation = Math.atan2(this.system.lastPoint.y - this.currentCoord.y,
			this.system.lastPoint.x - this.currentCoord.x) - Math.PI / 2;
		}
		
	},
	interactionHandler: function(event) {
		switch(event.type) {
			case "mousedown":
			case "touchstart":
				this.hitTest();
			break;
			case "mouseup":
			case "touchend":
				if (this.bClick) {
					this.removePoint();
				}
				this.bDrag = false;
				this.bClick = false;
				//this.addPoint();
			break;
		}
	},
	hitTest: function(i) {
		for (var i = 0; i < this.system.points.length - 1; i ++) {
			if (this.hitTestOne(i)) {
				this.bClick = true;
				this.clickTarget = i;
			}
		}
		if (!this.bClick) {
			this.bDrag =  true;
		}
	},
	hitTestOne: function(i) {
		var dx = this.system.points[i].x - main.mouseX;
		var dy = this.system.points[i].y - main.mouseY;
		return (dx * dx + dy * dy < 20 * 20);
	},
	addPoint: function() {
		console.log('add');
		if (!this.intersectionCoord) return;
		var newPoint = new spider.WebPoint(this.intersectionCoord.x, this.intersectionCoord.y, true);
		var lastPoint = this.system.lastPoint;
		var newString = new spider.WebString(this.system.lastPoint, newPoint);
		newPoint.addString(newString);
		lastPoint.addString(newString);
		this.system.addString(newString);
		this.system.addPoint(newPoint);
		
		if (this.intersectingPath) {
			newPoint.fixed = false;
			var p0 = this.intersectingPath.p0;
			var p1 = this.intersectingPath.p1;
			p0.removeString(this.intersectingPath);
			p1.removeString(this.intersectingPath);
			this.system.removeString(this.intersectingPath);
			var s0 = new spider.WebString(p0, newPoint);
			var s1 = new spider.WebString(p1, newPoint);
			p0.addString(s0);
			p1.addString(s1);
			newPoint.addString(s0);
			newPoint.addString(s1);
			this.system.addString(s0);
			this.system.addString(s1);
		}
		this.updateColor();
		this.bDrag = false;
	},
	removePoint: function() {
		console.log('remove');
		var pt = this.system.points[this.clickTarget];
		for (var i = 0; i < pt.strings.length; i ++) {
			console.log(pt.strings[i]);
			pt.strings[i].getAnotherEnd(pt).removeString(pt.strings[i]);
			this.system.removeString(pt.strings[i]);
		}
		this.system.removePoint(pt);
	}
};


var Client = {
	isPhone: false,
	check: function() {
		var agent = navigator.userAgent;
		this.isPhone = (agent.indexOf('Android') != -1 ||
		agent.indexOf('iPhone') != -1 ||
		agent.indexOf('iPod') != -1 ||
		agent.indexOf('iPod') != -1 ||
		agent.indexOf('iPad') != -1 ||
		location.href.indexOf('phone') != -1);
		if (location.href.indexOf('pc') != -1) {
			this.isPhone = false;
		}
		
    	if (!Client.isPhone) {
    		main.bAdjustSize = false;
    		main.canvas.width = 640;
    		main.canvas.height = 480;
			main.stageWidth = 640;
			main.stageHeight = 480;
    	}
	}
}

/*
*
* spider
*
*/


var spider = {};

/***** System *****/

spider.System = function() {
	this.strings = [];
	this.points = [];
	this.lastPoint;
}

spider.System.prototype = {
	addString: function(str) {
		this.strings.push(str);
		str.system = this;
	},
	addPoint: function(pt) {
		this.points.push(pt);
		this.lastPoint = pt;
		pt.system = this;
	},
	removeString: function(str) {
		var arr = [];
		for (var i = 0; i < this.strings.length; i ++) {
			if (this.strings[i] != str) {
				arr.push(this.strings[i]);
			}
		}
		this.strings = arr;
	},
	removePoint: function(pt) {
		var arr = [];
		for (var i = 0; i < this.points.length; i ++) {
			if (this.points[i] != pt) {
				arr.push(this.points[i]);
			}
		}
		this.points = arr;
	},
	update: function() {
		for (var i = 0; i < this.points.length; i ++) {
			this.points[i].update();
		}
	},
	draw: function() {
		for (var i = 0; i < this.strings.length; i ++) {
			this.strings[i].draw();
		}
		for (var i = 0; i < this.points.length; i ++) {
			this.points[i].draw();
		}
	}
}

/***** Point *****/

spider.WebPoint = function(_x, _y, _fixed) {
	this.fixed = (_fixed) ? true : false;
	this.strings = [];
	this.vx = 0;
	this.vy = 0;
	this.x = _x;
	this.y = _y;
	this.system = null;
}

spider.WebPoint.prototype = {
	addString: function(str) {
		this.strings.push(str);
	},
	removeString: function(str) {
		var arr = [];
		for (var i = 0; i < this.strings.length; i ++) {
			if (this.strings[i] != str) {
				arr.push(this.strings[i]);
			}
		}
		this.strings = arr;
	},
	update: function() {
		if (this.fixed || this.strings.length == 0) return;
		if (this.strings.length == 2 && this != this.system.points[this.system.points.length - 1]) {
			var dx0 = this.x - this.strings[0].getAnotherEnd(this).x;
			var dy0 = this.y - this.strings[0].getAnotherEnd(this).y;
			var dx1 = this.x - this.strings[1].getAnotherEnd(this).x;
			var dy1 = this.y - this.strings[1].getAnotherEnd(this).y;
			var dot = dx0 * dx1 + dy0 * dy1;
			//console.log(dot);
		}
		var xSum = 0;
		var ySum = 0;
		var sum = 0;
		for (var i = 0; i < this.strings.length; i ++) {
			var pt = this.strings[i].getAnotherEnd(this);
			var dist = this.strings[i].length;
			dist = 1 / dist;//Math.pow(dist, 0.5);
			dist = 1;
			xSum += pt.x * dist;
			ySum += pt.y * dist;
			sum += dist;
		}
		
		var tx = xSum / sum;//this.strings.length;
		var ty = ySum / sum;//this.strings.length;
		
		var dx = tx - this.x;
		var dy = ty - this.y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		var spd  = 0.8;
		if (dist == 0 ) return;
		if (dist < spd) spd = dist;
		this.vx = (this.vx + dx / dist * spd) * 0.80;
		this.vy = (this.vy + dy / dist * spd) * 0.80;
		this.x += this.vx;
		this.y += this.vy;
		
		
		if (this.strings.length <= 0) {
			this.system.removePoint(this);
		}
	},
	draw: function() {	
		graphics.fillCircle("#ff0000", this.x, this.y, 3);
	}
}

/***** String *****/

spider.WebString = function(_p0, _p1) {
	this.p0 = _p0;
	this.p1 = _p1;
	this.system = null;
	this.length;
	this.updateLength();
}

spider.WebString.prototype = {
	draw: function() {
		graphics.drawLine("#ffffff", this.p0.x, this.p0.y, this.p1.x, this.p1.y, 0.5);
	},
	updateLength: function() {
		var dx = this.p0.x - this.p1.x;
		var dy = this.p0.y - this.p1.y;
		this.length =  Math.sqrt(dx * dx + dy * dy);
	},
	getAnotherEnd: function(pt) {
		if (pt == this.p0) {
			return this.p1;
		} else if (pt == this.p1) {
			return this.p0;
		} else {
			return null;
		}
	}
}
