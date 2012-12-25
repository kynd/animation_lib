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
    	this.bDrag = false;
 	},
    enterFrame: function(){
		this.update();
		this.draw();
    },
	update: function() {
		this.system.update();
		this.chechInterSection();
	}, 
	draw: function() {
		graphics.clear();
		this.system.draw();
		if (this.bDrag) {
			this.drawVirtualPath();
		}
	},
	drawVirtualPath: function() {
		if (this.intersectionCoord) {
			//console.log(this.intersectionCoord.x + "-" + this.intersectionCoord.y);
			graphics.drawCircle("#ff99ff", this.intersectionCoord.x, this.intersectionCoord.y, 10);
			graphics.drawLine("#ff9999", this.system.lastPoint.x,
			this.system.lastPoint.y, this.intersectionCoord.x, this.intersectionCoord.y);
		}	
		
	},
	chechInterSection: function() {
		this.intersectingPath = null;
		this.intersectionCoord = null;
		var x0  = this.system.lastPoint.x;
		var y0 = this.system.lastPoint.y;
		var x1 = main.mouseX;
		var y1 = main.mouseY;
		var maxDist = 10000;
		
		// check intersection with the edges
		for (var i = 0; i < 4; i ++) {
			if (y0 < y1 && i == 0) continue; 
			if (x0 > x1 && i == 1) continue; 
			if (y0 > y1 && i == 2) continue; 
			if (x0 < x1 && i == 3) continue; 
			var intersection = MathUtil.getIntersection(x0, y0, x1, y1, this.edge[i].x0, this.edge[i].y0, this.edge[i].x1, this.edge[i].y1);
			if (intersection) {
				var dist = MathUtil.getDistance(x0, y0, intersection.x, intersection.y);
				if (dist < maxDist) {
					maxDist = dist;
					this.intersectionCoord = intersection;
				}	
			}	
		}
		
		if (!this.intersectionCoord) return;
		
		// check intersection with others strings
		for (var i = 0; i < this.system.strings.length; i ++) {
			/*
			console.log((x0 + " = " + y0 + " = " +  
				this.intersectionCoord.x + " = " +  this.intersectionCoord.y + " = " + 
				this.system.strings[i].p0.x + " = " +  this.system.strings[i].p0.y + " = " + 
				this.system.strings[i].p1.x + " = " +  this.system.strings[i].p1.y)
);
			*/
			if (this.system.strings[i].p0 == this.system.lastPoint ||
				this.system.strings[i].p1 == this.system.lastPoint) continue;
			var intersection = MathUtil.getIntersection2(x0, y0, 
				this.intersectionCoord.x, this.intersectionCoord.y, 
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
	},
	interactionHandler: function(event) {
		switch(event.type) {
			case "mousedown":
			case "touchstart":
				//this.hitTest();
				this.bDrag =  true;
			break;
			case "mouseup":
			case "touchend":
				this.bDrag = false;
				this.addPoint();
			break;
		}
	},
	addPoint: function() {
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
			/*
			console.log(newPoint);
			console.log(this.system.strings.length);
			
			console.log(s0.p0.x + " === " + s0.p1.x);
			console.log(s1.p0.x + " === " + s1.p1.x);
			for (var j = 0; j < this.system.strings.length; j ++) {
				
				console.log(this.system.strings[j]);
			}
			*/
		}
		
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
	},
	addPoint: function(pt) {
		this.points.push(pt);
		this.lastPoint = pt;
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
		for (var i = 0; i < this.points.length; i ++) {
			this.points[i].update();
		}
	},
	draw: function() {
		for (var i = 0; i < this.points.length; i ++) {
			this.points[i].draw();
		}
		for (var i = 0; i < this.strings.length; i ++) {
			this.strings[i].draw();
		}
	}
}

/***** Point *****/

spider.WebPoint = function(_x, _y, _fixed) {
	this.fixed = (_fixed) ? true : false;
	this.strings = [];
	this.x = _x;
	this.y = _y;
}

spider.WebPoint.prototype = {
	addString: function(str) {
		this.strings.push(str);
		console.log(this.strings);
		console.log("###");
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
		if (this.fixed) return;
		var xSum = 0;
		var ySum = 0;
		
		for (var i = 0; i < this.strings.length; i ++) {
			var pt = this.strings[i].getAnotherEnd(this);
			xSum += pt.x;
			ySum += pt.y;
		}
		var tx = xSum / this.strings.length;
		var ty = ySum / this.strings.length;
		var dx = tx - this.x;
		var dy = ty - this.y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		var spd  = 2;
		if (dist == 0 ) return;
		if (dist < spd) spd = dist;
		this.x += dx / dist * spd;
		this.y += dy / dist * spd;
		
	},
	draw: function() {
		if (this.fixed) {
			graphics.drawCircle("#ffffff", this.x, this.y, 3);
		} else {	
			graphics.drawCircle("#aaaaff", this.x, this.y, 3);
		}
	}
}

/***** String *****/

spider.WebString = function(_p0, _p1) {
	this.p0 = _p0;
	this.p1 = _p1;
}

spider.WebString.prototype = {
	draw: function() {
		if (this == main.stage.intersectingPath) {
			graphics.drawLine("#ffffff", this.p0.x, this.p0.y, this.p1.x, this.p1.y);
		} else {
			graphics.drawLine("#888888", this.p0.x, this.p0.y, this.p1.x, this.p1.y);
		}
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
