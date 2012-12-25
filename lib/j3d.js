/*
* 3D library
*/


var j3d = {};

/**** 3D Model ****/
j3d.Model = function() {
	this.points = [];
    this.triangles = [];
}

j3d.Model.prototype = {
	setPoint: function( point ){
		this.points.push( point );
    },
    setTriangles: function( triangle ){
		this.triangles.push( triangle );
    },
	rotateX:function(angle) {
		for( var i = 0, n = this.points.length ; i < n; i++ ){
			this.rotatePointX( this.points[i], angle ); 
		}
	},
	rotateY:function(angle) {
		for( var i = 0, n = this.points.length ; i < n; i++ ){
			this.rotatePointY( this.points[i], angle ); 
		}
	},
	 rotatePointX: function( point, angle ){
        var cos = Math.cos( angle );
        var sin = Math.sin( angle );

        ty = point.y * cos - point.z * sin;
        tz = point.z * cos + point.y * sin;

        point.y = ty;
        point.z = tz;
    },
    rotatePointY: function( point, angle ){
        var cos = Math.cos( angle );
        var sin = Math.sin( angle );

        tx = point.x * cos - point.z * sin;
        tz = point.z * cos + point.x * sin;

        point.x = tx;
        point.z = tz;
    },
    render: function(canvas){
        canvas.save();

        for( var i = 0, n = this.triangles.length; i < n; i++ ){
            var triangle = this.triangles[i];
     	if( triangle.isBackFace() ){ continue; };
            var color = triangle.getAdjustedColor();

            canvas.beginPath();
            canvas.fillStyle = color;
            canvas.strokeStyle = color;
            canvas.lineWidth = 2;
            canvas.lineJoin = "round";
            
            canvas.moveTo( triangle.a.screenX(), triangle.a.screenY() );
            canvas.lineTo( triangle.b.screenX(), triangle.b.screenY() );
            canvas.lineTo( triangle.c.screenX(), triangle.c.screenY() );
            canvas.lineTo( triangle.a.screenX(), triangle.a.screenY() );

            canvas.closePath();
            canvas.fill();
            canvas.stroke();
        }
        this.sortZ();

        canvas.restore();
    },
    sortZ: function(){
        this.triangles.sort( function(a, b){ return ( b.depth() - a.depth() ); } );
    }
}


/**** Point3D ****/

j3d.Point3D = function( posX, posY, posZ ){
    this.x = posX;
    this.y = posY;
    this.z = posZ;
    this.ox = posX;
    this.oy = posY;
    this.oz = posZ;
    this.centerX = 0;
    this.centerY = 0;
    this.centerZ = 0;

    this.fl = 250;
    this.vpX = 0;
    this.vpY = 0;
};

j3d.Point3D.prototype = {
    setVanishingPoint: function( vpX, vpY ){
        this.vpX = vpX;
        this.vpY = vpY;
    },
    setCenter: function( centerX, centerY, centerZ ){
        this.centerX = centerX;
        this.centerY = centerY;
        this.centerZ = centerZ;
    },
    screenX: function(){
        return this.vpX + this.centerX + this.x * this.getScale();
    },
    screenY: function(){
        return this.vpY + this.centerY + this.y * this.getScale();
    },
    getScale: function(){
  		return this.fl / ( this.fl + this.z + this.centerZ );
    }
};

/**** Triangle ****/

j3d.Triangle = function( pointA, pointB, pointC, color ){
    this.a = pointA;
    this.b = pointB;
    this.c = pointC;
    this.color = color;
    this.light;
};

j3d.Triangle.prototype = {
    depth: function(){
        var posZ = Math.min( this.a.z, this.b.z );
        posZ = Math.min( posZ, this.c.z );
        return posZ;
    },
    isBackFace: function(){
  var cax = this.c.screenX() - this.a.screenX();
  var cay = this.c.screenY() - this.a.screenY();
  var bcx = this.b.screenX() - this.c.screenX();
  var bcy = this.b.screenY() - this.c.screenY();
  return cax * bcy > cay * bcx;
    },
    getAdjustedColor: function(){
        var color = parseInt( '0x'+( this.color.charAt(0) == "#" ? this.color.substring(1) : this.color ) );
        var red = ( color & 0xff0000 ) >> 16;
        var green = ( color & 0x00ff00 ) >> 8;
        var blue = ( color & 0x0000ff );

        var lightFactor = this.getLightFactor();
        red *= lightFactor;
        green *= lightFactor;
        blue *= lightFactor;
        color = red << 16 | green << 8 | blue ;
        return "#" + color.toString(16);
    },
    getLightFactor: function(){
  var ab = new Object();
  ab.x = this.a.x - this.b.x;
  ab.y = this.a.y - this.b.y;
  ab.z = this.a.z - this.b.z;

  var bc = new Object();
  bc.x = this.b.x - this.c.x;
  bc.y = this.b.y - this.c.y;
  bc.z = this.b.z - this.c.z;

  var norm = new Object();
  norm.x = ( ab.y * bc.z ) - ( ab.z * bc.y );
  norm.y = -(( ab.x * bc.z ) - ( ab.z * bc.x ));
  norm.z = ( ab.x * bc.y ) - ( ab.y * bc.x );

  var dotProd = norm.x * this.light.x + norm.y * this.light.y + norm.z * this.light.z;
  var normMag = Math.sqrt( norm.x * norm.x + norm.y * norm.y + norm.z * norm.z );
  var lightMag = Math.sqrt( this.light.x * this.light.x + this.light.y * this.light.y + this.light.z * this.light.z );
  return ( Math.acos(dotProd / (normMag * lightMag)) / Math.PI) * this.light.brightness;
    }
};

/**** Light ****/

j3d.Light = function( posX, posY, posZ, brightness ){
    this.x = -100;
    this.y = -100;
    this.z = -100;
    this.brightness = 1;

    if( arguments[0] ) this.x = posX;
    if( arguments[1] ) this.y = posY;
    if( arguments[2] ) this.z = posZ;
    if( arguments[3] ) this.brightness = brightness;
};

j3d.Light.prototype = {
    setBrightness: function( num ){
  this.brightness = Math.max( num, 0 );
  this.brightness = Math.min( this.brightness, 1 );
    }
};
