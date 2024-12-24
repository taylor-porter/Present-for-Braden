const canvas = document.getElementById("game_canvas");
const ctx = canvas.getContext("2d");

const canvas2 = document.getElementById("game_canvas_2");
const ctx2 = canvas2.getContext("2d");

const playerLives = document.getElementById("playerLives");
const sonicLives = document.getElementById("sonicLives")

let sprites = [];
let key = "";
let upWasPressed = false;
let splitScreen = false;
let playerSide = "left";

//game controls
let maxSpeed = 10;
let acceleration = 1.3;
let friction = 1;
let jumpForce = 25;
let gravity = 1.7;
let cameraSpeed = 0.2; //0.3
let fallHeight = 700;
let bulletSpeed = 20;
let cameraBorder = 150;
// ctx.imageSmoothingEnabled = false;
let zoom = 1.7;
let multiplayer = true;


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


function createSprite(posX, posY, width, height){
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
    };
}
let sky = createSprite(0,0, canvas.width, canvas.height)
sky.animation.src = "images/sky.jpg"
sprites.push(sky);

let sky2 = createSprite(0,0,canvas2.width, canvas2.height)
sky2.animation.src = "images/sky.jpg"
sprites.push(sky2);

let player = createSprite(150, 100, 50, 100, "player");
sprites.push(player);
player.animation.src = "images/braden-sprite-sheet.png";

player.spriteSheet.used = true;
player.spriteSheet.x = 2;
player.spriteSheet.y = 0;
player.spriteSheet.width = 300;
player.spriteSheet.height = 823;
player.spriteSheet.margin = 0;
player.spriteSheet.frameRate = 5;
player.takesDamage = true;
player.hasGravity = true;

let sonic = createSprite(250, 100, 100, 100, "sonic");
sonic.animation.src = "images/sonic.png"
sonic.takesDamage = true;
sonic.hasGravity = true;
sprites.push(sonic);

if(!multiplayer){
    sonic.deleted = true;
}

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


let grounds = [];

for(i=0; i<10; i++){
    grounds[i] = createSprite(i * 300, 250, 300, 150);
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
createGround(350, 80, 100, 75);
createGround(600, 50, 100, 75);
createGround(850, 10, 100, 75)
createGround(1050, -150, 100, 75)
createGround(800, -300, 100, 75)
createGround(1050, -450, 100, 75)


createSpriteGroup(grounds, "images/ground.png");

function createEnemy(x, y, width, height){
    let w = width;
    let h = height;
    if(w === undefined){
        w = 50;
    }
    if(h === undefined){
        h = 50;
    }
    grounds.push(createSprite(x, y, w, h));
}

let enemies = []

// enemies.push(createSprite(400, 200, 50, 50));
// enemies.push(createSprite(600, 200, 50, 50))
// enemies.push(createSprite(900, 200, 50, 50))

createSpriteGroup(enemies, "images/enemy.webp");

for(let i=0; i<enemies.length; i++){
    enemies[i].takesDamage = true;
    enemies[i].hasGravity = true;
    enemies[i].velocityX  = -3;

}

function createSpriteGroup(list, animationSource){
    for(i=0; i < list.length; i++){
        sprites.push(list[i])
        if(animationSource !== undefined){
            list[i].animation.src = animationSource;
        }
    }
}

let bullets = [];



let loadedImages = 0;

function checkImagesLoaded() {
    loadedImages++;
    if (loadedImages === 2) {
        //drawSprites();
        gameLoop();
        startStop.style.display = "none";
    }
}

player.animation.onload = checkImagesLoaded;
grounds[0].animation.onload = checkImagesLoaded;

let keys = {};

//to check if key down and/or key went down
window.addEventListener("keydown", (event) => {
    if(event.key === "ArrowUp" && !player.keyWasPressed.ArrowUp){
        console.log(player.jumpCount);
        player.keyWasPressed.ArrowUp = true;
        if(player.jumpCount < 2){
            player.y -= 2;
            player.velocityY = -1 * jumpForce;
            player.jumpCount++;
        }
    }
    if(event.key === "w" && !sonic.keyWasPressed.w){
        sonic.keyWasPressed.w = true;
        if(sonic.jumpCount < 2){
            sonic.y -= 2;
            sonic.velocityY = -1 * jumpForce;
            sonic.jumpCount++;
        }
    }
    if(event.key === "ArrowDown" && !player.keyWasPressed.ArrowDown){
        shootBullet(player);
    }
    if(event.key === "s" && !sonic.keyWasPressed.s){
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
    keys[event.key] = false;
})

let startStop = document.getElementById("startStop");

startStop.addEventListener("click", function(){
    gameLoop()
    startStop.style.display = "none";
})

function pushCamera(sprite){ //if the player is past the camera border, push the camera
    //left/right
    if(sprite.x + sprite.width > targetX + (camera.width - cameraBorder) || sprite.x < targetX + cameraBorder){
        targetX += sprite.velocityX;
    }
    //up/down
    if(sprite.y + sprite.height > targetY + (camera.height - cameraBorder) || sprite.y < targetY + cameraBorder){
        if((sprite.velocityY === 1.7) && isTouchingGround(sprite)[0]){
            targetY += sprite.velocityY - 1.7;
        }
        else{
            targetY += sprite.velocityY;
        }
    }
}

function isInBounds(sprite){ //if the player is past the camera border, push the camera
    //left/right
    if(!splitScreen){
        if(sprite.x > targetX + camera.width || sprite.x + sprite.width < targetX){
            return false;
        }
        //up/down
        if(sprite.y > targetY + camera.height || sprite.y + sprite.height < targetY){
            return false;
        }
    }
    return true;
}

if(multiplayer){
    let targetX = (player.x + sonic.x) / 2 - camera.width / 2;  // Center the camera on the player (horizontal)
    let targetY = (player.y + sonic.y) / 2 - camera.height / 2 ; // Center the camera on the player (vertical)    
}
else{
    let targetX = player.x - camera.width / 2;  // Center the camera on the player (horizontal)
    let targetY = player.y - camera.height / 2 ; // Center the camera on the player (vertical)    
}

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

window.addEventListener("resize", resizeCanvas)


function gameLoop(){
    // Move the camera to follow the player
    //
    updateTransition();
    if((isTouchingGround(player)[0] && isTouchingGround(sonic)[0]) || isTouching(player, sonic)){
        if(Math.abs(player.x - sonic.x) < camera.width - 100 && Math.abs(player.y - sonic.y) < camera.height -100){
            if(splitScreen){
                splitScreen = false;
                startTransition();
            }
        }
        else if(player.deleted || sonic.deleted){
            splitScreen = false;
            startTransition();
        }
        else if(!splitScreen){
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
    if(player.deleted && sonic.deleted){
        
    }
    else if(sonic.deleted){
        let targetX = player.x - camera.width / 2;  // Center the camera on the player (horizontal)
        let targetY = player.y - camera.height / 2 ; // Center the camera on the player (vertical)    

        camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
        camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

        canvas2.classList.remove("visible");
        canvas.style.gridColumn = "1/7"
    }
    else if(player.deleted){
        let targetX = sonic.x - camera.width / 2;  // Center the camera on the player (horizontal)
        let targetY = sonic.y - camera.height / 2 ; // Center the camera on the player (vertical)    

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
            let targetX = player.x - camera.width / 2;
            let targetY = player.y - camera.height / 2;
    
            let targetX2 = sonic.x - camera2.width / 2;
            let targetY2 = sonic.y - camera2.height / 2 - 30;
            
            camera.x = lerp(camera.x, targetX, cameraSpeed * transitionProgress);
            camera.y = lerp(camera.y, targetY, cameraSpeed * transitionProgress);

            camera2.x = lerp(camera2.x, targetX2, cameraSpeed * transitionProgress);
            camera2.y = lerp(camera2.y, targetY2, cameraSpeed * transitionProgress);
        }
        else{
            let targetX = sonic.x - camera2.width / 2;
            let targetY = sonic.y - camera2.height / 2 - 30;
            
            let targetX2 = player.x - camera.width / 2;
            let targetY2 = player.y - camera.height / 2;

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
            //player.spriteSheet.x = 6;
        }
    }
    else{
        player.spriteSheet.y = 0;
        if(Math.abs(player.velocityX) > 1){
            animateSprite(player, 0, 2);
        }
        else{
            //player.spriteSheet.x = 7;
        }
    }

    if (sonic.facing === "left"){
        sonic.animation.src = "images/sonic-left.png"
    }
    else{
        sonic.animation.src = "images/sonic.png"
    }
    
    //delete deleted sprites
    sprites = sprites.filter(sprite => !sprite.deleted);
    bullets = bullets.filter(bullet => !bullet.deleted);

    //if a sprite is touching a bullet, delete the bullet and the sprite
    for(let i=0; i<bullets.length; i++){
        if(isInBounds(bullets[i])){
            for(let j=0; j<sprites.length; j++){
                if(isTouching(bullets[i], sprites[j]) && sprites[j].takesDamage){
                    if(bullets[i].bullet.firedFrom !== sprites[j]){
                        sprites[j].lives -= 1;
                        bullets[i].deleted = true;
                    }  
                }
            }
        }
    }

    if(player.lives >= 0){
        playerLives.innerText = "Lives: " + player.lives;
    }
    if(sonic.lives >= 0){
        sonicLives.innerText = "lives: " + sonic.lives;
    }
    if(!multiplayer){
        sonicLives.style.display = "none";
    }
    
    
    //gravity

    //Loop through Sprites
    sprites.filter(sprite => sprite.hasGravity).forEach(sprite => {
        giveGravity(sprite);
    });
    
    sprites.filter(sprite => sprite.takesDamage).forEach(sprite => {
        if(sprite.lives <= 0){
            sprite.deleted = true;
            sprite.lives = 0;
        }
    });
        

    //Loop through enemies
    for(let i=0; i<enemies.length; i++){
        
        if(isTouching(enemies[i], player) && !enemies[i].deleted){
            mutualCollide(player, enemies[i], 1);
            if(enemies[i].bouncedOn){
                enemies[i].deleted = true;
            }
            else{
                player.lives --;
                enemies[i].deleted = true;
            }
        }

        if(isTouching(enemies[i], sonic)){
            mutualCollide(sonic, enemies[i], 1);
            if(enemies[i].bouncedOn){
                enemies[i].deleted = true;
            }
            else{
                sonic.lives --;
            }
        }
        mutualCollide(player, enemies[i], 1);
        mutualCollide(sonic, enemies[i], 1);
    }
    
    mutualCollide(sonic, player, 2);

    createVelocity();
    drawSprites();
    requestAnimationFrame(gameLoop);
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



function createVelocity(){
    for(let i=0; i < sprites.length; i++){
        sprites[i].x += sprites[i].velocityX;
        sprites[i].y += sprites[i].velocityY;
    }
}

function isTouching(sprite1, sprite2) {
     if (
        sprite1.x < sprite2.x + sprite2.width &&
        sprite1.x + sprite1.width > sprite2.x &&
        sprite1.y < sprite2.y + sprite2.height &&
        sprite1.y + sprite1.height > sprite2.y
    ) {return true;}
    else {return false;}
}

function drawSprites() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i < sprites.length; i++){
        if(sprites[i] !== sky2){
            if(!sprites[i].spriteSheet.used){
                ctx.drawImage(
                    sprites[i].animation, 
                    sprites[i].x - camera.x,
                    sprites[i].y - camera.y, 
                    sprites[i].width, 
                    sprites[i].height
                );
            }
            else{
                ctx.drawImage(
                    sprites[i].animation,
                    sprites[i].spriteSheet.x * (sprites[i].spriteSheet.width), 
                    sprites[i].spriteSheet.y * (sprites[i].spriteSheet.height + sprites[i].spriteSheet.margin), 
                    sprites[i].spriteSheet.width, 
                    sprites[i].spriteSheet.height,
                    sprites[i].x - camera.x,
                    sprites[i].y - camera.y, 
                    sprites[i].width, 
                    sprites[i].height
                );
            }
        }
        
    }

    if(splitScreen){
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        for(let i=0; i < sprites.length; i++){
            if(sprites[i] !== sky){
                if(!sprites[i].spriteSheet.used){
                    ctx2.drawImage(
                        sprites[i].animation, 
                        sprites[i].x - camera2.x,
                        sprites[i].y - camera2.y, 
                        sprites[i].width, 
                        sprites[i].height
                    );
                }
                else{
                    ctx2.drawImage(
                        sprites[i].animation,
                        sprites[i].spriteSheet.x * (sprites[i].spriteSheet.width), 
                        sprites[i].spriteSheet.y * (sprites[i].spriteSheet.height + sprites[i].spriteSheet.margin), 
                        sprites[i].spriteSheet.width, 
                        sprites[i].spriteSheet.height,
                        sprites[i].x - camera2.x,
                        sprites[i].y - camera2.y, 
                        sprites[i].width, 
                        sprites[i].height
                    );
                }
            }
            
        }
    }
}
function isTouchingGround(sprite){
    for(i=0; i<grounds.length; i++){
        if(isTouching(sprite, grounds[i])){
            return [true, i];
        }
    }
    return [false, -1];
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

function giveGravity(sprite){
    for(i=0; i < grounds.length; i++){
        collide(sprite, grounds[i]);
  }
  let touching = isTouchingGround(sprite)[0]
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
        let newBullet = (createSprite(sprite.x, sprite.y + sprite.width / 3, 10, 10))
        newBullet.animation.src = "images/bullet.png";
        if(sprite.facing === "right"){
            newBullet.velocityX = bulletSpeed;
        }
        else{
            newBullet.velocityX = -1 * bulletSpeed;
        }
        if(sprite === player){
            newBullet.bullet.firedFrom = player
        }
        else if(sprite === sonic){
            newBullet.bullet.firedFrom = sonic
        }
        sprites.push(newBullet)
        bullets.push(newBullet)
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
