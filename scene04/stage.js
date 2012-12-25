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
		this.lastMx = cx;
		this.lastMy = cy;
		var points = [[-100, 0, 0], [100, 0, 0], [0, -250, 0], 
					[0, -150, 0], 
					[-75, -180, 0], [-100, -250, 0], [-75, -320, 0], 
					[0, -350, 0],
					[75, -180, 0], [100, -250, 0], [75, -320, 0], 
					
					[0, -100, 0], 
					[-75, -130, 0], [-100, -200, 0], [-75, -270, 0], 
					[0, -300, 0],
					[75, -130, 0], [100, -200, 0], [75, -270, 0],
					];
		var sticks = [[0,1],[1,2],[0,2], [0,3],[1,3], [2,3],
		[3,4], [4,5], [5, 6], [6,7],
		[3,8],[8,9],[9,10],[10,7],
		[4,2], [5,2], [6,2],[7,2],[8,2],[9,2],[10,2],
		[3,11], [4,12], [5,13], [6, 14], [7,15], [8,16], [9,17], [10,18]] ;
		for (var i = 0; i < points.length; i ++) {
			this.system.points.push(new v.VerletPoint(points[i][0] + cx, points[i][1] + main.stageHeight - 10, points[i][2]));
		}
		for (var i = 0; i < sticks.length; i ++) {
			this.system.sticks.push(new v.VerletStick(this.system.points[sticks[i][0]], this.system.points[sticks[i][1]]));
		}
		
		this.faceNode = new v.VerletViewNode(); 
		this.bodyNode = new v.VerletViewNode(); 
		var sprites = [
			{bind: this.bodyNode, boundary: [], src: "images/body.png"},
			{bind: this.faceNode, boundary: [new geom.Circle(0, 0, 100)], src: "images/face.png"},
			{bind: this.system.sticks[21], boundary: [], src: "images/hair.png"},
			{bind: this.system.sticks[22], boundary: [], src: "images/hair.png"}, 
			{bind: this.system.sticks[23], boundary: [], src: "images/hair.png"}, 
			{bind: this.system.sticks[24], boundary: [], src: "images/hair.png"}, 
			{bind: this.system.sticks[25], boundary: [], src: "images/hair.png"}, 
			{bind: this.system.sticks[25], boundary: [], src: "images/hair.png"},
			{bind: this.system.sticks[26], boundary: [], src: "images/hair.png"},
			{bind: this.system.sticks[27], boundary: [], src: "images/hair.png"},
			{bind: this.system.sticks[28], boundary: [], src: "images/hair.png"}
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
		 
		// gravity
		for (var i = 0; i < this.system.points.length; i ++){
			this.system.points[i].y += 0.5;
		}
		
		// fix
		this.system.clearFixTarget();
		this.system.addFixTarget(this.system.points[0], main.stageWidth / 2 -100, main.stageHeight - 10);
		this.system.addFixTarget(this.system.points[1], main.stageWidth / 2 + 100, main.stageHeight - 10);
		
		var spd = 10;
		var dx = main.mouseX - this.lastMx;
		var dy = main.mouseY - this.lastMy;
		var dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > spd) {
			dist = dist / spd;
		} else {dist = 1;}
		this.system.points[7].x += dx / dist;
		this.system.points[7].y += dy / dist;
		
		// update verlet system
		var x1 = this.system.points[7].x;
		var y1 = this.system.points[7].y;
		var x2 = this.system.points[3].x;
		var y2 = this.system.points[3].y;
		this.faceNode.setPosition(x1, y1, x2,  y2);
		var x1 = this.system.points[2].x;
		var y1 = this.system.points[2].y;
		var x2 = (this.system.points[0].x + this.system.points[1].x) / 2;
		var y2 = (this.system.points[0].y + this.system.points[1].y) / 2;
		this.bodyNode.setPosition(x1, y1, x2,  y2);
		
		this.system.update();
		
		// sprites
		this.gm.update();
		
		// record mouse position
		this.lastMx = main.mouseX;
		this.lastMy = main.mouseY;
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
			break;
			case "mouseup":
			case "touchend":
			break;
		}
	}
};