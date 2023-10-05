
let resizeReset = function() {
	w = canvasBody.width = window.innerWidth*2;// высота
	h = canvasBody.height = window.innerHeight*2;// ширина
}

const opts = { 
	particleColor: 'rgb(238, 83, 64)',
	lineColor: 'rgb(255, 255, 255)',
	particleAmount: 15, // количество точек
	defaultSpeed: 1,
	variantSpeed: 1,
	defaultRadius: 4,
	variantRadius: 2,
	linkRadius: 300,
    //sphereCenterX: w/2,
    //sphereCenterY: h/2,
    sphereRad: 500, // радиус
    scale: 2, // масштаб
    sphereCenterZ: -3 - sphereRad,
    rotX: 0, 
    rotZ: 0,
    turnSpeed: 2*Math.PI/4000,
    turnAngle: 0,
    fLen: 320,
    projCenterX: window.innerWidth/2, // центр сферы по оси X
    projCenterY: window.innerHeight, // центр сферы по оси Y
};

window.addEventListener("resize", function(){
	deBouncer();
});

let deBouncer = function() {
    clearTimeout(tid);
    tid = setTimeout(function() {
        resizeReset();
    }, delay);
};

let checkDistance = function(x1, y1, x2, y2){ 
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

let linkPoints = function(point1, hubs){ 
	for (let i = 0; i < hubs.length; i++) {
		let distance = checkDistance(point1.x, point1.y, hubs[i].x, hubs[i].y);
		let opacity = 1 - distance / opts.linkRadius;
		if (opacity > 0) { 
			drawArea.lineWidth = 0.5;
			drawArea.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
			drawArea.beginPath();
			drawArea.moveTo(point1.x, point1.y);
			drawArea.lineTo(hubs[i].x, hubs[i].y);
			drawArea.closePath();
			drawArea.stroke();
		}
	}
}

Particle = function(){ 
    phi = Math.random()*Math.PI
    theta = Math.random()*2*Math.PI
	this.x = opts.projCenterX + opts.sphereRad*Math.sin(phi)*Math.cos(theta)
	this.y = opts.projCenterY + opts.sphereRad*Math.sin(phi)*Math.sin(theta)
    this.z = opts.sphereRad*Math.cos(phi)
    //this.velX = 0.002*x0;
    //this.velY = 0.002*y0;
    //this.velZ = 0.002*z0;
    
	this.speed = opts.defaultSpeed + Math.random() * opts.variantSpeed; 
	opts.turnAngle = (opts.turnAngle + opts.turnSpeed) % (2*Math.PI); 
	this.directionAngle = Math.floor(Math.random() * 360)
    this.color = opts.particleColor;
	this.radius = opts.defaultRadius + Math.random() * opts.variantRadius; 
    //opts.turnAngle = (opts.turnAngle + opts.turnSpeed) % (2*Math.PI);
    sinAngle = Math.sin(opts.defaultRadius);
    cosAngle = Math.cos(opts.defaultRadius);
    rotX =  cosAngle*this.x + sinAngle*(this.z - opts.sphereCenterZ);
    rotZ =  -sinAngle*this.x + cosAngle*(this.z - opts.sphereCenterZ) + opts.sphereCenterZ;
    m = opts.scale * opts.fLen/(opts.fLen - opts.rotZ);
    this.projX = rotX*m + opts.projCenterX;
    this.projY = this.y*m + opts.projCenterY;
	this.vector = {
		x: Math.cos(this.directionAngle) * (this.speed + rotX),
		y: Math.sin(this.directionAngle) * this.speed,
        z: opts.sphereRad*Math.cos(phi) + opts.sphereCenterZ
	};
	this.update = function(){ 
		this.border(); 
		this.x += this.vector.x/100; 
		this.y += this.vector.y; 
        this.z += this.vector.z
	};
	this.border = function(){ 
		if (this.x >= opts.projCenterX || this.x <= 0) { 
			this.vector.x *= -1;
		}
		if (this.y >= opts.projCenterY || this.y <= 0) {
			this.vector.y *= -1;
		}
		if (this.x > opts.projCenterX) this.x = opts.projCenterX;
		if (this.y > opts.projCenterY) this.y = opts.projCenterY;
		if (this.x < 0) this.x = 0;
		if (this.y < 0) this.y = 0;	
	};
	this.draw = function(){ 
		drawArea.beginPath();
		drawArea.arc(this.x, this.y, this.radius, 0, Math.PI*2);
		drawArea.closePath();
		drawArea.fillStyle = this.color;
		drawArea.fill();
	};
};

function setup(){ 
	particles = [];
	resizeReset();
	for (let i = 0; i < opts.particleAmount; i++){
		particles.push( new Particle() );
	}
	window.requestAnimationFrame(loop);
}

function loop(){ 
	window.requestAnimationFrame(loop);
	drawArea.clearRect(0,0,w,h);
	for (let i = 0; i < particles.length; i++){
		particles[i].update();
		particles[i].draw();
	}
	for (let i = 0; i < particles.length; i++){
		linkPoints(particles[i], particles);
	}
}

const canvasBody = document.getElementById("canvas"),
drawArea = canvasBody.getContext("2d");
let delay = 200, tid,
rgb = opts.lineColor.match(/\d+/g);
resizeReset();
setup();