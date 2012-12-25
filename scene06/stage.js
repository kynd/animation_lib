/*****  Stage *****/
var v = verlet;

var Stage = function(){
	this.bDrag = false; this.dx = this.dy = 0;
    this.init();
    
    this.state = {};
    this.state.READY = 0;
    this.state.CATCH = 1;
    this.state.EATING = 2;
    this.state.STEAL = 3;
    this.state.current = this.state.READY;
    this.state.rotateCnt = 0;
    this.ox = this.oy = this.tx = this.ty = 0;
    this.vy = 0;
};

Stage.prototype = {
    init: function(){
		console.log('init');
		this.gm = new graphics.graphicsManager();
		this.cx = main.stageWidth / 2;
		this.cy = main.stageHeight - 180;
		
		
		this.shadow = new graphics.Sprite(this.cx - 30, this.cy + 55); this.shadow.loadImage("images/shadow.png");
		this.gm.addSprite(this.shadow);
		
		this.cat = new graphics.SpriteGroup(this.cx, this.cy);
		this.gm.addSprite(this.cat);
		this.body = new graphics.Sprite(0, - 50); this.body.loadImage("images/body.png");
		this.cat.addSprite(this.body);
		
		this.catHead = new graphics.SpriteGroup(110, -180);
		this.cat.addSprite(this.catHead);
		this.eyes = new graphics.Sprite(-4,-4); this.eyes.loadImage("images/eyes.png");
		this.catHead.addSprite(this.eyes);
		this.head = new graphics.Sprite(-10, 0); this.head.loadImage("images/head.png");
		this.catHead.addSprite(this.head);
		this.nose = new graphics.Sprite(3, 28); this.nose.loadImage("images/nose.png");
		this.catHead.addSprite(this.nose);
		this.head.cat = true;
		this.fish = new graphics.Sprite(this.cx / 2, 60, [new geom.Rectangle(-110, -65, 70, 20), new geom.Rectangle(30, -55, 110, 50)]); this.fish.loadImage("images/fish.png");
		this.gm.addSprite(this.fish);
		
		
		this.extraNose = new graphics.Sprite(0,0); this.extraNose.loadImage("images/nose.png");
		this.gm.addSprite(this.extraNose);
		this.extraNose.visible = false;
		
		this.shadow.name ="shadow";
		this.cat.name ="cat";
		this.catHead.name  ="catHead ";
		this.eyes.name ="eyes";
		this.head.name  ="head";
		this.catHead.name ="catHead";
		this.nose.name ="nose";
		this.fish.name ="fish ";
    },
    enterFrame: function(){
		this.update();
		this.draw();
    },
	update: function() {
		switch (this.state.current) {
			case this.state.READY:
				this.update0();
			break;
			case this.state.CATCH:
				this.update1();
			break;
			case this.state.EAT:
				this.update2();
			break;
			case this.state.STEAL:
				this.update3();
			break;
		}
	},
	update0: function() {
		this.updateCat();
		if (!this.bDrag) {
			this.vy += 0.8;
			this.fish.y += this.vy;
			if (this.fish.y > this.cy + 120) {
				this.vy *= -0.4;
				this.fish.y = this.cy + 120;
			}
		}

		var p = this.catHead.toLocalPos(this.fish.x, this.fish.y);
		var d = Math.sqrt(p.x * p.x + (p.y - 80) * (p.y - 80));
		if (d < 60) {
			this.state.current = this.state.CATCH;
			this.ox = this.cat.x;
			this.oy = this.cat.y;
			p = this.catHead.toGlobalPos(0,0);
			this.tx = this.cat.x + this.fish.x - p.x;
			this.ty = this.cat.y + this.fish.y - p.y - 80;
			this.bDrag = false;
		}
		
		if (this.fish.y > this.cy + 120) {
			this.fish.y = this.cy + 120;
		}
	},
	update1: function() {
		var dx = this.tx - this.cat.x;
		var dy = this.ty - this.cat.y
		this.cat.x += dx / 5;
		this.cat.y += dy / 5;
		var d = Math.sqrt(dx * dx + dy * dy);
		
		if (d < 5) {
			this.state.current = this.state.EAT;
		}
	},
	update2: function() {
		this.extraNose.visible = true;
		var dx = this.ox - this.cat.x;
		var dy = this.oy - this.cat.y
		this.cat.x += dx / 5;
		this.cat.y += dy / 5;
		var d = Math.sqrt(dx * dx + dy * dy);
		this.state.rotateCnt += 0.1;
		this.catHead.rotation = Math.sin(this.state.rotateCnt) / 5;
		
		//fish
		p = this.catHead.toGlobalPos(0,80);
		this.fish.x = p.x;
		this.fish.y = p.y;
		this.fish.rotation = this.catHead.rotation;
		
		//extraNose
		p = this.catHead.toGlobalPos(this.nose.x, this.nose.y);
		this.extraNose.x = p.x;
		this.extraNose.y = p.y;
		this.extraNose.rotation = this.catHead.rotation;
		
		if (this.bDrag) {
			this.state.current = this.state.STEAL;
			this.fish.rotation = 0;
		}
	},
	update3: function() {
		this.extraNose.visible = false;
		this.updateCat();
		// fish
		if (this.bDrag) {
			this.fish.x = main.mouseX - this.dx;
			this.fish.y = main.mouseY - this.dy;
		}
		p = this.catHead.toLocalPos(this.fish.x, this.fish.y);
		var d = Math.sqrt(p.x * p.x + (p.y - 80) * (p.y - 80));
		if (d > 120) {
			this.state.current = this.state.READY;
		}
	},
	updateCat: function() {
		// fish
		if (this.bDrag) {
			this.fish.x = main.mouseX - this.dx;
			this.fish.y = main.mouseY - this.dy;
		}
		//head
		var p = this.catHead.toGlobalPos(0,0);
		this.catHead.rotation = Math.max(-0.2, Math.min(0.2, (p.x - this.fish.x) / 1000));
		//body
		this.cat.rotation = Math.max(-0.1, Math.min(0.1, (this.fish.x - p.x) / 5000));
		//shadow
		this.shadow.rotation = Math.max(-0.1, Math.min(0.1, (this.fish.x - p.x) / 5000));
		this.shadow.x = (this.fish.x - p.x) / 150 + this.cx - 10;
		
		// eyes
		p = this.catHead.toLocalPos(this.fish.x, this.fish.y);
		var d = Math.sqrt(p.x * p.x + (p.y - 80) * (p.y - 80));
		var dmax = d / 50;
		var mx = 10;
		if (dmax > mx) {dmax = mx}
		this.eyes.x = p.x / d * dmax - 4;
		this.eyes.y = p.y / d * dmax - 4;
		
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
		
		var p = this.catHead.toGlobalPos(0,0);
	},
	interactionHandler: function(event) {
		switch(event.type) {
			case "mousedown":
			case "touchstart":
				this.hitTest();
			break;
			case "mouseup":
			case "touchend":
				this.bDrag = false;
			break;
		}
	},
	hitTest: function() {
		if (this.fish.hitTest(main.mouseX, main.mouseY)) {
				this.bDrag = true;
				this.dx = main.mouseX - this.fish.x;
				this.dy = main.mouseY - this.fish.y; 
		}
	}
};