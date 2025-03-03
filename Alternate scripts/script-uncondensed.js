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
const win = new Audio("audio/win.mp3")
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
}
imgCache.goomba.src = "images/enemy.webp";
imgCache.robot.src = "images/enemy2.png"
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
        if(value === true && !player.keyWasPressed.ArrowUp){
            player.keyWasPressed.ArrowUp = true;
            if(player.jumpCount < 2){
                player.y -= 2;
                player.velocityY = -1 * jumpForce;
                player.jumpCount++;
                playAudio(jumpSound);
            }
        }
        else if(value === false){
            player.keyWasPressed.ArrowUp = false;
        }
    }
    if(button.id === "shootButton"){
        if(value === true && !player.keyWasPressed.ArrowDown){
            if(!machineGuns){
                player.keyWasPressed.ArrowDown = true;
            }
            shootBullet(player);
        }
        else if(value === false){
            player.keyWasPressed.ArrowDown = false;
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
        "keyWasPressed" : {}, 
        "jumpCount" : 2,
        "facing": "right", 
        "deleted": false,
        "takesDamage": false,
        "hasGravity" : false,
        "bouncedOn" : false,
        "lives" : 3,
        "visible" : true,
        "type" : type,
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
let sky2 = createSprite(0,0,canvas2.width, canvas2.height)

let player = createSprite(150, 150, 50, 100, "player");
let sonic = createSprite(250, 150, 100, 100, "sonic");

let grounds = [];
let enemies = [];
let spikes = [];

let bullets = [];

let endPoint = createSprite(0, 0, 0, 0);




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

    //Skies
    let skyData = levels[level].sky;
    sky = createSprite(0,0, canvas.width, canvas.height)
    sky.animation.src = skyData.src;
    sprites.push(sky);

    sky2 = createSprite(0,0,canvas2.width, canvas2.height)
    sky2.animation.src = skyData.src;
    sprites.push(sky2);

    spikes = [];

    createSpike(300, 175, 75, 75);

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
        grounds[i] = createSprite(i * 300, 250, 300, 150);
    }
    for(let i=0; i<groundData.length; i++){
        createGround(groundData[i][0], groundData[i][1], groundData[i][2], groundData[i][3])
    }
    
    createSpriteGroup(grounds, "images/ground.png");

    //Enemies
    enemies = []
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
    grounds.push(createSprite(x, y, w, h));
}

function createSpike(x, y, width = 75, height = 75){
    let newSpike = createSprite(x, y, width, height);
    newSpike.animation.src = "images/spike-bigger.png";
    sprites.push(newSpike);
    spikes.push(newSpike);
}

const enemySkins = {
    "goomba" : "images/enemy.webp",
    "robot" : "images/enemy2.png"
}

const enemyTypes = ["goomba", "robot"]

//enemies
function createEnemy(x, y, width = 50, height = 50, enemyType = "goomba"){
    let newEnemy = createSprite(x, y, width, height);

    enemies.push(newEnemy);
    newEnemy.takesDamage = true;
    newEnemy.hasGravity = true;
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

function setEnemy(sprite){
        
}

let keys = {};

//To check if key down and/or key went down
window.addEventListener("keydown", (event) => {
    if(event.key === "ArrowUp" && !player.keyWasPressed.ArrowUp){
        player.keyWasPressed.ArrowUp = true;
        if(player.jumpCount < 2){
            player.y -= 2;
            player.velocityY = -1 * jumpForce;
            player.jumpCount++;
            playAudio(jumpSound);
        }
    }
    if(event.key === "w" && !sonic.keyWasPressed.w){
        sonic.keyWasPressed.w = true;
        if(sonic.jumpCount < 2){
            sonic.y -= 2;
            sonic.velocityY = -1 * jumpForce;
            sonic.jumpCount++;
            playAudio(jumpSound);
        }
    }
    if(event.key === "ArrowDown" && !player.keyWasPressed.ArrowDown){
        if(!machineGuns){
            player.keyWasPressed.ArrowDown = true;
        }
        shootBullet(player);
    }
    if(event.key === "s" && !sonic.keyWasPressed.s){
        if(!machineGuns){
            sonic.keyWasPressed.s = true;
        }
        shootBullet(sonic);
    }

    keys[event.key] = true;

});
window.addEventListener("keyup", function(event){
    if(event.key === "ArrowUp"){
        player.keyWasPressed.ArrowUp = false;
    }
    if(event.key === "w"){
        sonic.keyWasPressed.w = false;
    }
    if(event.key === "ArrowDown"){
        player.keyWasPressed.ArrowDown = false;
    }
    if(event.key === "s"){
        sonic.keyWasPressed.s = false;
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

    sky.width = canvas.width;
    sky.height = canvas.height;

    canvas2.width = window.innerWidth / zoom;
    canvas2.height = window.innerHeight / zoom;

    camera2.width = canvas.width;
    camera2.height = canvas2.height;

    sky2.width = canvas2.width;
    sky2.height = canvas2.height;
}

resizeCanvas();

function goFullscreen() {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen(); // For older webkit browsers
    } else if (canvas.mozRequestFullscreen) {
      canvas.mozRequestFullscreen(); // For older Mozilla browsers
    }
  }

// window.addEventListener("resize", function(){
//     resizeCanvas();
//     drawSprites();
// })

// //Check to see if the images are loaded
// let loadedImages = 0;

// function checkImagesLoaded() {
//     loadedImages++;
//     if (loadedImages === 2) {
//         drawSprites();
//     }
// }

// player.animation.onload = checkImagesLoaded;
// grounds[0].animation.onload = checkImagesLoaded;


//FPS limiter
let fpsInterval = 1000 / fps;
let then = Date.now();
let startTime = then;
let frameCount = 0;

function gameLoop(){
    console.time("gameLoop");
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

        //Decide whether to use split screen
        if((isTouchingGround(player) && isTouchingGround(sonic)) || isTouching(player, sonic)){ //Only disable splitScreen if players are touching ground to prevent screen from jittering when player jumps
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
        }

        //Update the camera
        if(player.deleted && sonic.deleted){ //Game over logic
            gameStateMenu.style.display = "block";
            gameState.innerText = "Game Over!"
            restart.innerText = "Restart"
        }
        else if(sonic.deleted){
            targetX = player.x - camera.width / 2;  // Center the camera on the player (horizontal)
            targetY = player.y - camera.height / 2 ; // Center the camera on the player (vertical)    

            camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
            camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

            canvas2.classList.remove("visible");
            canvas.style.gridColumn = "1/7"
        }
        else if(player.deleted){
            targetX = sonic.x - camera.width / 2;  // Center the camera on the player (horizontal)
            targetY = sonic.y - camera.height / 2 ; // Center the camera on the player (vertical)    

            camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
            camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

            canvas2.classList.remove("visible");
            canvas.style.gridColumn = "1/7"
        }
        else if(!splitScreen){
            // followSprite(player);
            // followSprite(sonic);

            targetY = (player.y + sonic.y) / 2 - camera.height / 2 
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
                targetY = player.y - camera.height / 2;
        
                targetX2 = sonic.x - camera2.width / 2;
                targetY2 = sonic.y - camera2.height / 2 //- 30;
                
                camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
                camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

                camera2.x = lerp(camera2.x, targetX2, cameraSpeed * transitionProgress);
                camera2.y = lerp(camera2.y, targetY2, cameraSpeed * transitionProgress);
            }
            else{
                targetX = sonic.x - camera2.width / 2;
                targetY = sonic.y - camera2.height / 2 //- 30;
                
                targetX2 = player.x - camera.width / 2;
                targetY2 = player.y - camera.height / 2;

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

        giveMovement(player, "ArrowLeft", "ArrowRight", "ArrowDown"); 
        giveMovement(sonic, "a", "d", "s");

        //change sprite animations when moving and/or facing left
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

        if (sonic.facing === "left"){
            sonic.animation.src = "images/sonic-left.png"
        }
        else{
            sonic.animation.src = "images/sonic.png"
        }
        
        //remove deleted sprites
        sprites = sprites.filter(sprite => !sprite.deleted);
        bullets = bullets.filter(bullet => !bullet.deleted);

        //If a bullet touches a sprite, destroy sprite and bullet
        for(let i=0; i<bullets.length; i++){
            if(isInBounds(bullets[i])){
                for(let j=0; j<sprites.length; j++){
                    if(isTouching(bullets[i], sprites[j]) && sprites[j].takesDamage){
                        if(bullets[i].bullet.firedFrom !== sprites[j]){
                            sprites[j].lives -= 1;
                            bullets[i].deleted = true;
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
                bullets[i].deleted = true;
            }
        }

        //gravity
        for(let i=0; i<sprites.length; i++){
            if(sprites[i].hasGravity){
                giveGravity(sprites[i]);
            }
        }
        
        //delete sprites if they take damage
        for(let i=0; i<sprites.length; i++){
            if(sprites[i].lives <= 0){
                sprites[i].deleted = true;
                sprites[i].lives = 0;
            }
        }
        //Randomly place enemies
        if(enemyChance >= 1){
            for(let i=0; i<Math.floor(enemyChance); i++){
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

        //loop through enemies
        for(let i=0; i<enemies.length; i++){
            if(isInBounds(enemies[i])){
                if(isTouching(enemies[i], player) && !enemies[i].deleted){
                    mutualCollide(player, enemies[i], 1);
                    if(enemies[i].bouncedOn){
                        enemies[i].deleted = true;
                    }
                    else if(enemies[i].enemy.type === "goomba"){
                        player.lives --;
                        playerLives.innerText = "Lives: " + player.lives;
                            enemies[i].deleted = true;
                            playAudio(ouch)
                    }
                }
    
                else if(isTouching(enemies[i], sonic)){
                    mutualCollide(sonic, enemies[i], 1);
                    if(enemies[i].bouncedOn){
                        enemies[i].deleted = true;
                        
                    }
                    else if(enemies[i].enemy.type === "goomba"){
                        sonic.lives --;
                        sonicLives.innerText = "Lives: " + sonic.lives;
                        enemies[i].deleted = true;
                        playAudio(ouch)
    
                    }
                }
                if(!isTouching(enemies[i], player && !isTouching(enemies[i], sonic))){
                    if(Math.abs(enemies[i].velocityX !== 3)){
                        enemies[i].velocityX = -3;
                    }
                }
    
                if(enemies[i].enemy.type === "robot" && isInBounds(enemies[i])){
                    if(getRandomNumber(1, robotShootRate) === 1){
                        if(player.x < enemies[i].x){
                            enemies[i].facing = "left"
                        }
                        else{
                            enemies[i].facing = "right"
                        }
                        shootBullet(enemies[i])
                    }
                }
                if(!isNextToGround(enemies[i])){
                    enemies[i].velocityX = enemies[i].velocityX * -1;
                }
            }
            else{
                enemies[i].velocityX = 0;
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

        createVelocity();
        drawSprites();
        //requestAnimationFrame(gameLoop);
        // setTimeout(gameLoop, 16)

        //if the player falls off the map
        if(player.y > fallHeight){
            player.x = 200;
            player.y = 100;
        }
        if(sonic.y > fallHeight){
            sonic.x = 200;
            sonic.y = 100;
        }
    }
    console.timeEnd("gameLoop");
}


//Player Movement

function createVelocity(){
    for(let i=0; i < sprites.length; i++){
        sprites[i].x += sprites[i].velocityX;
        sprites[i].y += sprites[i].velocityY;
    }
}

function giveGravity(sprite){
    for(i=0; i < grounds.length; i++){
        collide(sprite, grounds[i]);
  }
  let touching = isTouchingGround(sprite)
  if(touching){
    sprite.jumpCount = 0;
    sprite.velocityY = 0;
  }
  else{
      sprite.velocityY += gravity;


  }
}

function giveMovement(sprite, left, right, down){
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
function shootBullet(sprite){
    if(!sprite.deleted){
        let newBullet = (createSprite(sprite.x, sprite.y + sprite.height / 1.5, 10, 10))
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

function isNextTo(sprite1, sprite2, toleranceX = 0, useMidPoint = true, toleranceY = 1) {
    if(useMidPoint){
        if (
            sprite1.x + sprite1.width / 2 < sprite2.x + sprite2.width - toleranceX &&
            sprite1.x + sprite1.width / 2 > sprite2.x + toleranceX &&
            Math.abs(sprite1.y + sprite1.height - sprite2.y) <= toleranceY &&
            sprite1.y + sprite1.height <= sprite2.y
        ) {return true;}
        else {return false;}
    }
    else{
        if (
            sprite1.x + sprite1.width < sprite2.x + sprite2.width - toleranceX &&
            sprite1.x > sprite2.x + toleranceX &&
            Math.abs(sprite1.y + sprite1.height - sprite2.y) <= toleranceY &&
            sprite1.y + sprite1.height <= sprite2.y
        ) {return true;}
        else {return false;}
    }
}

function isNextToGround(sprite, toleranceX = 0, useMidPoint = true, toleranceY = 1){
    for(let i=0; i < grounds.length; i++){
        if(isNextTo(sprite, grounds[i], toleranceX, useMidPoint, toleranceY)){
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
        if(sprite.x > camera.x + camera.width || sprite.x + sprite.width < camera.x){
            return false;
        }
        //up/down
        if(sprite.y > camera.y + camera.height || sprite.y + sprite.height < camera.y){
            return false;
        }
    }
    else{
        if(sprite.x > camera.x + camera.width || sprite.x + sprite.width < camera.x){
            if(sprite.x > camera2.x + camera2.width || sprite.x + sprite.width < camera2.x){
                return false;
            }
        }
        //up/down
        if(sprite.y > camera.y + camera.height || sprite.y + sprite.height < camera.y){
            if(sprite.y > camera2.y + camera2.height || sprite.y + sprite.height < camera2.y){
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