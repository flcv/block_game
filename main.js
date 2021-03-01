(function(){ "use strict";

var canvas = document.getElementById("canvas1");
var renderer = canvas.getContext("2d");

const CHAR_COLOUR="green";
const CHAR_BODY_SIZE=20;

const SCREEN_W=canvas.width;
const SCREEN_H=canvas.height;
const GAME_FPS=60;

var aDown=false;
var sDown=false;
var wDown=false;
var dDown=false;
var spaceDown=false;
var lArrDown=false;
var rArrDown=false;
var onGround=false;


var blocks=[];
var water=[];
var bullets=[];

class Block {
    constructor(x,y,thick=40,clr=getRandomColour()){
        this.falling=true;
        this.momentum=0.0;
        this.thickness=thick;
        this.br_x1=x; //BR = BOUNDING RECTANGLE
        //this.br_x2=this.br_x1+this.thickness;
        this.br_y1=y;
        //this.br_y2=this.br_y1+this.thickness;
        this.colour = clr;
    }

}

class Character extends Block {
    constructor(x,y){
        super(x,y);
        this.vel=5; //VELOCITY
        this.jumpExp=0.85 //JUMP EXPONENT
        this.momentum=0.0; //MOMENTUM
        this.thickness=20;
    }
}

class Bullet extends Block {
    
}

class Item {}
class Gun extends Item {

}

let char = new Character(300,400);

/*******************/
/* SOURCED FROM STACK OVERFLOW */
function getRandomColour() {
    var letters = '0123456789ABCDEF';
    var colour = '#';
    for(var i = 0; i < 6; i++){
        colour += letters[Math.floor(Math.random() * 16)];
    }
    return colour;
}

/*******************/

document.addEventListener("keydown", (e) => {
    const keyName=e.key.toLowerCase();

    switch(keyName){
        case "w":
            wDown=true;
            break;
        case "s":
            sDown=true;
            break;
        case "a":
            aDown=true;
            break;
        case "d":
            dDown=true;
            break;
        case "ArrowLeft":
            lArrDown=true;
            break;
        case "ArrowRight":
            rArrDown=true;
            break;
        case " ":
            spaceDown=true;
            break;
    }
},false);
document.addEventListener("keyup", (e) => {
    const keyName=e.key.toLowerCase();

    switch(keyName){
        case "w":
            wDown=false;
            break;
        case "s":
            sDown=false;
            break;
        case "a":
            aDown=false;
            break;
        case "d":
            dDown=false;
            break;
        case "ArrowLeft":
            lArrDown=false;
            break;
        case "ArrowRight":
            rArrDown=false;
            break;
        case " ":
            spaceDown=false;
            break;
        case "x":
            generateBlocks("r",10);
            break;
        /*case "z":
            generateLevels();
            break;*/
    }
},false);

function checkCollision(ent,x,y){
    //TWO ENTITIES HAVE BEEN GIVEN
    if(typeof(ent)=="object" && typeof(x)=="object"){
        //console.log("t");
        //RECURSIVELY CHECK ALL br_ VALUES OF ONE OF THE ENTS
        //IF ANY RETURN TRUE (1), THEN RETURN 1, ELSE 0
        if(checkCollision(ent,x.br_x1,x.br_y1) || 
           checkCollision(ent,x.br_x1,(x.br_y1+x.thickness)) ||
           checkCollision(ent,(x.br_x1+x.thickness),x.br_y1) ||
           checkCollision(ent,(x.br_x1+x.thickness),(x.br_y1+x.thickness))){
                return 1;
        } else{ return 0; }
    }
    //A POINT AND ENTITY HAVE BEEN GIVEN
    else if(typeof(x)=="number" && typeof(y)=="number" && typeof(ent)=="object"){
        if(x>=ent.br_x1&&x<=(ent.br_x1+ent.thickness)){
            if(y<=(ent.br_y1+ent.thickness)&&y>=ent.br_y1){
                return 1;
            }  else { return 0; }
        } else { return 0; } //NO COLLISION
    }
}

function drawSquare(x,y,thickness,colour="black"){
    renderer.beginPath();
    renderer.rect(x, y,thickness, thickness); //10,0,Math.PI*2);//
    renderer.fillStyle=colour;
    renderer.fill();
    renderer.closePath();
}

function getInput(){
    if(aDown){
        var canMove=true;
        for(var i in blocks){
            var proposed_x = char.br_x1-char.vel;
            //DETERMINE IF IT WILL COLLIDE WITH A BLOCK WE ARE CURRENTLY COMPARING IT TO
            if(checkCollision(blocks[i],proposed_x,char.br_y1) || checkCollision(blocks[i],proposed_x,char.br_y1+char.thickness-0.5)){
                canMove=false;
                char.br_x1=blocks[i].br_x1+blocks[i].thickness;
                break;
            }
        }
        if(canMove){char.br_x1-=char.vel;}
    }
    /*if(sDown){
        char.br_y1+=char.vel;
    }*/
    if(wDown){
        var canJump=false;
//        if(!char.falling){
        for(var i in blocks){
            if(!checkCollision(blocks[i],char.br_x1+0.5, char.br_y1-(char.vel*char.jumpExp))){
                if(!checkCollision(blocks[i],char.br_x1+char.thickness-0.5,char.br_y1-(char.vel*char.jumpExp))){
                    canJump=true;
                } else {char.br_y1=blocks[i].br_y1+blocks[i].thickness+(char.vel*char.jumpExp);}
            } else {char.br_y1=blocks[i].br_y1+blocks[i].thickness+(char.vel*char.jumpExp);}
        }
        if(canJump){
            char.br_y1-=char.vel*char.jumpExp;
        }
        //      }
    }
    if(dDown){
        var canMove=true;
        for(var i in blocks){
            var proposed_x = char.br_x1+char.thickness+char.vel;
            //DETERMINE IF IT WILL COLLIDE WITH A BLOCK WE ARE CURRENTLY COMPARING IT TO
            if(checkCollision(blocks[i],proposed_x,char.br_y1) || checkCollision(blocks[i],proposed_x,char.br_y1+char.thickness-0.5)){
                canMove=false;
                char.br_x1=blocks[i].br_x1-char.thickness;
                break;
            } 
        }
        if(canMove){char.br_x1+=char.vel;}
    }
    /*if(spaceDown){
        if(onGround){
            console.log("s");
            onGround=false;
            char.momentum+=10;
        }
    }*/
}

function gravity(){
    char.falling=true;
    //CHECK IF THE CHARACTER IS STANDING ON SOMETHING OR FALLING
    for(var i of blocks){
        //CHARACTER "FALL" WILL PUT HIM WITHIN A BLOCK, SO HES STANDING
        if( 
            (checkCollision(i,char.br_x1+0.5,char.br_y1+char.thickness+0.2*Math.abs(0-char.momentum))) ||
            (checkCollision(i,char.br_x1+char.thickness-0.5,char.br_y1+char.thickness+0.2*Math.abs(0-char.momentum)))){
            char.br_y1=i.br_y1-char.thickness;
            char.falling=false;
            char.momentum=0;
        } else {
            char.falling=true;
        }
    }
    if(char.falling){
        char.momentum-=0.5;
        char.br_y1+=0.2*Math.abs(0-char.momentum);
    }

    //BLOCKS

    //GO THROUGH ALL BLOCKS
    for(var i of blocks){
        if(i.falling){ //THIS BLOCK IS FALLING
            for(var j in blocks){ //FOR THIS BLOCK, GO THROUGH THE OTHER BLOCKS
                if(j==blocks.indexOf(i)){ //IF WE HAVE REACHED OUR BLOCK IN QUESTION...
                    //...SKIP, DO NOTHING. NO POINT COMPARING IT TO ITSELF
                } else { //OTHERWISE, DIFFERENT BLOCK, SO...
                    //CREATE AN OBJECT WITH THE SAME PROPERTIES AS OUR SUBJECT BLOCK
                    //BUT WITH br_y1 AT THE PROPOSED VALUE WE WANT TO MOVE IT TO
                    var proposed_y = i.br_y1+=0.2*Math.abs(0-i.momentum);
                    var prototype_obj = { br_x1: i.br_x1,
                                        br_y1: proposed_y,
                                        thickness: i.thickness };

                    //DETERMINE IF IT WILL COLLIDE WITH THE OTHER BLOCK WE ARE CURRENTLY COMPARING IT TO
                    if(checkCollision(blocks[j],prototype_obj)){
                        i.falling=false;
                        i.momentum=0;
                        i.br_y1=blocks[j].br_y1-i.thickness;
                        break; //EXIT LOOP, MOVE ON TO NEXT BLOCK
                    }
                }
            }
            if(i.falling){
                //WILL NOT COLLIDE AND STILL FALLING, SO MOVE THIS BLOCK
                i.momentum-=0.5;
                i.br_y1+=0.2*Math.abs(0-i.momentum);
            }
        }/*
        if(i.falling){ 
            i.momentum-=2;
            i.y+=0.2*Math.abs(0-i.momentum);
        }*/
    }
}

function generateBlocks(x=100,y=560){ //PASS "r" INTO x AND/OR y TO GENERATE RANDOM POSITIONS
    console.log("New block");
    var b1=new Block(x=="r"?Math.round(Math.random()*SCREEN_W):x, y=="r"?10:y);
    blocks.push(b1);
}

function drawBlocks(){
    for(var i of blocks){
        drawSquare(i.br_x1,i.br_y1,i.thickness,i.colour);
    }
}

function pruneBlocks(){
    for(var i of blocks){
        if(i.br_y1>=SCREEN_H || i.br_y1<=(-10)){
            blocks.splice(blocks.indexOf(i),1);
        }
    }
}

//STARTS THE GAME IF THE USER CLICKS WITHIN THE CANVAS
document.addEventListener('mousedown', function(e) {
    let x = e.clientX - canvas.getBoundingClientRect().left
    let y = e.clientY - canvas.getBoundingClientRect().top
    console.log("x: " + x + " y: " + y)
    //START THE GAME IF THIS IS THE FIRST CLICK, AND WITHIN THE BOUNDS OF THE CANVAS
    if((x>=0 && x<=SCREEN_W) && (y>=0 && y<=SCREEN_H)){
        gameStarted=true;
    }
})

/***********************************/
//FROM GROWING WITH THE WEB .COM
const times = [];
let fps;

function refreshLoop() {  
  window.requestAnimationFrame(() => {
    const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;
    if(gameStarted){ //ONLY RENDER IF THE GAME HAS STARTED
        renderer.font="12px Helvetica";
        renderer.fillStyle="#309930"
        renderer.fillText(fps +" FPS",1,11);
    }
    refreshLoop();
  });
}

refreshLoop();

/***********************************/

//SLIGHTLY ADJUSTS POSITIONS OF CHARACTER AND BLOCKS TO IMPROVE COLLISION DETECTION
function posSmoothing(){
    char.br_x1=Math.ceil(char.br_x1);
    char.br_y1=Math.round(char.br_y1);//-0.01;
    /*var i=blocks.length; //COMMENTED OUT OTHERWISE BLOCKS DO NOT "SINK" DOWNWARDS
    while(i--){
        blocks[i].br_x1=Math.ceil(blocks[i].br_x1);
        blocks[i].br_y1=Math.round(blocks[i].br_y1);
    }*/
}


//MAKING A FLOOR
blocks.push(new Block(10,560,780,"#773322"));
blocks[0].falling=false;

//MAKING THE WATER LEVEL
water.push(new Block(0,SCREEN_H-10,SCREEN_W,"rgba(37, 67, 152, 0.85)"));
water[0].falling=false;

var gameStarted=false;
var score=0;
var newScore=0;

function main(){
    if(gameStarted){ //ONLY RUN THE GAME LOOP IF THE PLAYER HAS CLICKED THE SCREEN TO START THE GAME
        
        //console.log(typeof(blocks));
        renderer.clearRect(0,0,SCREEN_W,SCREEN_H); //CLEAR SCREEN
        /*blocks.forEach((i)=>{
            if(checkCollision(i,char)){
                drawSquare(0,0,800,"red");
                //break;
            } else {
                drawSquare(0,0,800,"white");
            }
        });*/
        for(let i of blocks){
            if(checkCollision(i,char.br_x1+0.01,char.br_y1+0.01)){
                drawSquare(0,0,800,"red");
                break;
            } else {
                drawSquare(0,0,800,"white");
            }
            if(i.falling==false && water[0].br_y1<=(SCREEN_H-100)){
                i.br_y1+=0.1;
            }
            if(char.falling==false){char.br_y1+=0.1;}
        }
        drawBlocks();
        drawSquare(char.br_x1,char.br_y1,char.thickness,CHAR_COLOUR);
        gravity();
        getInput();
        //LAZY WAY TO GENERATE 1 BLOCK PER SECOND
        let checkScore = parseInt(score.toString().slice(0));
        if(newScore!=checkScore){ 
            newScore=checkScore;
            generateBlocks("r",10);
        }
        //RISE WATER AND RENDER IT
        if(water[0].br_y1>=(SCREEN_H-100)){
            water[0].br_y1-=0.1;
            water[0].thickness+=0.1;
        }
        drawSquare(water[0].br_x1,water[0].br_y1,water[0].thickness,water[0].colour);
        
        pruneBlocks();
        //posSmoothing(); //PERHAPS HELPS COLLISION DETECTION? HARD TO TELL...

        //PLAYER GETS 1 POINT PER SECOND THAT THEY SURVIVE
        //NOT THE BEST METHOD, SINCE IT DEPENDS ON THE FPS, 
        //BUT IT DOESN'T REALLY NEED TO BE MORE COMPLICATED
        //THAN THIS
        score+=(1/GAME_FPS);
        renderer.font="12px Helvetica";
        renderer.fillStyle="#309930"
        renderer.fillText(Math.floor(score) +" SECONDS ALIVE",1,21);
    } else { //TITLE SCREEN
        renderer.font="120px Helvetica";
        renderer.fillStyle="#000000";
        renderer.fillText("Block Game", 77, 200);
        renderer.font="45px Helvetica";
        renderer.fillText("CLICK TO BEGIN", 220, 450);
    }
}

setInterval(main, 1000/GAME_FPS);

})();