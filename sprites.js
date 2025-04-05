// //Create sprites
// let sprites = [];

// function createSprite(posX, posY, width, height, type = ""){
//     let newSprite =  {
//         "x" : posX,
//         "y" : posY,
//         "width" : width, 
//         "height" : height,
//         "animation" : new Image(),
//         "velocityX" : 0, 
//         "velocityY" : 0,
//         "jumpCount" : 2,
//         "facing": "right", 
//         "facingY" : "down",
//         "deleted": false,
//         "takesDamage": false,
//         "hasGravity" : false,
//         "bouncedOn" : false,
//         "lives" : 3,
//         "visible" : true,
//         "type" : type,
//         "maxSpeed": maxSpeed,
//         "jumpForce": jumpForce,
//         "onYoshi" : false,
//         "distanceX" : 1, //A value from 1 to 0 - determines how much the sprite's position changes during camera movement
//         "distanceY" : 1, //A smaller value means the object moves slower than the camera, giving a feeling of distance
//         "touchingGround" : false,
//         "bounciness" : 0, //A value from 0 to 1 - determines how much velocity is returned when the sprite and ground collide
//         "mode" : "default", //Changed when player goes through portal
//         "isTouching" : {},
//         "spike" : {
//             "direction" : "up"
//         },
//         "spriteSheet" : { 
//             "used" : false,
//             "x" : 0, 
//             "y" : 0,
//             "width" : 0,
//             "height" : 0,
//             "offsetX" : 0,
//             "offsetY" : 0,
//             "currentFrame" : 0,
//             "frameRate" : 0,
//         },
//         "bullet" : {
//             "firedFrom" : ""
//         },
//         "enemy" : "",
//         "powerUp" : {},
//     };
//     sprites.push(newSprite);
//     return newSprite;
// }

// //Sprite animation
// function animateSprite(sprite, startFrame, endFrame){
//     if(sprite.spriteSheet.currentFrame < sprite.spriteSheet.frameRate){
//         sprite.spriteSheet.currentFrame ++
//     }
//     else {
//         sprite.spriteSheet.currentFrame = 0
//         if(sprite.spriteSheet.x < startFrame || sprite.spriteSheet.x > endFrame){
//             sprite.spriteSheet.x = startFrame;
//         }
//         else{
//             sprite.spriteSheet.x ++;
//         }
//     }
// }

// let sky = null //createSprite(0,0, canvas.width, canvas.height);
// let skyRatio = 0;
// let sky2 = null //createSprite(0,0,canvas2.width, canvas2.height)

// let player = createSprite(150, 150, 50, 100, "player");
// let sonic = createSprite(250, 150, 100, 100, "sonic");

// let portals;

// let grounds// = [];
// let enemies// = [];
// let enemyTypes// = [];

// let spikes// = [];

// let bullets = [];

// let endPoint = createSprite(0, 0, 0, 0);

// let flyerCount = 0;
// let enemyCount = 0;

// function setSprites(){
//     music.src = "audio/music" + level + ".mp3"
//     if(!muted){
//         music.play();
//     }
//     playerLives.style.display = "block";
//     if(multiplayer){
//         sonicLives.style.display = "block"
//     }
//     music.currentTime = 0;
//     gameStateMenu.style.display = "none";

//     sprites = [];



//     //Skies
//     let skyData = levels[level].sky;

//     sky = createSprite(0,0, canvas.width, canvas.height)
//     sky.animation.src = skyData.src;
    
//     sky2 = createSprite(0,0,canvas2.width, canvas2.height)
//     sky2.animation.src = skyData.src;

//     sky.animation.onload = function(){
//         skyRatio = sky.animation.width / sky.animation.height;
//         sky.width = canvas.height * skyRatio;
//         sky2.width = canvas2.height * skyRatio;
//         resizeCanvas()
//     }

//     //portals
//     portals = [];
//     let portalData = levels[level].portals;
//     for(let i=0; i<portalData.length; i++){
//         createPortal(portalData[i][0], portalData[i][1], portalData[i][2], portalData[i][3], portalData[i][4])
//     }

//     //power-ups
//     let powerUpData = levels[level].powerUps;
//     for(let i=0; i<powerUpData.length; i++){
//         createPowerUp(powerUpData[i][0], powerUpData[i][1], powerUpData[i][2]);
//     }

//     //yoshi
//     let yoshiData = levels[level].yoshi;
//     for(let i=0; i<yoshiData.length; i++){
//         createYoshi(yoshiData[i][0], yoshiData[i][1]);
//     }
       

//     //Players
//     player = createSprite(150, 150, 50, 100, "player");
//     player.animation = imgCache["player-sprite-sheet"];
//     playerLives.innerText = "Lives: 3"

//     player.spriteSheet.used = true;
//     player.spriteSheet.x = 2;
//     player.spriteSheet.y = 0;
//     player.spriteSheet.width = 300;
//     player.spriteSheet.height = 823;
//     player.spriteSheet.frameRate = 5;
//     player.takesDamage = true;
//     player.hasGravity = true;

//     //Sonic
//     sonic = createSprite(250, 150, 100, 100, "sonic");
//     sonic.animation.src = "images/sonic.png"
//     sonic.takesDamage = true;
//     sonic.hasGravity = true;
//     sonicLives.innerText = "Lives: 3"

//     //grounds
//     grounds = [];
//     let groundData = levels[level].grounds

//     for(i=0; i<10; i++){
//         createGround(i * 300, 250, 300, 150);
//     }
//     for(let i=0; i<groundData.length; i++){
//         createGround(groundData[i][0], groundData[i][1], groundData[i][2], groundData[i][3])
//     }

//     //spikes
//     spikes = [];

//     let spikeData = levels[level].spikes;
//     for(let i=0; i<spikeData.length; i++){
//         createSpike(spikeData[i][0], spikeData[i][1], spikeData[i][2], spikeData[i][3], spikeData[i][4])
//     }

//     //Enemies
//     enemies = []
//     enemyTypes = levels[level].enemyTypes
//     let enemyData = levels[level].enemies

//     for(let i=0; i<enemyData.length; i++){
//         createEnemy(enemyData[i][0], enemyData[i][1], enemyData[i][2], enemyData[i][3], enemyData[i][4])
//     }
    
//     //bullets
//     bullets = [];

//     //create end point for level
//     let endPointData = levels[level].endPoint
//     endPoint = createSprite(endPointData[0], endPointData[1], endPointData[2], endPointData[3]);
//     endPoint.animation.src = "images/santas-sleigh.png";
// }

// function createGround(x, y, width = 100, height = 75){
//     let newGround = (createSprite(x, y, width, height));
//     newGround.animation.src = "images/ground.png"
//     newGround.type = "ground"
//     grounds.push(newGround);
// }

// //Portals
// function createPortal(x, y, width, height, mode = "flying"){
//     let newPortal = createSprite(x,y,width,height);
//     newPortal.animation.src = "images/portal-red.png";
//     newPortal.mode = mode
//     newPortal.type = "portal"
//     portals.push(newPortal);
// }

// function portalLoop(sprite){
//     if(isTouching(sprite, player)){
//         if(player.mode !== sprite.mode){
//             playAudio(healthGain);
//             player.mode = sprite.mode;
//         }
//     }
//     if(isTouching(sprite, sonic)){
//         if(sonic.mode !== sprite.mode){
//             playAudio(healthGain);
//             sonic.mode = sprite.mode;
//         }
//     }
// }

// //power-ups
// function createPowerUp(x, y, stats = []){
//     let newPowerUp = createSprite(x, y, 50, 50, "powerUp");
//     newPowerUp.animation.src = "images/powerUp.png";
//     newPowerUp.powerUp = stats;    
//     console.log(stats)
// }
// function powerUpLoop(sprite){
//     if(isTouching(sprite, player)){
//         console.log(sprite.powerUp);
//         for(let i=0; i<sprite.powerUp.length; i++){
//             player[sprite.powerUp[i][0]] += sprite.powerUp[i][1];
//             if(sprite.powerUp[i][0] === "lives"){
//                 playAudio(healthGain);
//                 playerLives.innerText = "Lives: " + player.lives;
//             }
//         }
//         sprite.deleted = true;
//     }
// }

// //yoshi
// function createYoshi(x, y){
//     let newYoshi = createSprite(x, y, 75, 75, "yoshi");
//     newYoshi.animation.src = "images/yoshi-spritesheet.png";
//     newYoshi.spriteSheet.used = true;
//     newYoshi.spriteSheet.x = 0;
//     newYoshi.spriteSheet.y = 0;
//     newYoshi.spriteSheet.width = 512;
//     newYoshi.spriteSheet.height = 552;
//     newYoshi.spriteSheet.frameRate = 5;

// }
//  function yoshiLoop(sprite){
//     if(isTouching(sprite, player)){
//         player.onYoshi = true;
//         sprite.deleted = true;
//     }
//  }

// //spikes
// function createSpike(x, y, direction = "up", width = 50, height = 50){
//     let newSpike = createSprite(x, y, width, height, "spike");
//     if(direction === "up"){
//         newSpike.animation.src = "images/spike3.png";
//     }
//     else{
//         newSpike.animation.src = "images/spike3-down.png";
//         newSpike.spike.direction = "down"
//     }
//     spikes.push(newSpike);
// }

// function spikeLoop(spike){
//     let spikeCenter = spike.x + spike.width / 2;
//     if(isTouching(spike, player)){
//         if(spike.spike.direction === "up"){
//             if(player.x < spikeCenter && player.x + player.width > spikeCenter){
//                 player.lives --;
//                 playAudio(ouch);
//                 playerLives.innerText = "Lives: " + player.lives;
//             }
//             else{
//                 player.velocityY += gravity;
//             }
//             if(player.x > spike.x){
//                 if(!keys.ArrowUp){
//                     player.y = (spike.y - player.height) + (player.x - spike.x);
//                     player.velocityY = 0;
//                 }
//                 if(player.velocityY > 0){
                    
//                 }
//                 player.velocityX = acceleration * 3;
//             }
//             else {
//                 if(!keys.ArrowUp){
//                     player.y = (spike.y - player.height) + Math.abs(player.x - spike.x) //+ player.width / 2;
//                     player.velocityY = 0;
//                 }
//                 if(player.velocityY > 0){
                    
//                 }
//                 player.velocityX = -acceleration * 3;
    
//             }
//         }
//         else{
//             if(player.x < spikeCenter && player.x + player.width > spikeCenter){
//                 player.lives --;
//                 playAudio(ouch);
//                 playerLives.innerText = "Lives: " + player.lives;
//             }
//             else{
//                 player.velocityY -= gravity;
//             }
//             if(player.x > spike.x){
//                 if(!keys.ArrowUp){
//                     player.y = spike.y //- (player.x - spike.x);
//                     player.velocityY = 0;
//                 }
//                 if(player.velocityY > 0){
                    
//                 }
//                 player.velocityX = acceleration * 3;
//             }
//             else {
//                 if(!keys.ArrowUp){
//                     player.y = spike.y// - Math.abs(player.x - spike.x) //+ player.width / 2;
//                     player.velocityY = 0;
//                 }
//                 if(player.velocityY > 0){
                    
//                 }
//                 player.velocityX = -acceleration * 3;
    
//             }
//         }
        
//     }

//     if(isTouching(spike, sonic)){
//         if(sonic.x < spikeCenter && sonic.x + sonic.width > spikeCenter){
//             sonic.lives --;
//             playAudio(ouch);
//             sonicLives.innerText = "Lives: " + sonic.lives;
//         }
//         else{
//             sonic.velocityY += gravity;
//         }
//         if(sonic.x > spike.x){
//             if(!keys.w){
//                 sonic.y = (spike.y - sonic.height) + (sonic.x - spike.x);
//             }
//             if(sonic.velocityY > 0){
//                 sonic.velocityY = 0;
//             }
//             sonic.velocityX += acceleration * 2;
//         }
//         else {
//             if(!keys.w){
//                 sonic.y = (spike.y - sonic.height) + Math.abs(sonic.x - spike.x) + sonic.width / 2;
//             }
//             if(sonic.velocityY > 0){
//                 sonic.velocityY = 0;
//             }
//             sonic.velocityX -= acceleration * 2;

//         }
//     }
//     for(let i=0; i<enemies.length; i++){
//         collide(enemies[i], spike);
//     }
    
// }

// //enemies
// function createEnemy(x, y, width = 50, height = 50, enemyType = "goomba"){
//     let newEnemy = createSprite(x, y, width, height, "enemy");

//     enemies.push(newEnemy);
//     newEnemy.takesDamage = true;
//     if(enemyType !== "ghost" && enemyType !== "flyer"){
//         newEnemy.hasGravity = true;
//     }
    
//     newEnemy.velocityX  = enemySpeed;
//     if(newEnemy.width <= 50){
//         newEnemy.lives = 1;
//     }
//     else{
//         newEnemy.lives = Math.floor(newEnemy.width / 50) * 2;
//     }
//     newEnemy.animation = imgCache[enemyType];
//     newEnemy.enemy = {
//         "type" : enemyType
//     }
//     return newEnemy;
// }

// function enemyLoop(sprite){
//     if(isInBounds(sprite) && sprite.visible === true){
//         if(isTouching(sprite, player) && !sprite.deleted){
//             mutualCollide(player, sprite, 1);
//             if(sprite.bouncedOn){
//                 sprite.deleted = true;
//             }
//             else if(sprite.enemy.type === "flyer"){
//                 if(player.bouncedOn){
//                     player.lives --;
//                     playerLives.innerText = "Lives: " + player.lives
//                     playAudio(ouch);
//                 }
//                 else{
//                     player.lives ++;
//                     playerLives.innerText = "Lives: " + player.lives
//                     playAudio(kiss);
//                 }
//             }
//             else if(sprite.enemy.type === "goomba"){
//                 player.lives --;
//                 playerLives.innerText = "Lives: " + player.lives;
//                 sprite.deleted = true;
//                 playAudio(ouch)
//             }
//         }

//         else if(isTouching(sprite, sonic)){
//             mutualCollide(sonic, sprite, 1);
//             if(sprite.bouncedOn){
//                 sprite.deleted = true;  
//             }
//             else if(sprite.enemy.type === "flyer"){
//                 if(sonic.bouncedOn){
//                     sonic.lives --;
//                     sonicLives.innerText = "Lives: " + sonic.lives
//                     playAudio(ouch)
//                 }
//                 else{
//                     sonic.lives ++;
//                     sonicLives.innerText = "Lives: " + sonic.lives
//                     playAudio(kiss);
//                 }
//             }
//             else if(sprite.enemy.type === "goomba"){
//                 sonic.lives --;
//                 sonicLives.innerText = "Lives: " + sonic.lives;
//                 sprite.deleted = true;
//                 playAudio(ouch)

//             }
//         }
//         if(!isTouching(sprite, player && !isTouching(sprite, sonic))){
//             if(Math.abs(sprite.velocityX !== 3) && sprite.enemy.type !== "flyer"){
//                 sprite.velocityX = -3;
//             }
//         }

//         if(sprite.enemy.type === "robot" && isInBounds(sprite)){
//             if(getRandomNumber(1, robotShootRate) === 1){
//                 if(player.x < sprite.x){
//                     sprite.facing = "left"
//                 }
//                 else{
//                     sprite.facing = "right"
//                 }
//                 shootBullet(sprite)
//             }
//         }

//         else if(sprite.enemy.type === "flyer"){
//             if(player.x < sprite.x){
//                 if(sprite.velocityX > 0){
//                     if(sprite.isTouchingGround){
//                         sprite.velocityX = Math.abs(sprite.velocityX) * -1
//                     }
//                 }
//                 if(Math.abs(sprite.velocityX) < maxSpeed){
//                     sprite.velocityX -= acceleration * 0.9;
//                 }
                
//                 sprite.facing = "left";
//             }
//             else if(player.x > sprite.x){
//                 if(sprite.velocityX < 0){
//                     if(sprite.isTouchingGround){
//                         sprite.velocityX = Math.abs(sprite.velocityX)
//                     }
                    
//                 }
//                 if(Math.abs(sprite.velocityX) < maxSpeed){
//                     sprite.velocityX += acceleration * 0.9;
//                 }
//                 sprite.facing = "right"
//             }
//             else{
//                 sprite.velocityX = 0;
//             }
//             if(!isNextToGround(sprite, 0, true, false)){
//                 sprite.velocityX = sprite.velocityX * -1;
                
//             }
           
//             if(isTouchingGround(sprite)){
//                 sprite.isTouchingGround = true;
//                 for(let i=0; i<grounds.length; i++){
//                     collide(sprite, grounds[i])
//                 } 
//                 sprite.velocityY = 0;
//                 if(sprite.x > player.x){
//                     sprite.animation = imgCache.flyer
//                 }
//                 else{
//                     sprite.animation = imgCache.flyerRight
//                 }
//             }
//             if(sprite.isTouchingGround){
//                 for(let i=0; i<grounds.length; i++){
//                     collide(sprite, grounds[i])
//                 } 
//                 sprite.velocityY = 0;
//                 if(getRandomNumber(1,10) === 1){
//                     //sprite.velocityY = -1 * sprite.velocityY
//                     sprite.y -= 2;
//                     sprite.velocityY = -1 * getRandomNumber(25, 35);
//                     sprite.isTouchingGround = false;
//                     if(sprite.x > player.x){
//                         sprite.animation = imgCache.flyerJump
//                     }
//                     else{
//                         sprite.animation = imgCache.flyerJumpRight
//                     }
//                 }
//             }
//             else{
//                 sprite.velocityY += gravity;
//             }
//         }
//         if(!isNextToGround(sprite) && sprite.enemy.type !== "flyer"){
//             sprite.velocityX = sprite.velocityX * -1;
//         }
//     }
//     else if(sprite.enemy.type === "ghost"){
//         let thresholdX = Math.abs(player.x - sprite.x);
//         let thresholdY = Math.abs(player.y - sprite.y)

//         if(thresholdX > player.width){
//             if(player.x < sprite.x){
//                 sprite.velocityX -= acceleration;
//             }
//             else if(player.x > sprite.x){
//                 if(sprite.velocityX < 0){
//                     sprite.velocityX = Math.abs(acceleration)
//                 }
//                 sprite.velocityX += acceleration;
                
//             }
//         }
//         else{
//             sprite.velocityX = 0
//         }
//         if(thresholdY > player.height) {
//             if(player.y - player.height < sprite.y){
//                  sprite.velocityY = -3;
//              }
//             else if(player.y > sprite.y){
//                 sprite.velocityY = 3;
//             }
            
//         }
//         else{
//             if(getRandomNumber(0,1000) === 1){
//                 sprite.velocityY = -1 * sprite.velocityY
//             }
//         }
//         if(sprite.y + sprite.height > 250){
//             sprite.velocityY = -1 * sprite.velocityY
//         }
        
        
//     }
//     else{
//         sprite.velocityX = 0;
//     }


// }

// function bulletLoop(bullet){
//     if(isInBounds(bullet)){
//         for(let j=0; j<sprites.length; j++){
//             if(isTouching(bullet, sprites[j]) && sprites[j].takesDamage){
//                 if(bullet.bullet.firedFrom !== sprites[j]){
//                     sprites[j].lives -= 1;
//                     bullet.deleted = true;
//                     if(sprites[j] === player || sprites[j] === sonic){
//                         playAudio(ouch);
//                         if(sprites[j] === player){
//                             playerLives.innerText = "Lives: " + player.lives;
//                         }
//                         else{
//                             sonicLives.innerText = "Lives: " + sonic.lives;
//                         }
//                     }
//                 }  
//             }
//         }
//     }
//     else{
//         bullet.deleted = true;
//     }
// }