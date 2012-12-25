/*****  Stage *****/
var v = verlet;

var Stage = function(){
    this.init();
};

Stage.prototype = {
    init: function(){
    	Client.check();
		console.log('init');
		this.system = new v.VerletSystem();
		this.gm = new graphics.graphicsManager();
		var sprites = [
			{x:100, y: 100},
			{x:200, y: 200},
			{x:100, y: 200},
			{x:200, y: 100}
    	];
		for (var i = 0; i < sprites.length; i ++) {
			var sprite = new graphics.Sprite(0, 0, [new geom.Circle(0, 0, 25)]);
			this.gm.sprites.push(sprite);
			sprite.x = sprites[i].x;
			sprite.y = sprites[i].y;
		}
		
 	},
    enterFrame: function(){
		this.update();
		this.draw();
    },
	update: function() {
		this.gm.update();
	}, 
	draw: function() {
		graphics.clear();
		this.gm.drawWireFrame();
		graphics.drawLine("#ff9999", this.gm.sprites[0].x, this.gm.sprites[0].y, this.gm.sprites[1].x, this.gm.sprites[1].y);
		graphics.drawLine("#ff9999", this.gm.sprites[2].x, this.gm.sprites[2].y, this.gm.sprites[3].x, this.gm.sprites[3].y);
		
		var intersection = MathUtil.getIntersection2(this.gm.sprites[0].x, this.gm.sprites[0].y, this.gm.sprites[1].x, this.gm.sprites[1].y, this.gm.sprites[2].x, this.gm.sprites[2].y, this.gm.sprites[3].x, this.gm.sprites[3].y);
		if (intersection) {
			graphics.drawCircle("#ff99ff", intersection.x, intersection.y, 10);
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
				this.gm.clearDragTarget();
			break;
		}
	},
	hitTest: function() {
		var target = null;
		for (var i = 0; i < this.gm.sprites.length; i ++) {
			if (this.gm.sprites[i].hitTest(main.mouseX, main.mouseY)) {
				target = this.gm.sprites[i];
				this.gm.addDragTarget(target);
				break;
			}
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