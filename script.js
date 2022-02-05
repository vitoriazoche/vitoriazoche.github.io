// Silly take on this week's #CodePenChallenge - 500: Internal Server Error
// Coded and designed with a lot of free time
//
//	To Do:
//	- handle window resizing
//	- tidy the code

window.onload = init();

function init() {
	// Countdown
	var counterContainer = document.getElementById("game-counter");
	var counter = 99;
	counterContainer.innerHTML = counter;
	
	// Max number of bugs on screen at a time
	var maxBugs = 5;
	// Store each obj here for easy Hit Check
	var bugs = [];
	
	// Viewport/Viewbox dimensions
	var viewBox = document.getElementById("game-canvas");
	var viewBoxWidth = viewBox.clientWidth,
		viewBoxHeight = viewBox.clientHeight;
	
	// THE DEADLY WEAPON
	var slipper = document.getElementById("slipper"),				// Target the whole slipper drawing (slipper + shadow)
		slipperShadow = document.getElementById("slipper-shadow"),	// Only the shadow
		slipperBody = document.getElementById("slipper-body"),		// Only the slipper
    slipperWidth = slipperBody.getBoundingClientRect().width,
		slipperHeight = slipperBody.getBoundingClientRect().height,
		slipperOffsetX = slipper.getBoundingClientRect().width - slipperWidth,		// slipper-body offsets relative to the whole svg
		slipperOffsetY = slipper.getBoundingClientRect().height - slipperHeight;
	
	// Track mouse to move the deadly weapon around
	viewBox.addEventListener("mousemove", mouseMoveHandler);
	// Click behaviour
	viewBox.addEventListener("mousedown", mouseDownHandler);
	viewBox.addEventListener("mouseup", mouseUpHandler);
	
	// Bug Constructor
	function Bug(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.delay = Math.random()*4;
		this.timeoutID = undefined;
		this.deg = function() {return ((Math.atan((this.y2 - this.y1)/(this.x2 - this.x1))) + ((this.x2 - this.x1)/Math.abs(this.x2 - this.x1))*Math.PI/2) * 180/Math.PI;};
		this.t = function() {return (Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2))/this.v);};
	}
	Bug.prototype.v = 350;			// Bug velocity
	// Bug.prototype.height = 26;	// Currently setting size via CSS 
	Bug.prototype.draw = function() {
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.svg = svg;
		svg.setAttribute("viewBox", "0 0 36 33");
		// svg.setAttribute("height", this.height + "px");	// Currently setting size via CSS
		svg.classList.add("bug");
		svg.innerHTML = "<path id='bug-shadow' style='fill:#000000;fill-opacity:.5' d='m27 17c0 10-7 16-9 16-3 0-8-6-8-16 0-9.2 2-17 8-17 7-0.24 9 7.6 9 17z'/><g id='bug-legs' style='fill:#000000;fill-opacity:.5;stroke:#fff;stroke-width:2;stroke-linecap:round;'><path id='leg1' class='leg' d='m11 13c-3.3-3.6-6.3-3.6-9.9-4'/><path id='leg2' class='leg' d='m23 13c4-3.7 7-3.7 11-4.1'/><path id='leg3' class='leg' d='m11 17c-4.8-2-6.8-1-11 0'/><path id='leg4' class='leg' d='m24 17c5-2 7-1 11 0'/><path id='leg5' class='leg' d='m12 21c-5.2 1-7.2 3-10 7'/><path id='leg6' class='leg' d='m23 21c5 1 7 3 10 7'/></g><path id='bug-body' style='fill:#fff;stroke:none;' d='m25 18c0 9-5 15-7 15-3 0-8.8-6-8.9-15 0-9.5 1.9-17 8.9-17 6 0.1 7 7.6 7 17z'/>";
		
		// Append to DOM
		viewBox.appendChild(svg);
		//Set starting coords and move around
		this.set();		// Note: setting coords before appending will work in Chrome but not in FF
		this.crawl();
	};
	Bug.prototype.set = function() {
		TweenLite.set(this.svg, {
			left: this.x1,
			top: this.y1,
			rotation: this.deg()
		});
	};
	Bug.prototype.crawl = function() {
		// When bug reaches its final point, reset its props
		var that = this;
		this.timeoutID = setTimeout(function(){that.update()}, 1000*(that.t() + that.delay));	// Time in ms
		// Move the bug around
		TweenLite.to(this.svg, this.t(), {	// Time in s
			left: this.x2,
			top: this.y2,
			delay: this.delay,
			ease: Power0.easeIn
		});
	};
	Bug.prototype.update = function() {
		// Meh. Can do better
		var coords = getRandomPoints();
		this.x1 = coords[0];
		this.y1 = coords[1];
		this.x2 = coords[2];
		this.y2 = coords[3];
		this.delay = Math.random()*4;
		this.set();
		this.crawl();
	};
	
	// Draw bugs
	for(var i=0; i < maxBugs; i++) {
		var coords = getRandomPoints();
		var bug = new Bug(coords[0], coords[1], coords[2], coords[3]);
		bugs.push(bug);
		bug.draw();
	};
	
	function mouseMoveHandler(e) {
		var mouseX = e.clientX - document.body.getBoundingClientRect().left,	// Calculates mouse coords in the context of game area - body element has a max-width set in CSS for big screens
			mouseY = e.clientY;
		
		var offset = document.getElementById("top-bar").getBoundingClientRect().height;	// Vertical offset to prevent the weapon to move over the topbar
		var newX, newY;
		
		// Limit x
		if(mouseX < slipperWidth/2) {
			newX = 0;
		} else if(mouseX > viewBoxWidth - slipperWidth/2) {
			newX = viewBoxWidth - slipperWidth;
		} else {
			newX = mouseX - slipperWidth/2;
		}
		// Limit y
		if(mouseY < offset + slipperHeight/2) {
			newY = offset - slipperOffsetY;
		} else if(mouseY > viewBoxHeight - slipperHeight/2 - slipperOffsetY) {
			newY = viewBoxHeight - slipperHeight - slipperOffsetY;
		} else {
			newY = mouseY - slipperHeight/2 - slipperOffsetY;
		}
		
		TweenLite.to(slipper, .1, {
			left: newX,
			top: newY
		});
	}
	
	function mouseDownHandler(e) {
		// Slipper animation: move the slipper and its shadow towards each other
		var slipperDx = Math.round(slipperOffsetX/2),
			slipperDy = Math.round(slipperOffsetY/2);
		TweenLite.to(slipperBody, .05, {
			x: slipperDx,
			y: -slipperDy,
			ease: Power2.easeIn
		});
		TweenLite.to(slipperShadow, .05, {
			x: -slipperDx,
			y: slipperDy,
			ease: Power3.easeIn
		});
		checkHit(e);
	}
	
	function mouseUpHandler() {
    // Restore original positions
		TweenLite.to(slipperBody, .1, {
			x: 0,
			y: 0,
			ease: Power2.easeIn
		});
		TweenLite.to(slipperShadow, .1, {
			x: 0,
			y: 0,
			ease: Power3.easeIn
		});
	}
	
	function checkHit(e) {
		if(bugs) {
			var slipperDy = Math.round(slipperOffsetY/2),
				mouseX = e.clientX,
				mouseY = e.clientY - slipperDy;	// account for slipper animation
			
			bugs.forEach(function(b) {
				var bugEl = b.svg;
				var bugX = bugEl.getBoundingClientRect().left,
					bugY = bugEl.getBoundingClientRect().top;
				if((bugX > mouseX - slipperWidth/2) && (bugX < mouseX + slipperWidth/2) && ((bugY > mouseY - slipperHeight/2) && (bugY < mouseY + slipperHeight/2))) {
					clearTimeout(b.timeoutID); 
					b.update();
					updateCounter();
				}
			});
		} else {
			console.log("No bugs here!");
		}
	}
	
	function updateCounter() {
		if(counter > 0) {
			counter--;
			counterContainer.innerHTML = counter;
			animateCounter();
		}
		if(counter == 0) {
			bugs.forEach(function(b) {
				// Stop bugs
				clearTimeout(b.timeoutID);
			});
			showModal("Pheeew! That was exhausting! Thanks to your precious help, we got rid of some nasty bugs. We'll continue working, but in the meantime you can try a refresh!", "ok");
		}
		
		function animateCounter() {
			TweenLite.to(counterContainer, .2, {
				scale: 1.5,
				ease: Power2.easeIn
			});
			TweenLite.to(counterContainer, .2, {
				delay: .2,
				scale: 1,
				ease: Power2.easeIn
			});
		}
	}
	
	// Helper: Returns two random points off screen to be used as parameters when animating bugs
	function getRandomPoints() {
		var coords = [];
		var bugSize = 40;	// WARNING: hardcoded! - should be at least its biggest dimension
		var xMax = viewBoxWidth + bugSize,	
			yMax = viewBoxHeight + bugSize;
		// Define the possible coords in an array to choose from
		var bounds = [[Math.random()*xMax, -bugSize], [-bugSize, Math.random()*yMax], [Math.random()*xMax, yMax], [xMax, Math.random()*yMax]];
			
		var i = 0;
		while(i < 2) {
			var b = Math.floor(Math.random()*bounds.length);
			coords.push(bounds[b]);
			// Remove from options to avoid getting two points along the same border
			bounds.splice(b, 1);
			i++;
		}
		return coords.reduce(function(a,b) {return a.concat(b)});
	}
	
	function showModal(message, cta) {
		var modal = document.createElement("div");
		modal.classList.add("modal");
		modal.innerHTML = "<p>" + message + "</p><button onclick='closeModal(event)'>" + cta + "</button>";
		document.body.appendChild(modal);
	}
}

function closeModal(e) {
	e.preventDefault();
	var modal = e.target.parentNode;
	modal.classList.add("shrink");
	setTimeout(function() {
		modal.remove();
	}, 1000);
}
