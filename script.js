//Cashed elements
const canvas = document.getElementById("game_canvas");
const ctx = canvas.getContext("2d");

const canvas2 = document.getElementById("game_canvas_2");
const ctx2 = canvas2.getContext("2d");

const playerLives = document.getElementById("playerLives");
const sonicLives = document.getElementById("sonicLives");
const gameState = document.getElementById("gameState")
const startStop = document.getElementById("startStop");
const overlay = document.getElementById("container");
const multiplayerButton = document.getElementById("multiplayer");
const gameStateMenu = document.getElementById("gameStateMenu");
const muteButton = document.getElementById("muteButton");

const jumpSound = "audio/jump.mp3"
const shootSound = "audio/shoot.mp3"
const ouch = "audio/ouch.mp3"
const healthGain = "audio/healthGain.mp3"
const kiss = "audio/kiss2.mp3"
const win = new Audio("audio/win.mp3")
const win2 = new Audio("audio/win2.mp3")
const music = new Audio("audio/music2.mp3")
music.loop = true;


let sounds = []
sounds.push(music);
sounds.push(win);

let touchscreen = false;
const mobileButtons = document.getElementById("mobileButtons")
const jumpButton = document.getElementById("jumpButton");
const leftButton = document.getElementById("leftButton");
const shootButton = document.getElementById("shootButton");
const rightButton = document.getElementById("rightButton");

const imgCache = {
    "goomba" : new Image(),
    "robot" : new Image(),
    "flyer": new Image(),
    "flyerRight" : new Image(),
    "flyerJump" : new Image(),
    "flyerJumpRight" : new Image(),
    
}
imgCache.goomba.src = "images/enemy.webp";
imgCache.robot.src = "images/enemy2.png";
imgCache.flyer.src = "images/frog-left.png";
imgCache["flyerRight"].src = "images/frog.png";
imgCache["flyerJump"].src = "images/frog-jumping-left.png";
imgCache["flyerJumpRight"].src = "images/frog-jumping.png"
const buttons = new Map([
    ["jumpButton", "ArrowUp"],
    ["leftButton", "ArrowLeft"],
    ["shootButton", "ArrowDown"],
    ["rightButton", "ArrowRight"]
])

if(window.matchMedia("(pointer:coarse)").matches){
    touchscreen = true;
}

//stop phones from bringing up context menu when you hold on an image
document.addEventListener('contextmenu', function(event) {
    event.preventDefault(); // Prevent the context menu globally
});

document.addEventListener("mousedown", event => {
    setButton(event.target.parentElement, true)
})
document.addEventListener("mouseup", event => {
    setButton(event.target.parentElement, false)
    console.log(event.target)
})
document.addEventListener("touchstart", event => {
    event.preventDefault();
    setButton(event.target.parentElement, true)
})
document.addEventListener("touchend", event => {
    setButton(event.target.parentElement, false)
})
function setButton(button, value){
    keys[buttons.get(button.id)] = value;
    if(button.id === "jumpButton"){
        if(value === true && !keyWasPressed.ArrowUp){
            jump(player)
        }
        else if(value === false){
            keyWasPressed.ArrowUp = false;
            player.hasGravity = true;
        }
    }
    if(button.id === "shootButton"){
        if(value === true && !keyWasPressed.ArrowDown){
            if(!machineGuns){
                keyWasPressed.ArrowDown = true;
            }
            shootBullet(player);
        }
        else if(value === false){
            keyWasPressed.ArrowDown = false;
        }
    }
}

//Menu buttons
if(!startScreen){
    window.onload = function(){
        setSprites();
        gameLoop();
        overlay.classList.remove("paused");
        if(touchscreen){
            mobileButtons.style.display = "grid"
            goFullscreen();
        }
        if(!muted){
            music.play()
        }
        
    }
    
}
else{
    startStop.addEventListener("click", function(){
        setSprites();
        gameLoop();
        overlay.classList.remove("paused");
        if(touchscreen){
            mobileButtons.style.display = "grid";
            goFullscreen();
        }
        if(!muted){
            music.play()
        }
    })
}

multiplayerButton.addEventListener("click", function(){
    if(!multiplayer){
        multiplayer = true;
        multiplayerButton.innerText = "Multiplayer: On"
    }
    else{
        multiplayer = false;
        multiplayerButton.innerText = "Multiplayer: Off"
    }
});

restart.addEventListener("click", function(event){
    if(restart.innerText === "Restart"){
        setSprites();
    }
    else{
        level ++;
        setSprites();
    }
});

muteButton.addEventListener("click", function(){
    if(!muted){
        muted = true;
        pauseAudio()
        muteButton.innerText = "Sound: Off";
    }
    else{
        muted = false;
        music.play();
        muteButton.innerText = "Sound: On"
    }
});

//Create sprites
let sprites = [];

function createSprite(posX, posY, width, height, type = ""){
    return {
        "x" : posX,
        "y" : posY,
        "width" : width, 
        "height" : height,
        "animation" : new Image(),
        "velocityX" : 0, 
        "velocityY" : 0,
        "jumpCount" : 2,
        "facing": "right", 
        "facingY" : "down",
        "deleted": false,
        "takesDamage": false,
        "hasGravity" : false,
        "bouncedOn" : false,
        "lives" : 3,
        "visible" : true,
        "type" : type,
        "distanceX" : 1, //A value from 1 to 0 - determines how much the sprite's position changes during camera movement
        "distanceY" : 1, //A smaller value means the object moves slower than the camera, giving a feeling of distance
        "touchingGround" : false,
        "bounciness" : 0, //A value from 0 to 1 - determines how much velocity is returned when the sprite and ground collide
        "mode" : "default", //Changed when player goes through portal
        "isTouching" : {},
        "spike" : {
            "direction" : "up"
        },
        "boundingBox" : {
            "used" : false,
            "type" : "rect",
            "width" : null,
            "height" : null,
            "triangle" : [],
        },
        "spriteSheet" : { 
            "used" : false,
            "x" : 0, 
            "y" : 0,
            "width" : 0,
            "height" : 0,
            "margin" : 0,
            "currentFrame" : 0,
            "frameRate" : 0,
        },
        "bullet" : {
            "firedFrom" : ""
        },
        "enemy" : ""
    };
}

//create groups
function createSpriteGroup(list, animationSource){
    for(i=0; i < list.length; i++){
        sprites.push(list[i])
        if(animationSource !== undefined){
            list[i].animation.src = animationSource;
        }
    }
}

//Sprite animation
function animateSprite(sprite, startFrame, endFrame){
    if(sprite.spriteSheet.currentFrame < sprite.spriteSheet.frameRate){
        sprite.spriteSheet.currentFrame ++
    }
    else {
        sprite.spriteSheet.currentFrame = 0
        if(sprite.spriteSheet.x < startFrame || sprite.spriteSheet.x > endFrame){
            sprite.spriteSheet.x = startFrame;
        }
        else{
            sprite.spriteSheet.x ++;
        }
    }
}

let sky = createSprite(0,0, canvas.width, canvas.height);
let skyRatio = 0;
let sky2 = createSprite(0,0,canvas2.width, canvas2.height)

let player = createSprite(150, 150, 50, 100, "player");
let sonic = createSprite(250, 150, 100, 100, "sonic");

let portals = [];

let grounds = [];
let enemies = [];
let enemyTypes = [];

let spikes = [];

let bullets = [];

let endPoint = createSprite(0, 0, 0, 0);

let flyerCount = 0;
let enemyCount = 0;

function setSprites(){


    music.src = "audio/music" + level + ".mp3"
    if(!muted){
        music.play();
    }
    playerLives.style.display = "block";
    if(multiplayer){
        sonicLives.style.display = "block"
    }
    music.currentTime = 0;
    gameStateMenu.style.display = "none";

    sprites = [];



    //Skies
    let skyData = levels[level].sky;

    sky = createSprite(0,0, canvas.width, canvas.height)
    sky.animation.src = skyData.src;

    sprites.push(sky);
    
    sky2 = createSprite(0,0,canvas2.width, canvas2.height)
    sky2.animation.src = skyData.src;
    sprites.push(sky2);

    sky.animation.onload = function(){
        skyRatio = sky.animation.width / sky.animation.height;
        sky.width = canvas.height * skyRatio;
        sky2.width = canvas2.height * skyRatio;
        resizeCanvas()
    }

    let distantObject = createSprite(0, -300, 3000, 600);
    distantObject.distanceX = 0.7;
    distantObject.animation.src = "images/mountain.webp"
    //sprites.push(distantObject);

    let tree2 = createSprite(670, 150, 100, 100)
    tree2.animation.src = "images/tree5.png";
    tree2.distanceX = 0.83;
    //sprites.push(tree2);


    let tree = createSprite(800, 100, 150, 150)
    tree.animation.src = "images/tree.png";
    tree.distanceX = 0.86;
    //sprites.push(tree);

    //portals
    portals = [];
    let portalData = levels[level].portals;
    for(let i=0; i<portalData.length; i++){
        createPortal(portalData[i][0], portalData[i][1], portalData[i][2], portalData[i][3], portalData[i][4])
    }

    //Players
    player = createSprite(150, 150, 50, 100, "player");
    sprites.push(player);
    player.animation.src = "images/braden-sprite-sheet.png";
    playerLives.innerText = "Lives: 3"

    player.spriteSheet.used = true;
    player.spriteSheet.x = 2;
    player.spriteSheet.y = 0;
    player.spriteSheet.width = 300;
    player.spriteSheet.height = 823;
    player.spriteSheet.margin = 0;
    player.spriteSheet.frameRate = 5;
    player.takesDamage = true;
    player.hasGravity = true;

    //Sonic
    sonic = createSprite(250, 150, 100, 100, "sonic");
    sonic.animation.src = "images/sonic.png"
    sonic.takesDamage = true;
    sonic.hasGravity = true;
    sprites.push(sonic);
    sonicLives.innerText = "Lives: 3"

    //grounds
    grounds = [];
    let groundData = levels[level].grounds

    for(i=0; i<10; i++){
        createGround(i * 300, 250, 300, 150);
    }
    for(let i=0; i<groundData.length; i++){
        createGround(groundData[i][0], groundData[i][1], groundData[i][2], groundData[i][3])
    }
    
    createSpriteGroup(grounds, "images/ground.png");

    //spikes
    spikes = [];

    let spikeData = levels[level].spikes;
    for(let i=0; i<spikeData.length; i++){
        createSpike(spikeData[i][0], spikeData[i][1], spikeData[i][2], spikeData[i][3], spikeData[i][4])
    }

    //Enemies
    enemies = []
    enemyTypes = levels[level].enemyTypes
    let enemyData = levels[level].enemies

    for(let i=0; i<enemyData.length; i++){
        createEnemy(enemyData[i][0], enemyData[i][1], enemyData[i][2], enemyData[i][3], enemyData[i][4])
    }
    
    //bullets
    bullets = [];

    //create end point for level
    let endPointData = levels[level].endPoint
    endPoint = createSprite(endPointData[0], endPointData[1], endPointData[2], endPointData[3]);
    endPoint.animation.src = "images/santas-sleigh.png";
    sprites.push(endPoint);
}

function createGround(x, y, width, height){
    let w = width;
    let h = height;
    if(w === undefined){
        w = 100;
    }
    if(h === undefined){
        h = 75;
    }
    let newGround = (createSprite(x, y, w, h));
    newGround.animation.src = "images/ground.png"
    newGround.type = "ground"
    sprites.push(newGround);
    grounds.push(newGround);
}

function createPortal(x, y, width, height, mode = "flying"){
    let newPortal = createSprite(x,y,width,height);
    newPortal.animation.src = "images/portal-red.png";
    newPortal.mode = mode
    newPortal.type = "portal"
    sprites.push(newPortal);
    portals.push(newPortal);
}

function portalLoop(sprite){
    if(isTouching(sprite, player)){
        console.log(sprite.mode)
        if(player.mode !== sprite.mode){
            playAudio(healthGain);
            player.mode = sprite.mode;
        }
    }
    if(isTouching(sprite, sonic)){
        console.log(sprite.mode)
        if(sonic.mode !== sprite.mode){
            playAudio(healthGain);
            sonic.mode = sprite.mode;
        }
    }
}

function createSpike(x, y, direction = "up", width = 50, height = 50){
    let newSpike = createSprite(x, y, width, height, "spike");
    if(direction === "up"){
        newSpike.animation.src = "images/spike3.png";
    }
    else{
        newSpike.animation.src = "images/spike3-down.png";
        newSpike.spike.direction = "down"
    }
    sprites.push(newSpike);
    spikes.push(newSpike);
}

const enemySkins = {
    "goomba" : "images/enemy.webp",
    "robot" : "images/enemy2.png"
}

//enemies
function createEnemy(x, y, width = 50, height = 50, enemyType = "goomba"){
    let newEnemy = createSprite(x, y, width, height, "enemy");

    enemies.push(newEnemy);
    newEnemy.takesDamage = true;
    if(enemyType !== "ghost" && enemyType !== "flyer"){
        newEnemy.hasGravity = true;
    }
    
    // if(enemyType === "goomba"){
        newEnemy.velocityX  = enemySpeed;
    // }
    sprites.push(newEnemy);
    if(newEnemy.width <= 50){
        newEnemy.lives = 1;
    }
    else{
        newEnemy.lives = Math.floor(newEnemy.width / 50) * 2;
    }
    newEnemy.animation = imgCache[enemyType];
    newEnemy.enemy = {
        "type" : enemyType
    }
    return newEnemy;
}

function enemyLoop(sprite){
    if(isInBounds(sprite) && sprite.visible === true){
        if(isTouching(sprite, player) && !sprite.deleted){
            mutualCollide(player, sprite, 1);
            if(sprite.bouncedOn){
                sprite.deleted = true;
            }
            else if(sprite.enemy.type === "flyer"){
                if(player.bouncedOn){
                    player.lives --;
                    playerLives.innerText = "Lives: " + player.lives
                    playAudio(ouch);
                }
                else{
                    player.lives ++;
                    playerLives.innerText = "Lives: " + player.lives
                    playAudio(kiss);
                }
            }
            else if(sprite.enemy.type === "goomba"){
                player.lives --;
                playerLives.innerText = "Lives: " + player.lives;
                sprite.deleted = true;
                playAudio(ouch)
            }
        }

        else if(isTouching(sprite, sonic)){
            mutualCollide(sonic, sprite, 1);
            if(sprite.bouncedOn){
                sprite.deleted = true;  
            }
            else if(sprite.enemy.type === "flyer"){
                if(sonic.bouncedOn){
                    sonic.lives --;
                    sonicLives.innerText = "Lives: " + sonic.lives
                    playAudio(ouch)
                }
                else{
                    sonic.lives ++;
                    sonicLives.innerText = "Lives: " + sonic.lives
                    playAudio(kiss);
                }
            }
            else if(sprite.enemy.type === "goomba"){
                sonic.lives --;
                sonicLives.innerText = "Lives: " + sonic.lives;
                sprite.deleted = true;
                playAudio(ouch)

            }
        }
        if(!isTouching(sprite, player && !isTouching(sprite, sonic))){
            if(Math.abs(sprite.velocityX !== 3) && sprite.enemy.type !== "flyer"){
                sprite.velocityX = -3;
            }
        }

        if(sprite.enemy.type === "robot" && isInBounds(sprite)){
            if(getRandomNumber(1, robotShootRate) === 1){
                if(player.x < sprite.x){
                    sprite.facing = "left"
                }
                else{
                    sprite.facing = "right"
                }
                shootBullet(sprite)
            }
        }

        else if(sprite.enemy.type === "flyer"){
            if(player.x < sprite.x){
                if(sprite.velocityX > 0){
                    if(sprite.isTouchingGround){
                        sprite.velocityX = Math.abs(sprite.velocityX) * -1
                    }
                }
                if(Math.abs(sprite.velocityX) < maxSpeed){
                    sprite.velocityX -= acceleration * 0.9;
                }
                
                sprite.facing = "left";
            }
            else if(player.x > sprite.x){
                if(sprite.velocityX < 0){
                    if(sprite.isTouchingGround){
                        sprite.velocityX = Math.abs(sprite.velocityX)
                    }
                    
                }
                if(Math.abs(sprite.velocityX) < maxSpeed){
                    sprite.velocityX += acceleration * 0.9;
                }
                sprite.facing = "right"
            }
            else{
                sprite.velocityX = 0;
            }
            if(!isNextToGround(sprite, 0, true, false)){
                sprite.velocityX = sprite.velocityX * -1;
                
            }
           
            if(isTouchingGround(sprite)){
                sprite.isTouchingGround = true;
                for(let i=0; i<grounds.length; i++){
                    collide(sprite, grounds[i])
                } 
                sprite.velocityY = 0;
                if(sprite.x > player.x){
                    sprite.animation = imgCache.flyer
                }
                else{
                    sprite.animation = imgCache.flyerRight
                }
            }
            if(sprite.isTouchingGround){
                for(let i=0; i<grounds.length; i++){
                    collide(sprite, grounds[i])
                } 
                sprite.velocityY = 0;
                if(getRandomNumber(1,10) === 1){
                    //sprite.velocityY = -1 * sprite.velocityY
                    sprite.y -= 2;
                    sprite.velocityY = -1 * getRandomNumber(25, 35);
                    sprite.isTouchingGround = false;
                    if(sprite.x > player.x){
                        sprite.animation = imgCache.flyerJump
                    }
                    else{
                        sprite.animation = imgCache.flyerJumpRight
                    }
                }
            }
            else{
                sprite.velocityY += gravity;
            }
        }
        if(!isNextToGround(sprite) && sprite.enemy.type !== "flyer"){
            sprite.velocityX = sprite.velocityX * -1;
        }
    }
    else if(sprite.enemy.type === "ghost"){
        let thresholdX = Math.abs(player.x - sprite.x);
        let thresholdY = Math.abs(player.y - sprite.y)

        if(thresholdX > player.width){
            if(player.x < sprite.x){
                sprite.velocityX -= acceleration;
            }
            else if(player.x > sprite.x){
                if(sprite.velocityX < 0){
                    sprite.velocityX = Math.abs(acceleration)
                }
                sprite.velocityX += acceleration;
                
            }
        }
        else{
            sprite.velocityX = 0
        }
        if(thresholdY > player.height) {
            if(player.y - player.height < sprite.y){
                // sprite.velocityY -= acceleration;
                 //sprite.velocityY = -3;
                 sprite.velocityY = -3;
             }
            else if(player.y > sprite.y){
                //sprite.velocityY += acceleration;
                sprite.velocityY = 3;
            }
            
        }
        else{
            if(getRandomNumber(0,1000) === 1){
                sprite.velocityY = -1 * sprite.velocityY
            }
            // if(getRandomNumber(0,100) === 1){
            //     sprite.velocityY = 3
            // }
        }
        if(sprite.y + sprite.height > 250){
            sprite.velocityY = -1 * sprite.velocityY
        }
        
        
    }
    else{
        sprite.velocityX = 0;
    }


}

function bulletLoop(bullet){
    if(isInBounds(bullet)){
        for(let j=0; j<sprites.length; j++){
            if(isTouching(bullet, sprites[j]) && sprites[j].takesDamage){
                if(bullet.bullet.firedFrom !== sprites[j]){
                    sprites[j].lives -= 1;
                    bullet.deleted = true;
                    if(sprites[j] === player || sprites[j] === sonic){
                        playAudio(ouch);
                        if(sprites[j] === player){
                            playerLives.innerText = "Lives: " + player.lives;
                        }
                        else{
                            sonicLives.innerText = "Lives: " + sonic.lives;
                        }
                    }
                }  
            }
        }
    }
    else{
        bullet.deleted = true;
    }
}

function spikeLoop(spike){
    let spikeCenter = spike.x + spike.width / 2;
    if(isTouching(spike, player)){
        if(spike.spike.direction === "up"){
            if(player.x < spikeCenter && player.x + player.width > spikeCenter){
                player.lives --;
                playAudio(ouch);
                playerLives.innerText = "Lives: " + player.lives;
            }
            else{
                player.velocityY += gravity;
            }
            if(player.x > spike.x){
                if(!keys.ArrowUp){
                    player.y = (spike.y - player.height) + (player.x - spike.x);
                    player.velocityY = 0;
                }
                if(player.velocityY > 0){
                    
                }
                player.velocityX = acceleration * 3;
            }
            else {
                if(!keys.ArrowUp){
                    player.y = (spike.y - player.height) + Math.abs(player.x - spike.x) //+ player.width / 2;
                    player.velocityY = 0;
                }
                if(player.velocityY > 0){
                    
                }
                player.velocityX = -acceleration * 3;
    
            }
        }
        else{
            if(player.x < spikeCenter && player.x + player.width > spikeCenter){
                player.lives --;
                playAudio(ouch);
                playerLives.innerText = "Lives: " + player.lives;
            }
            else{
                player.velocityY -= gravity;
            }
            if(player.x > spike.x){
                if(!keys.ArrowUp){
                    player.y = spike.y //- (player.x - spike.x);
                    player.velocityY = 0;
                }
                if(player.velocityY > 0){
                    
                }
                player.velocityX = acceleration * 3;
            }
            else {
                if(!keys.ArrowUp){
                    player.y = spike.y// - Math.abs(player.x - spike.x) //+ player.width / 2;
                    player.velocityY = 0;
                }
                if(player.velocityY > 0){
                    
                }
                player.velocityX = -acceleration * 3;
    
            }
        }
        
    }

    if(isTouching(spike, sonic)){
        if(sonic.x < spikeCenter && sonic.x + sonic.width > spikeCenter){
            sonic.lives --;
            playAudio(ouch);
            sonicLives.innerText = "Lives: " + sonic.lives;
        }
        else{
            sonic.velocityY += gravity;
        }
        if(sonic.x > spike.x){
            if(!keys.w){
                sonic.y = (spike.y - sonic.height) + (sonic.x - spike.x);
            }
            if(sonic.velocityY > 0){
                sonic.velocityY = 0;
            }
            sonic.velocityX += acceleration * 2;
        }
        else {
            if(!keys.w){
                sonic.y = (spike.y - sonic.height) + Math.abs(sonic.x - spike.x) + sonic.width / 2;
            }
            if(sonic.velocityY > 0){
                sonic.velocityY = 0;
            }
            sonic.velocityX -= acceleration * 2;

        }
    }
    for(let i=0; i<enemies.length; i++){
        collide(enemies[i], spike);
    }
    
}

let keys = {};

let keyWasPressed = {}

//To check if key down and/or key went down
window.addEventListener("keydown", (event) => {
    if(event.key === "ArrowUp" && !keyWasPressed.ArrowUp){
        
        jump(player)
    }
    if(event.key === "w" && !keyWasPressed.w){
        jump(sonic)
    }
    if(event.key === "ArrowDown" && !keyWasPressed.ArrowDown){
        if(!machineGuns){
            keyWasPressed.ArrowDown = true;
        }
        shootBullet(player);
    }
    if(event.key === "s" && !keyWasPressed.s){
        if(!machineGuns){
            keyWasPressed.s = true;
        }
        shootBullet(sonic);
    }

    keys[event.key] = true;

});
window.addEventListener("keyup", function(event){
    if(event.key === "ArrowUp"){
        keyWasPressed.ArrowUp = false;
        if(player.mode === "flying"){
            player.hasGravity = true;
        }
        
    }
    if(event.key === "w"){
        keyWasPressed.w = false;
        if(sonic.mode === "flying"){
            sonic.hasGravity = true;
        }
        
    }
    if(event.key === "ArrowDown"){
        keyWasPressed.ArrowDown = false;
    }
    if(event.key === "s"){
        keyWasPressed.s = false;
    }
    keys[event.key] = false;
})


//Camera Logic
let splitScreen = false;
let playerSide = "left";

let camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height, 
    smoothness : 0.1
};

let camera2 = {
    x: 0,
    y: 0,
    width: canvas2.width,
    height: canvas2.height, 
    smoothness : 0.1
};

function lerp(start, end, t){
    return start + (end - start) * t;
}

//used if you want the camera to only be pushed when the player goes beyond a certain threshold
function pushCamera(sprite){ //if the player is past the camera border, push the camera
    //left/right
    if(sprite.x + sprite.width > targetX + (camera.width - cameraBorder) || sprite.x < targetX + cameraBorder){
        targetX += sprite.velocityX;
    }
    //up/down
    if(sprite.y + sprite.height > targetY + (camera.height - cameraBorder) || sprite.y < targetY + cameraBorder){
        if((sprite.velocityY === 1.7) && isTouchingGround(sprite)){
            targetY += sprite.velocityY - 1.7;
        }
        else{
            targetY += sprite.velocityY;
        }
    }
}

if(multiplayer){
    let targetX = (player.x + sonic.x) / 2 - camera.width / 2;  // Center the camera on the player (horizontal)
    let targetY = (player.y + sonic.y) / 2 - camera.height / 2 ; // Center the camera on the player (vertical)  

    let targetX2 = sonic.x - camera2.width / 2;
    let targetY2 = sonic.y - camera2.height / 2
}
else{
    let targetX = player.x - camera.width / 2;  // Center the camera on the player (horizontal)
    let targetY = player.y - camera.height / 2 ; // Center the camera on the player (vertical)    
}

//Control camera transition between split screen and fullscreen
let transitionProgress = 1;
let transitioning = false;

function startTransition(){
    transitioning = true;
    transitionProgress = 0;
}

function updateTransition(){
    if(transitioning){
        transitionProgress += 0.07;
        if(transitionProgress >= 2){
            transitionProgress = 1;
            transitioning = false;
        }
    }
}

//Update the canvas width and height to maintain a proper aspect ratio
function resizeCanvas(){
    
    canvas.width = window.innerWidth / zoom;
    canvas.height = window.innerHeight / zoom;

    camera.width = canvas.width;
    camera.height = canvas.height;

    let canvasRatio = canvas.width / canvas.height;

    if(skyRatio > canvasRatio){
        sky.width = canvas.height * skyRatio;
        sky.height = canvas.height;

        sky2.width = canvas2.width;
        sky2.height = canvas2.height;
    }
    else{
        sky.width = canvas.width;
        sky.height = canvas.width / skyRatio;

        sky2.width = canvas2.width;
        sky2.height = canvas2.height;
    }

    // sky.x = canvas.x - (canvas.width / 2)
    // sky2.x = canvas2.x - (canvas2.width / 2)


    canvas2.width = window.innerWidth / zoom;
    canvas2.height = window.innerHeight / zoom;

    camera2.width = canvas.width;
    camera2.height = canvas2.height;

     
     drawSprites()
     
}

resizeCanvas();

window.addEventListener("resize", function(){
    resizeCanvas();
})

function goFullscreen() {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen(); // For older webkit browsers
    } else if (canvas.mozRequestFullscreen) {
      canvas.mozRequestFullscreen(); // For older Mozilla browsers
    }
  }

function updateCamera(){
    //Decide whether to use split screen
    //if((isTouchingGround(player) && isTouchingGround(sonic)) || isTouching(player, sonic)){ //Only disable splitScreen if players are touching ground to prevent screen from jittering when player jumps
        if(Math.abs(player.x - sonic.x) < camera.width - 100 && Math.abs(player.y - sonic.y) < camera.height -100){ //If the distance between players is closer than screen
            if(splitScreen){
                splitScreen = false;
                startTransition();
            }
        }
        else if((player.deleted || sonic.deleted) && splitScreen){
            splitScreen = false;
            startTransition();
        }
        else if(!splitScreen && !(player.deleted || sonic.deleted)){
            splitScreen = true;
            startTransition();
            if(player.x < sonic.x){
                playerSide = "left";
            }
            else{
                playerSide = "right";
            }
        }
    //}

    //Update the camera
    if(player.deleted && sonic.deleted){ //Game over logic
        gameStateMenu.style.display = "block";
        gameState.innerText = "Game Over!"
        restart.innerText = "Restart"
    }
    else if(sonic.deleted){
        targetX = player.x - camera.width / 2;  // Center the camera on the player (horizontal)
        targetY = player.y - camera.height / 2 + cameraOffsetY; // Center the camera on the player (vertical)    

        camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
        camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

        canvas2.classList.remove("visible");
        canvas.style.gridColumn = "1/7"
    }
    else if(player.deleted){
        targetX = sonic.x - camera.width / 2;  // Center the camera on the player (horizontal)
        targetY = sonic.y - camera.height / 2 + cameraOffsetY ; // Center the camera on the player (vertical)    

        camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
        camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

        canvas2.classList.remove("visible");
        canvas.style.gridColumn = "1/7"
    }
    else if(!splitScreen){


        targetY = (player.y + sonic.y) / 2 - camera.height / 2  + cameraOffsetY
        targetX = (player.x + sonic.x) / 2 - camera.width / 2;  // Center the camera on the player (horizontal)

        camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
        camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

        canvas2.classList.remove("visible");
        canvas.style.gridColumn = "1/7"
        
    }
    else{
        canvas2.classList.add("visible");
        if(playerSide === "left"){
            targetX = player.x - camera.width / 2;
            targetY = player.y - camera.height / 2  + cameraOffsetY;

            targetX2 = sonic.x - camera2.width / 2;
            targetY2 = sonic.y - camera2.height / 2  + cameraOffsetY;
            
            camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
            camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

            camera2.x = lerp(camera2.x, targetX2, cameraSpeed * transitionProgress);
            camera2.y = lerp(camera2.y, targetY2, cameraSpeed * transitionProgress);
        }
        else{
            targetX = sonic.x - camera2.width / 2;
            targetY = sonic.y - camera2.height / 2 + cameraOffsetY;
            
            targetX2 = player.x - camera.width / 2;
            targetY2 = player.y - camera.height / 2  + cameraOffsetY;

            camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
            camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);
            
            camera2.x = lerp(camera2.x, targetX2, cameraSpeed * transitionProgress);
            camera2.y = lerp(camera2.y, targetY2, cameraSpeed * transitionProgress);
        }
        canvas.style.gridColumn = "1/4"
    }

    sky.x = camera.x;
    sky.y = camera.y;

    sky2.x = camera2.x;
    sky2.y = camera2.y;
}


//FPS limiter
let fpsInterval = 1000 / fps;
let then = Date.now();
let startTime = then;
let frameCount = 0;


function gameLoop(){
    //console.time("gameLoop");
    requestAnimationFrame(gameLoop)
    let now = Date.now();
    elapsed = now - then;
    if(elapsed >= fpsInterval){
        then = now - (elapsed % fpsInterval)
    
        if(!multiplayer){
            sonic.deleted = true;
        }

        //Move the camera to follow the player
        updateTransition();
        updateCamera();

        giveMovement(player, "ArrowLeft", "ArrowRight", "ArrowDown"); 
        giveMovement(sonic, "a", "d", "s");

        //change sprite animations when moving and/or facing left
        if(player.mode === "default"){
            player.spriteSheet.used = true;
            player.width = 50;
            player.height = 100;
            player.animation.src = "images/braden-sprite-sheet.png"
            if (player.facing === "left"){
                player.spriteSheet.y = 1;
                if(Math.abs(player.velocityX) > 1){
                    animateSprite(player, 0, 2);
                }
                else{
    
                }
            }
            else{
                player.spriteSheet.y = 0;
                if(Math.abs(player.velocityX) > 1){
                    animateSprite(player, 0, 2);
                }
                else{
    
                }
            }

        }
        else if(player.mode === "ball"){
            
            if(player.facing === "right"){
                player.animation.src = "images/braden-head.png"
            }
            else{
                player.animation.src = "images/braden-head-left.png"
            }

            if(!isTouchingGround(player) && !keys.ArrowUp){
                if(player.facingY === "down"){
                    player.velocityY ++;
                }
                else{
                    player.velocityY --;
                }
            }
            player.width = 100;
            player.height = 100;
            player.spriteSheet.used = false;
        } 
        else{
            if(player.facing === "left"){
                player.animation.src = "images/braden-on-ship-left.png";
            }
            else{
                player.animation.src = "images/braden-on-ship.png";
            }
            player.spriteSheet.used = false;
            player.width = 100;

            if(player.velocityY === 0 && !isNextToGround(player) && player.mode === "wave"){
                player.velocityY = -10
            }
            if(player.mode === "flying"){
                let playerOnBottom = false;
                for(let i=0; i>grounds.length; i++){
                    if(player.isTouching(grounds[i] && player.y >= grounds[i].y + grounds[i].height)){
                        playerOnBottom = true;
                    }
                }
                if(keys.ArrowUp && player.velocityY === 0 && !playerOnBottom){
                    player.velocityY -= 18
                }
            }
            
        }
        

        if (sonic.facing === "left"){
            sonic.animation.src = "images/sonic-left.png"
        }
        else{
            sonic.animation.src = "images/sonic.png"
        }
        
        //remove deleted sprites
        sprites = sprites.filter(sprite => !sprite.deleted);
        bullets = bullets.filter(bullet => !bullet.deleted);
        
        //Loop through sprites
        for(let i=0; i<sprites.length; i++){
            if(sprites[i].lives <= 0){
                sprites[i].deleted = true;
                sprites[i].lives = 0;
            }
            if(sprites[i].hasGravity){
                giveGravity(sprites[i]);
            }
            if(sprites[i].type === "enemy"){
                enemyLoop(sprites[i])
            }
            if(sprites[i].type === "bullet"){
                bulletLoop(sprites[i])
            }
            if(sprites[i].type === "spike"){
                spikeLoop(sprites[i])
            }
            if(sprites[i].type === "portal"){
                portalLoop(sprites[i])
            }
            if(sprites[i].type === "ground"){
                collide(player, sprites[i]);
                if(multiplayer){
                    collide(sonic, sprites[i]);
                }
            }
            
            createVelocity(sprites[i]);
        }

        //Randomly place enemies
        if(enemyChance >= 1){
            for(let i=0; i<Math.floor(enemyChance); i++){
                let size = getRandomNumber(50, 150);
                let type = enemyTypes[getRandomNumber(0, enemyTypes.length - 1)]
                let newEnemy = createEnemy(getRandomNumber(0,3000), getRandomNumber(-3000,200), size, size, type);
                newEnemy.visible = false;
                if(newEnemy.enemy.type === "ghost"){
                    if(getRandomNumber(0,1500) === 1){
                       newEnemy.visible = true;
                        flyerCount ++;
                        console.log("flyer created" + flyerCount)
                    }
                    

                    if(flyerCount % 100 === 0){
                        console.log("flyer created" + flyerCount)
                    }
                    
                }
                else if(isNextToGround(newEnemy, 0, false)){
                    newEnemy.visible = true;
                    enemyCount ++;
                    console.log("enemy created" + enemyCount)
                }    
                else{
                    newEnemy.deleted = true;
                }
            }
        }
        else{
            if(getRandomNumber(1, 100) <= enemyChance * 100){
                let size = getRandomNumber(50, 150);
                let type = enemyTypes[getRandomNumber(0, enemyTypes.length - 1)]
                let newEnemy = createEnemy(getRandomNumber(0,3000), getRandomNumber(-3000,200), size, size, type);
                newEnemy.visible = false;
                if(isNextToGround(newEnemy, 0, false)){
                    newEnemy.visible = true;
                    console.log("enemy created")
                }    
                else{
                    newEnemy.deleted = true;
                }
            }
        } 
        
        mutualCollide(sonic, player, 2);

        //if player gets to end of level
        if(isTouching(player, endPoint) || isTouching(sonic, endPoint)){
            gameStateMenu.style.display = "block";
            gameState.innerText = "You win! Merry Christmas!";
            restart.innerText = "Next Level";
            music.pause();
            if(!muted){
                win.play();
            }
            
        }
        drawSprites();

        //if the player falls off the map
        if(player.y > fallHeight || player.y < skyFallHeight){
            player.x = 200;
            player.y = 100;
        }
        if(sonic.y > fallHeight || sonic.y < skyFallHeight){
            sonic.x = 200;
            sonic.y = 100;
        }
    }
    //console.timeEnd("gameLoop");
}



//Player Movement
function createVelocity(sprite){
    sprite.x += sprite.velocityX;
    sprite.y += sprite.velocityY;
}

function giveGravity(sprite){
    if(isTouchingGround(sprite)){
        sprite.jumpCount = 0;
        sprite.isTouchingGround = true;
    }
    for(i=0; i < grounds.length; i++){
        collide(sprite, grounds[i]);
    }
    if(!isTouchingGround(sprite)){
        if(sprite.velocityY < terminalVelocity){
            if(sprite.mode !== "ball"){
                if(sprite.mode !== "flying"){
                    sprite.velocityY += gravity;
                }
                else{
                    if(sprite.velocityY <= 10){
                        sprite.velocityY += gravity;
                    }
                }
            }
            
        }
            
        sprite.isTouchingGround = false;
    }
}


// function giveGravity(sprite){
//     sprite.isTouchingGround = false;
//     for(i=0; i < grounds.length; i++){
//         if(isTouching(sprite, grounds[i])){
//             if(Math.abs(sprite.y + sprite.height - grounds[i].y) < 5){
//                 collide(sprite, grounds[i]);
//             }
//             else{
//                 if(sprite === player){
//                     console.log("yay!" + Math.abs(sprite.y + sprite.height - grounds[i].y) + " " + i)
//                 }
//                 sprite.velocityY = Math.abs(sprite.velocityY) * -1 * 0.8 //* (grounds[i].bounciness + sprite.bounciness)
//             }
                
            
//             sprite.jumpCount = 0;
//             sprite.isTouchingGround = true;
//         }
//     }
//     //console.log(player.isTouchingGround)
//     if(!sprite.isTouchingGround){
//         sprite.velocityY += gravity;
//         sprite.isTouchingGround = false;
//     }
// }

function giveMovement(sprite, left, right, down){
    if(sprite.mode !== "ball"){
        if(keys[left] && sprite.velocityX > -1 * maxSpeed){
            sprite.velocityX -= acceleration;
            sprite.facing = "left";
        }
        else if(sprite.velocityX < 0){
            sprite.velocityX += friction;
        }
    
        if(keys[right] && sprite.velocityX < maxSpeed){
            sprite.velocityX += acceleration;
            sprite.facing = "right";
        }
        else if(sprite.velocityX > 0){
            sprite.velocityX -= friction;
        }
        if (Math.abs(sprite.velocityX) < 1){
            sprite.velocityX = 0;
          }
    }
    else{
        sprite.velocityX = maxSpeed;
    }
   
}
function jump(sprite){
    if(sprite.mode === "default"){
        if(sprite === player){
            keyWasPressed.ArrowUp = true;
        }
        else if(sprite === sonic){
            keyWasPressed.w = true;
        }
        if(sprite.jumpCount <3){
            sprite.y -= 2;
            sprite.velocityY = -1 * jumpForce;
            sprite.jumpCount++;
            playAudio(jumpSound);
        }
    }
    else if(sprite.mode === "flying"){
        sprite.hasGravity = false;
        if(sprite.velocityY >= -10 && sprite.velocityY < 0){
            sprite.velocityY -= 2;
            
            
        }
        else if(sprite.velocityY >= 0){
                console.log("hi")
                sprite.velocityY -= 18;
        }
       
    }
    else if(sprite.mode === "ball"){
        //sprite.hasGravity = false;
        for(let i=0; i<grounds.length; i++){
            if(sprite.isTouching[grounds[i]]){
                if(Math.abs(player.y + player.height - grounds[i].y) < 4 ){
                    if(sprite.y < grounds[i].y){
                        sprite.velocityY -= 1;
                        sprite.facingY = "up"
                    }
                }
                
                if(Math.abs(grounds[i].y + grounds[i].height - sprite.y) < 4){
                    console.log("HI")
                    if(sprite.y > grounds[i].y){
                        sprite.velocityY += 1;
                        sprite.facingY = "down"
                    }
                    console.log(i)
                }
            }
            else{
                sprite.velocityY *= -1
            }
        }
    }
    else if(sprite.mode === "wave"){
        sprite.hasGravity = false
    
        if(sprite.velocityY >= 0){
            sprite.velocityY = -10
        }
        else{
            sprite.velocityY = 10
        }
    }
}

function shootBullet(sprite){
    if(!sprite.deleted){
        let newBullet = (createSprite(sprite.x, sprite.y + sprite.height / 1.5, 10, 10, "bullet"))
        newBullet.animation.src = "images/bullet.png";
        if(sprite.facing === "right"){
            newBullet.velocityX = bulletSpeed;
        }
        else{
            newBullet.velocityX = -1 * bulletSpeed;
        }
            newBullet.bullet.firedFrom = sprite
        sprites.push(newBullet)
        bullets.push(newBullet)
        playAudio(shootSound)
    }  
}

//Collision Handling

function isTouching(sprite1, sprite2) {
    if(sprite1.deleted === false && sprite2.deleted === false) {
        if (
            sprite1.x < sprite2.x + sprite2.width &&
            sprite1.x + sprite1.width > sprite2.x &&
            sprite1.y < sprite2.y + sprite2.height &&
            sprite1.y + sprite1.height > sprite2.y
        ) {return true;}
        else {return false;}
    }
    return false
}

function isNextToOG(sprite1, sprite2,) {
    if (
       sprite1.x + sprite1.width / 2 < sprite2.x + sprite2.width &&
       sprite1.x + sprite1.width / 2 > sprite2.x &&
       sprite1.y + sprite1.height === sprite2.y
   ) {return true;}
   else {return false;
   }
}

function isNextTo(sprite1, sprite2, toleranceX = 0, useMidPoint = true, useY = true, toleranceY = 1) {
    if(useMidPoint){
        if (
            sprite1.x + sprite1.width / 2 < sprite2.x + sprite2.width - toleranceX &&
            sprite1.x + sprite1.width / 2 > sprite2.x + toleranceX 
        ) {
            if(useY){
                if(Math.abs(sprite1.y + sprite1.height - sprite2.y) <= toleranceY &&
                sprite1.y + sprite1.height <= sprite2.y){
                    return true;
                }
                else{
                    return false;
                }
            } else{
                return true;
            }
            
        }
        else {
            return false;
        }
    }
    else{
        if (
            sprite1.x + sprite1.width < sprite2.x + sprite2.width - toleranceX &&
            sprite1.x > sprite2.x + toleranceX
        ) {
            if(useY){
                if(Math.abs(sprite1.y + sprite1.height - sprite2.y) <= toleranceY &&
                sprite1.y + sprite1.height <= sprite2.y){
                    return true;
                }
                else{
                    return false;
                }
            } else{
                return true;
            }
            
        }
        else {
            return false;
        }
    }
}

function isNextToGround(sprite, toleranceX = 0, useMidPoint = true, useY = true, toleranceY = 1){
    for(let i=0; i < grounds.length; i++){
        if(isNextTo(sprite, grounds[i], toleranceX, useMidPoint, useY, toleranceY)){
            return true;
        }
    }
    return false;
}

function isTouchingGround(sprite){
    for(i=0; i<grounds.length; i++){
        if(isTouching(sprite, grounds[i])){
            return true;
        }
    }
    return false
}

function isOnGroundOG(sprite){
    for(i=0; i<grounds.length; i++){
        const tolerance = 1;
        if(
            sprite.x < grounds[i].x + grounds[i].width &&
            sprite.x + sprite.width > grounds[i].x &&
            Math.abs(sprite.y + sprite.height - grounds[i].y) < tolerance
            // sprite.y + sprite.height === grounds[i]
        ) {
            return true;
        }
    }
    return false;
}



function collide(sprite1, sprite2){
    if(!sprite1.deleted && !sprite2.deleted){
        if(isTouching(sprite1, sprite2)){
            sprite1.isTouching[sprite2] = true;
            sprite2.isTouching[sprite1] = true;

            overlapX = Math.min(
                sprite1.x + sprite1.width - sprite2.x, // right of sprite1 colliding w/ left of sprite2
                sprite2.x + sprite2.width - sprite1.x // left of sprite 1 overlap with sprite2
            )
            overlapY = Math.min(
                sprite1.y + sprite1.height - sprite2.y, // bottom of sprite1 on top of sprite2
                sprite2.y + sprite2.height - sprite1.y // top of sprite1 on bottom of sprite2
            )
    
            if(overlapX < overlapY){ // horizontal collision
                if(sprite1.x < sprite2.x){ // if colliding from right
                    sprite1.x = sprite2.x - sprite1.width;
                }
                else if(sprite1.x > sprite2.x){ // if coming from left
                    sprite1.x = sprite2.x + sprite2.width;
                }
            } else{
                if(sprite1.y < sprite2.y){ // if colliding from the top
                    sprite1.velocityY = 0;
                    sprite1.y = sprite2.y - sprite1.height;
                    sprite1.jumpCount = 0;
                }
                else if(sprite1.y > sprite2.y){ // if colliding from the bottom
                    sprite1.y = sprite2.y + sprite2.height;
                    sprite1.velocityY = 0;
                }
            }
        }
    }
}

function mutualCollide(sprite1, sprite2, bounce){
    if(!sprite1.deleted && !sprite2.deleted){
        if(isTouching(sprite1, sprite2)){

            overlapX = Math.min(
                sprite1.x + sprite1.width - sprite2.x, // right of sprite1 colliding w/ left of sprite2
                sprite2.x + sprite2.width - sprite1.x // left of sprite 1 overlap with sprite2
            )
            overlapY = Math.min(
                sprite1.y + sprite1.height - sprite2.y, // bottom of sprite1 on top of sprite2
                sprite2.y + sprite2.height - sprite1.y // top of sprite1 on bottom of sprite2
            )
    
            if(overlapX < overlapY){ // horizontal collision
                if(sprite1.x < sprite2.x){ // if colliding from right
                    sprite1.x -= overlapX / 2; //push sprite1 left
                    sprite2.x += overlapX / 2; //push sprite2 right
                }
                else if(sprite1.x > sprite2.x){ // if coming from left
                    sprite1.x += overlapX / 2; //push sprite1 right
                    sprite2.x -= overlapX / 2; //push sprite2 left
                }
                const tempVX = sprite1.velocityX;
                sprite1.velocityX = sprite2.velocityX * bounce; // Exchange velocities with some damping
                sprite2.velocityX = tempVX * bounce;
            } else{
                if(sprite1.y < sprite2.y){ // if colliding from the top
                    sprite1.y -= overlapY / 2; // Push sprite1 up
                    sprite2.y += overlapY / 2; // Push sprite2 down
                    sprite1.velocityY = 0;
                    sprite2.velocityY = 0;
                    sprite1.jumpCount = 0; // Reset jumps for grounded sprites
                    
                    sprite2.bouncedOn = true; //used to check if player is on top of enemies
                    
                }
                else if(sprite1.y > sprite2.y){ // if colliding from the bottom
                    sprite1.y += overlapY / 2; // Push sprite1 down
                    sprite2.y -= overlapY / 2; // Push sprite2 up
                    sprite1.velocityY = 0;
                    sprite2.velocityY = 0;
                    sprite2.jumpCount = 0;

                    sprite1.bouncedOn = true; //used to check if player is on top of enemies
                }
            }
        }
    }

}


//misc. functions
function isInBounds(sprite){ //if the player is past the camera border, push the camera
    //left/right
    if(!splitScreen){
        if(sprite.x > camera.x * sprite.distanceX + camera.width || sprite.x + sprite.width < camera.x * sprite.distanceX){
            return false;
        }
        //up/down
        if(sprite.y > camera.y * sprite.distanceY + camera.height || sprite.y + sprite.height < camera.y * sprite.distanceY){
            return false;
        }
    }
    else{
        if(sprite.x > camera.x * sprite.distanceX + camera.width || sprite.x + sprite.width < camera.x * sprite.distanceX){
            if(sprite.x > camera2.x * sprite.distanceX + camera2.width || sprite.x + sprite.width < camera2.x * sprite.distanceX){
                return false;
            }
        }
        //up/down
        if(sprite.y > camera.y * sprite.distanceY + camera.height || sprite.y + sprite.height < camera.y * sprite.distanceY){
            if(sprite.y > camera2.y * sprite.distanceY + camera2.height || sprite.y + sprite.height < camera2.y * sprite.distanceY){
                return false;
            }
        }
    }
    return true;
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function playAudio(audio, loop){
    if(!muted){
        let newAudio = new Audio(audio);
        
        if(loop){
            newAudio.loop = true;
        }
        newAudio.play();
        sounds.push(newAudio);
    }
}
function pauseAudio(){
    for(let i=0; i<sounds.length; i++){
        sounds[i].pause();
    }
}