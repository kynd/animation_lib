/*****  Stage *****/
var v = verlet;

var Stage = function(){
    this.init();
};

Stage.prototype = {
    init: function(){
		console.log('init');
		this.system = new v.VerletSystem();
		this.gm = new graphics.graphicsManager();
		
		this.touchFlag = false;
		this.targets =[];
		
		var x1, y1, x2, y2, d, theta;
		for (var i = 0; i < 30; i ++) {
			x1 = Math.random() * main.stageWidth;
			y1 = Math.random() * main.stageHeight;
			d = 10;
			theta = Math.random() * Math.PI * 2;
			x2 = x1 + Math.cos(theta) * d;
			y2 = y1 + Math.sin(theta) * d;
			this.system.points[i *2] = new v.VerletPoint(x1, y1, 0);
			this.system.points[i *2 +1] = new v.VerletPoint(x2, y2, 0);
			this.system.sticks[i] = new v.VerletStick(this.system.points[i *2], this.system.points[i *2+1]);
			var sprite = new graphics.Sprite(0,0,[]);
			sprite.bind(this.system.sticks[i]);
			sprite.loadImage("images/bee.png");
			this.gm.sprites.push(sprite);
		}
		
		this.setTarget();
    },
    enterFrame: function(){
		this.update();
		this.draw();
    },
	update: function() {
		for (var i = 0; i < this.system.points.length / 2; i ++) {
			var spd = 2;
			var dx = this.targets[i].x - this.system.points[i * 2].x;
			var dy = this.targets[i].y - this.system.points[i *2].y;
			var dist = Math.sqrt(dx * dx + dy * dy);
			if (dist > spd) {
				dist = dist / spd;
			} else {dist = 1;}
			this.system.points[i * 2].setVx(this.system.points[i * 2].getVx() +dx / dist);
			this.system.points[i * 2].setVy(this.system.points[i * 2].getVy() +dy / dist);
			
			if (this.touchFlag) {
				var spd = 3;
				var dx =  this.system.points[i * 2].x - main.mouseX;
				var dy = this.system.points[i *2].y - main.mouseY;
				var dist = Math.pow(Math.sqrt(dx * dx + dy * dy), 1.1);
				this.system.points[i * 2].setVx(this.system.points[i * 2].getVx() +dx / dist * spd);
				this.system.points[i * 2].setVy(this.system.points[i * 2].getVy() +dy / dist * spd);
			}
		}
		
		this.system.update();
		this.gm.update();
		
		if (Math.random() <=0.2) {
			this.setTarget();
		}
	}, 
	draw: function() {
		graphics.clear();
		if (main.wireframe) {
			graphics.drawGrid();
			this.gm.drawWireFrame();
			this.system.drawWireFrame();
		} else {
			this.gm.draw();
		}
	},
	setTarget: function() {
		for (var i =0; i < this.system.points.length / 2; i ++) { 
			this.targets[i] = {	x: Math.random() * main.stageWidth / 2 + main.stageWidth / 4, 
									y: Math.random() * main.stageHeight / 2 + main.stageHeight / 4};
		}
	},
	interactionHandler: function(event) {
		switch(event.type) {
			case "mousedown":
			case "touchstart":
				this.touchFlag = true;
			break;
			case "mouseup":
			case "touchend":
				this.touchFlag = false;
			break;
		}
	}
};