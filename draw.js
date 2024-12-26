function drawSprites() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0; i < sprites.length; i++){
        if(sprites[i] !== sky2 && sprites[i].visible){
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
            if(sprites[i] !== sky && sprites[i].visible){
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