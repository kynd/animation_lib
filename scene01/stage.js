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
		var points = [[-30, -50, 0], [-30, 50, 0], [30, 50, 0], [30, -50, 0],
					[-50, 110, 0], [-50, 170, 0], [50, 110, 0], [50, 170, 0],
					[-90, -50, 0],[-140, -50, 0],[90, -50, 0],[140, -50, 0],
					[-170, 120, 0] ];
		var sticks = [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3], 
					[1,4], [4,5], [2,6],[6,7],
					[0,8], [8,9], [3,10], [10,11],
					[9,12]] ;
		for (var i = 0; i < points.length; i ++) {
			this.system.points.push(new v.VerletPoint(points[i][0] + cx, points[i][1] + cy, points[i][2]));
		}
		for (var i = 0; i < sticks.length; i ++) {
			this.system.sticks.push(new v.VerletStick(this.system.points[sticks[i][0]], this.system.points[sticks[i][1]]));
		}
		
		this.headNode = new v.VerletViewNode();
		this.bodyNode = new v.VerletViewNode();
		
		var sprites = [
			{bind: this.bodyNode, boundary: [new geom.Rectangle(-35, -50, 35, 50)], src: "images/body.png"},
			{bind: this.headNode, boundary: [new geom.Circle(0, 0, 40)], src: "images/head.png"},
			{bind: this.system.sticks[6], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/thigh_r.png"},
			{bind: this.system.sticks[7], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/foot_r.png"},
			{bind: this.system.sticks[8], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/thigh_l.png"}, 
			{bind: this.system.sticks[9], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/foot_l.png"}, 
			{bind: this.system.sticks[10], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/upper_arm_r.png"}, 
			{bind: this.system.sticks[11], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/forearm_r.png"}, 
			{bind: this.system.sticks[12], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/upper_arm_l.png"},
			{bind: this.system.sticks[13], boundary: [new geom.Rectangle(-10,-30, 10, 30)], src: "images/forearm_l.png"}, 
			{bind: this.system.sticks[14], boundary: [new geom.Rectangle(6,-80, 22, 80), new geom.Rectangle(-20,-80, 20, -40)], src: "images/cane.png"}
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
		var spd = 8;
		var dx = main.mouseX - this.system.points[11].x;
		var dy = main.mouseY - this.system.points[11].y;
		var dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > spd) {
			dist = dist / spd;
		} else {dist = 1;}
		this.system.points[11].x += dx / dist;
		this.system.points[11].y += dy / dist;
		this.system.points[12].y += 2;
		this.system.points[5].y += 4;
		this.system.points[7].y += 4;
		this.system.update();
		
		var x1, y1, x2, y2;
		x1 = (this.system.points[0].x + this.system.points[3].x) / 2;
		y1 = (this.system.points[0].y + this.system.points[3].y) / 2;
		x2 = (this.system.points[1].x + this.system.points[2].x) / 2;
		y2 = (this.system.points[1].y + this.system.points[2].y) / 2;
		var dx = x1 - x2;
		var dy = y1 - y2;
		var dist = Math.sqrt(dx * dx + dy * dy);
		
		this.bodyNode.setPosition(x1, y1, x2, y2);
		this.headNode.setPosition(x1 + dx / dist * 48, y1 + dy / dist * 48 - 1,  x1 + dx / dist * 48, y1 + dy / dist * 48);
		
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
		graphics.drawLine("#ffaaaa", main.mouseX, main.mouseY, this.system.points[11].x, this.system.points[11].y);
		graphics.drawCircle("#ffaaaa", main.mouseX, main.mouseY, 5);
	},
	interactionHandler: function(event) {
		switch(event.type) {
			case "mousedown":
			break;
		}
	}
};