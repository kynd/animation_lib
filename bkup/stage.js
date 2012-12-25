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
		this.spider = new Spider();
		this.spider.tx = this.spider.x = main.stageWidth / 2;
		this.spider.ty = main.stageHeight;
		
		
 	},
    enterFrame: function(){
		this.update();
		this.draw();
    },
	update: function() {
		this.spider.update();
	}, 
	draw: function() {
		graphics.clear();
		this.spider.draw();
	},
	interactionHandler: function(event) {
		switch(event.type) {
			case "mousedown":
			case "touchstart":
				//this.hitTest();
				
			break;
			case "mouseup":
			case "touchend":
				this.spider.tx = main.mouseX;
				this.spider.ty = main.mouseY;
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

var Spider = function() {
}
Spider.prototype = {
	ox: 0,
	oy: 0,
	x: 0,
	y: 0,
	tx: 0,
	ty: 0,
	update: function() {
		var dist = Math.sqrt((this.x - this.tx) * (this.x - this.tx) + (this.y - this.ty) * (this.y - this.ty));
		if (dist == 0) { return };
		if (dist < 1) {
			dist = 1;
		}
		var dx = (this.tx - this.x) / dist;
		var dy = (this.ty - this.y) / dist;
		this.x += dx;
		this.y += dy;
		console.log(this.x + "-" + this.y);
	},
	draw: function() {
		graphics.drawCircle("#ff0000", this.x, this.y, 10);
	}
}


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