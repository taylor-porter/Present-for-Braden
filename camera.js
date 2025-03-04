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

}