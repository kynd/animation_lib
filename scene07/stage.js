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
		
		var cx = main.stageWidth / 2;
		var cy = main.stageHeight / 2;
		var points = [	[0, -80, 0], [0, 80, 0], [-10, 100, 0],
						[0, -80, 0], [0, 80, 0], [-10, 100, 0],
						[0, -80, 0], [0, 80, 0], [-10, 100, 0],
						[0, -80, 0], [0, 80, 0], [10, 100, 0],
						[0, -80, 0], [0, 80, 0], [10, 100, 0],
						[0, -80, 0], [0, 80, 0], [10, 100, 0]];
		var sticks = [	[0,1],[1,2],
						[3,4],[4,5],
						[6,7],[7,8],
						[9,10],[10,11],
						[12,13],[13,14],
						[15,16],[16,17]];
		for (var i = 0; i < points.length; i ++) {
			this.system.points.push(new v.VerletPoint(points[i][0] + cx, points[i][1] + cy, points[i][2]));
			this.system.points[i].x += (Math.random() - 0.5) * 5;
			this.system.points[i].y += -Math.random() * 5;
		}
		for (var i = 0; i < sticks.length; i ++) {
			this.system.sticks.push(new v.VerletStick(this.system.points[sticks[i][0]], this.system.points[sticks[i][1]]));
		}
	
		var sprites = [
			{bind: this.system.sticks[0], boundary: [new geom.Rectangle(-20,-80, 20, 80)], src: "images/carrot.png"},
			{bind: this.system.sticks[2], boundary: [new geom.Rectangle(-20,-80, 20, 80)], src: "images/carrot.png"},
			{bind: this.system.sticks[4], boundary: [new geom.Rectangle(-20,-80, 20, 80)], src: "images/carrot.png"},
			{bind: this.system.sticks[6], boundary: [new geom.Rectangle(-20,-80, 20, 80)], src: "images/carrot.png"},
			{bind: this.system.sticks[8], boundary: [new geom.Rectangle(-20,-80, 20, 80)], src: "images/carrot.png"},
			{bind: this.system.sticks[10], boundary: [new geom.Rectangle(-20,-80, 20, 80)], src: "images/carrot.png"}
		];
		for (var i = 0; i < sprites.length; i ++) {
			var sprite = new graphics.Sprite(0, 0, sprites[i].boundary);
			sprite.bind(sprites[i].bind);
			sprite.loadImage(sprites[i].src);
			this.gm.sprites.push(sprite);
		}
	},
    enterFrame: function(){
		this.update();
		this.draw();
    },
	update: function() {
		/* gravity */
		
		for (var i = 0; i < this.system.points.length; i ++){
			this.system.points[i].y += 0.5;
			
			if (this.system.points[i].y >= main.stageHeight - 80) {
				var temp = this.system.points[i].getVy();
				var temp = this.system.points[i].y = main.stageHeight - 80;
				this.system.points[i].setVy(temp * -0.03);
				this.system.points[i].setVx(this.system.points[i].getVx() * 0.5);
			}
		}
		this.system.update();
		
		this.gm.update();
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
	interactionHandler: function(event) {
		switch(event.type) {
			case "mousedown":
			case "touchstart":
				this.hitTest();
			break;
			case "mouseup":
			case "touchend":
				this.system.clearDragTarget();
			break;
		}
	},
	hitTest: function() {
		var target = null;
		for (var i = 0; i < this.gm.sprites.length; i ++) {
			if (this.gm.sprites[i].hitTest(main.mouseX, main.mouseY)) {
				target = this.gm.sprites[i].bindTarget;
				break;
			}
		}
		if (target) {
			switch (target) {
				default:
					console.log('drag');
					this.system.addDragTarget(target.p1);
					this.system.addDragTarget(target.p2);
				break;
			}
		}
	}
};