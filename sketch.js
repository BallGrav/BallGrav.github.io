let ballx,bally;
let velx,vely;
let maxSpeed = 2;
let speed = 0.05;

let walls;
let scoreBalls;
let holes;
let goal;

let score = 0;

let device = -1;
let level = 0;

function setup() {
  changeLevel(1);
  createCanvas(window.innerWidth,window.innerHeight);
  window.addEventListener("devicemotion", phoneMoved);
  resetPlayer();
}

function draw() {
  background(220);
  
  velx*=0.99;
  vely*=0.99;
  ballx+=velx;
  bally+=vely;
  
  noStroke();
  fill(122, 76, 34);
  rect(20,40,300,280);
  
  walls.forEach(function(wall){
    wall.draw();
    if(wall.isColliding(ballx-8,bally-8,16,16)) {
      uncol = wall.uncollide(ballx-8,bally-8,16,16);
      ballx = uncol[0]+8;
      bally = uncol[1]+8;
    }
  });
  
  stroke(0);
  scoreBalls.forEach(function(ball){
    if(ball.active) {
      ball.draw();
      if(ball.isColliding(ballx,bally,8,8)) {
        ball.active = false;
        score++;
      }
    }
  });
  
  holes.forEach(function(hole){
    hole.draw();
    if(hole.isColliding(ballx,bally,8,8)) {
      score--;
      if(score<0) {
        score = 0;
        changeLevel(-level+1);
      }
      resetPlayer();
    }
  });
  
  if(goal!=null) {
    goal.draw();
    if(goal.isColliding(ballx,bally,8,8)) {
      print(level)
      changeLevel(1);
    }
  }
  
  fill(75);
  circle(ballx,bally,16);
  //text(txt,100,100);
  textSize(20);
  fill(0);
  text("Score: "+score,20,18);
}

function resetPlayer() {
  ballx = 30; bally = 50;
  velx = 0;   vely = 0;
}

function requestMotionPermission() {
  DeviceMotionEvent.requestPermission()
    .then((response) => {
      if (response == "granted") {
        device = 1;
        window.addEventListener("devicemotion", (e) => {
          window.addEventListener("devicemotion", phoneMoved);
        });
      }
    })
    .catch(console.error);
}

function phoneMoved(event) {
  x = event.accelerationIncludingGravity.x;
  y = event.accelerationIncludingGravity.y;
  velx += x*device*speed;
  vely -= y*device*speed;
}

function loadLevel(lvltxt) {
  lvltxt.forEach(function(piece){
    if(piece.includes("new Wall")) {
      walls.push(eval(piece));
    }else if(piece.includes("new ScoreBall")) {
      scoreBalls.push(eval(piece));
    }else if(piece.includes("new Hole")) {
      holes.push(eval(piece));
    }else if(piece.includes("new Goal")) {
      goal = eval(piece);
    }
  });
  resetPlayer();
}

function changeLevel(change) {
  walls = []
  scoreBalls = []
  holes = []
  goal = null;
  level+=change;
  loadStrings("level"+level+".txt",loadLevel);
}

class GameObject {
  constructor(x, y, w, h) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
  }
  
  isColliding(xIn, yIn, rIn) {
    return abs(xIn-this.x)<rIn+this.w && abs(yIn-this.y)<rIn+this.w;
  }
  
  uncollide(xIn, yIn, wIn, hIn) {
    let tmpX,tmpY;
    if(abs(this.x-(xIn+wIn))<abs((this.x+this.w)-xIn)) {
      tmpX = this.x-(xIn+wIn);
    }else {
      tmpX = (this.x+this.w)-xIn;
    }
    if(abs(this.y-(yIn+hIn))<abs((this.y+hIn)-yIn)) {
      tmpY = this.y-(yIn+hIn);
    }else {
      tmpY = (this.y+this.h)-yIn;
    }
    if(abs(tmpX)<abs(tmpY)) {
      xIn+=tmpX;
      velx = 0;
    }else {
      yIn+=tmpY;
      vely = 0;
    }
    return [xIn,yIn];
  }
}

class Wall extends GameObject {
  draw() {
    fill(54, 28, 5);
    rect(this.x,this.y,this.w,this.h);
  }
  
  isColliding(xIn, yIn, wIn, hIn) {
    return xIn+wIn>this.x && xIn<this.x+this.w && yIn+hIn>this.y && yIn<this.y+this.h;
  }
}

class ScoreBall extends GameObject {
  constructor(x, y) {
    super(x,y,4,4);
    this.active = true;
  }
  
  draw() {
    fill(252, 215, 0)
    circle(this.x,this.y,8);
  }
}

class Hole extends GameObject {
  constructor(x, y) {
    super(x,y,1);
  }
  
  draw() {
    fill(0)
    circle(this.x,this.y,16);
  }
}

class Goal extends GameObject {
  constructor(x, y) {
    super(x,y,0);
  }
  
  draw() {
    fill(52, 181, 33)
    circle(this.x,this.y,16);
  }
}
