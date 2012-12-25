/*****  Stage *****/
var v = verlet;

var Stage = function(){
    this.init();
};

Stage.prototype = {
    init: function(){
    	this.bJump = false;
    	this.bGrab = false;
    	this.rHand = true;
    	this.jumpCount = 0;
    	this.targetX = 0;
    	this.targetY = 0;
    	this.previousTargetX = 0;
    	this.previousTargetY = 0;
    	
		console.log('init');
		this.system = new v.VerletSystem();
		this.gm = new graphics.graphicsManager();
		
		var cx = main.stageWidth / 2;
		var cy = main.stageHeight / 2;
		var points = [[-30, -50, 0], [-30, 50, 0], [30, 50, 0], [30, -50, 0],
					[-50, 110, 0], [-50, 170, 0], [50, 110, 0], [50, 170, 0],
					[-90, -50, 0],[-140, -50, 0],[90, -50, 0],[140, -50, 0],
					[-170, 120, 0],
					[0, -100, 0]];
		var sticks = [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3], 
					[1,4], [4,5], [2,6],[6,7],
					[0,8], [8,9], [3,10], [10,11],
					[9,12],
					[0,13], [1, 13], [2, 13],[3, 13]] ;
		for (var i = 0; i < points.length; i ++) {
			this.system.points.push(new v.VerletPoint(points[i][0] + cx, points[i][1] + cy, points[i][2]));
		}
		for (var i = 0; i < sticks.length; i ++) {
			this.system.sticks.push(new v.VerletStick(this.system.points[sticks[i][0]], this.system.points[sticks[i][1]]));
		}
		
		this.bodyNode = new v.VerletViewNode();

		var sprites = [
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: null, boundary: [new geom.Circle(0, 0, 25)], src: "images/pin.png"},
			{bind: this.bodyNode, boundary: [new geom.Rectangle(-35, -50, 35, 50)], src: "images/body.png"},
			{bind: this.system.points[13], boundary: [new geom.Circle(0, 0, 40)], src: "images/head.png"},
			{bind: this.system.sticks[6], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/thigh_r.png"},
			{bind: this.system.sticks[7], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/foot_r.png"},
			{bind: this.system.sticks[8], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/thigh_l.png"}, 
			{bind: this.system.sticks[9], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/foot_l.png"}, 
			{bind: this.system.sticks[10], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/upper_arm_r.png"}, 
			{bind: this.system.sticks[11], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/forearm_r.png"}, 
			{bind: this.system.sticks[12], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/upper_arm_l.png"},
			{bind: this.system.sticks[13], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/forearm_l.png"}
		];
		for (var i = 0; i < sprites.length; i ++) {
			var sprite = new graphics.Sprite(0, 0, sprites[i].boundary);
			if (sprites[i].bind) {console.log(i);sprite.bind(sprites[i].bind)};
			sprite.loadImage(sprites[i].src);
			this.gm.sprites.push(sprite);
		}
		for (var i = 0; i < 15; i ++) {
			this.gm.sprites[i].rx = (Math.random() - 0.5) * 600;
			this.gm.sprites[i].ry = Math.random() * -500 - 200;
		}
	},
    enterFrame: function(){
		this.update();
		this.draw();
    },
	update: function() {
		/* pins */
		for (var i = 0; i < 15; i ++) {
			this.gm.sprites[i].x = this.gm.sprites[i].rx + main.stageWidth / 2;
			this.gm.sprites[i].y = this.gm.sprites[i].ry + main.stageHeight;
		}
		
		/* gravity */
		
		for (var i = 0; i < this.system.points.length; i ++){
			this.system.points[i].y += 0.5;
		}
		
		/* jump */
		
		
		var hand = (this.rHand) ? 9 : 11;
		var otherHand = (this.rHand) ? 11 : 9;
		var shoulder0 = (this.rHand) ? 0 : 3;
		var shoulder1 = (this.rHand) ? 3 : 0;
		var dx = this.targetX - this.system.points[hand].x;
		var dy = this.targetY - this.system.points[hand].y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		
		var dx0 = this.targetX - this.system.points[shoulder0].x;
		var dy0 = this.targetY - this.system.points[shoulder0].y;
		var dist0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
		
		var dx1 = this.previousTargetX - this.system.points[shoulder1].x;
		var dy1 = this.previousTargetY - this.system.points[shoulder1].y;
		var dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
		
		
		if (this.bJump) {
			this.bGrab = true;
			var spd = 18;
			if (spd > dist) {
				spd = dist;
			}
			this.system.points[hand].x += dx / dist * spd;
			this.system.points[hand].y += dy / dist * spd;
			if (dist1 > 130 && this.system.points[0].y < main.stageHeight - 150 && this.system.points[3].y < main.stageHeight - 150 ) {
				this.bJump = false;
			}
		}
		
		if (dist < 20) {
			
			//this.system.points[hand].x += dx / dist * spd;
			//this.system.points[hand].y += dy / dist * spd;
			
			this.system.points[hand].setPos(this.targetX, this.targetY, 0);
		}
		if (dist1 < 130 && this.bJump) {
			this.system.points[otherHand].setPos(this.previousTargetX, this.previousTargetY, 0);
		} else {
			this.bGrab = false;
		}
		
		/* update */
		
		this.system.update();
		
		/* head and body */
		
		var x1, y1, x2, y2;
		x1 = (this.system.points[0].x + this.system.points[3].x) / 2;
		y1 = (this.system.points[0].y + this.system.points[3].y) / 2;
		x2 = (this.system.points[1].x + this.system.points[2].x) / 2;
		y2 = (this.system.points[1].y + this.system.points[2].y) / 2;
		var dx = x1 - x2;
		var dy = y1 - y2;
		var dist = Math.sqrt(dx * dx + dy * dy);
		this.bodyNode.setPosition(x1, y1, x2, y2);
		
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
				//this.system.clearDragTarget();
			break;
		}
	},
	hitTest: function() {
		var target = null;
		for (var i = 0; i < this.gm.sprites.length; i ++) {
			if (this.gm.sprites[i].hitTest(main.mouseX, main.mouseY)) {
				target = this.gm.sprites[i];
				break;
			}
		}
		if (this.gm.sprites[i]) {
				this.bJump = true;
    			this.rHand = !this.rHand;
    			
    			this.previousTargetX = this.targetX;
    			this.previousTargetY = this.targetY;
    			this.targetX = this.gm.sprites[i].x;
    			this.targetY = this.gm.sprites[i].y - 5;
		}
	}
};