/*
*	Verlet Integration Library
*/

var verlet = {};

/***** Point *****/

verlet.VerletPoint = function(_x, _y, _z) {
	this.type = "point";
	this.setPos(_x, _y, _z);
}

verlet.VerletPoint.prototype = {
	update: function() {
		var tx = this.x;
		var ty = this.y;
		var tz = this.z;
		this.x += this.getVx();
		this.y += this.getVy();
		this.z += this.getVz();
		this.ox = tx;
		this.oy = ty;
		this.oz = tz;
	},
	constrain: function(xmin, ymin, zmin, xmax, ymax, zmax ) {
		this.x = Math.max(xmin, Math.min(xmax, this.x));
		this.y = Math.max(ymin, Math.min(ymax, this.y));
		this.z = Math.max(zmin, Math.min(zmax, this.z));
	},
	setVx: function(n) {
		this.ox = this.x - n;
	},
	setVy: function(n) {
		this.oy = this.y - n;
	},
	setVz: function(n) {
		this.oz = this.z - n;
	},
	getVx: function() {
		return this.x - this.ox;
	},
	getVy: function() {
		return this.y - this.oy;
	},
	getVz: function() {
		return this.z - this.oz;
	},
	setPos: function(_x, _y, _z) {
		this.ox = this.x = _x;
		this.oy = this.y = _y;
		this.oz = this.z = _z;
	},
	draw: function() {
		graphics.drawCircle("#999900", this.x, this.y, 5);
	}
}


/***** Stick *****/

verlet.VerletStick = function(_p1, _p2, len) {
	this.type = "stick";
	this.p1 = _p1;
	this.p2 = _p2;
	if (!len) {
		var dx = this.p2.x - this.p1.x;
		var dy = this.p2.y - this.p1.y;
		var dz = this.p2.z - this.p1.z;
		var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
		this.length = d;
	} else {
		this.length = len;
	}
}

verlet.VerletStick.prototype = {
	update: function() {
		var dx = this.p2.x - this.p1.x;
		var dy = this.p2.y - this.p1.y;
		var dz = this.p2.z - this.p1.z;
		var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
		if (d == 0)	 {	return; }
		var diff = this.length - d;
		var offsetX = (diff * dx / d) / 2;
		var offsetY = (diff * dy / d) / 2;
		var offsetZ = (diff * dz / d) / 2;
		this.p1.x -= offsetX;
		this.p1.y -= offsetY;
		this.p1.z -= offsetZ;
		this.p2.x += offsetX;
		this.p2.y += offsetY;
		this.p2.z += offsetZ;
	},
	draw: function() {
		graphics.drawLine("#ff9900", this.p1.x, this.p1.y, this.p2.x, this.p2.y);
	}
}

/***** System *****/

verlet.VerletSystem = function() {
	this.points = [];
	this.sticks = [];
	this.dragObj = [];
	this.fixObj = [];
	this.deceleration = 0.98;
	this.acc = 3;
}

verlet.VerletSystem.prototype = {
	update: function() {
		for (var i = 0; i < this.points.length; i ++) {
			this.points[i].update();
			this.points[i].setVx(this.points[i].getVx() * this.deceleration);
			this.points[i].setVy(this.points[i].getVy() * this.deceleration);
			this.points[i].setVz(this.points[i].getVz() * this.deceleration);
			this.points[i].constrain(30, 30, 0, main.stageWidth - 30, main.stageHeight - 30, 0);
		}
		
		for (var j = 0; j < this.acc; j ++) {
			for (var i = 0; i < this.sticks.length; i ++) {
				this.sticks[i].update();
			}
			for (var k = 0; k < this.dragObj.length; k ++) {
				this.dragObj[k].target.x = this.dragObj[k].x + main.mouseX;
				this.dragObj[k].target.y = this.dragObj[k].y + main.mouseY;
			}
			for (var k = 0; k < this.fixObj.length; k ++) {
				this.fixObj[k].target.x = this.fixObj[k].x;
				this.fixObj[k].target.y = this.fixObj[k].y;
			}
		}
	},
	addDragTarget: function(obj) {
		this.dragObj.push({target: obj, x: obj.x - main.mouseX, y: obj.y - main.mouseY});
	},
	clearDragTarget: function() {
		this.dragObj = [];
	},
	addFixTarget: function(obj, _x, _y) {
		this.fixObj.push({target: obj, x: _x, y:_y});
	},
	clearFixTarget: function() {
		this.fixObj = [];
	},
	drawWireFrame: function() {	
		for (var i = 0; i < this.points.length; i ++) {
			this.points[i].draw();
		}
		for (var i = 0; i < this.sticks.length; i ++) {
			this.sticks[i].draw();
		}
		for (var i = 0; i < this.sticks.length; i ++) {
			this.sticks[i].draw();
		}
	}
}

/***** ViewNode *****/
verlet.VerletViewNode = function() {
	this.type = "viewNode";
	this.p1 = {x:0, y:0};
	this.p2 = {x:0, y:0};
}
verlet.VerletViewNode.prototype = {
	setPosition: function(x1, y1, x2, y2) {
		this.p1.x = x1;
		this.p1.y = y1;
		this.p2.x = x2;
		this.p2.y = y2;
	},
	draw: function() {
		graphics.drawLine("#009900", this.p1.x, this.p1.y, this.p2.x, this.p2.y);
	}
}




