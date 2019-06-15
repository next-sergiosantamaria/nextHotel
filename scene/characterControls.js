keyControls = function(avatarObject) {

    this.mouseClicked = false;
    let xSpeed = ySpeed = 0.02;

    document.getElementById("container").onmousedown  = function(){this.mouseClicked = true;}
    document.getElementById("container").onmouseup  = function(){this.mouseClicked = false;}
    document.getElementById("container").onmousemove = function(event){
        if(this.mouseClicked) {
            mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
            raycaster.setFromCamera( mouse, camera );
            if( planta.children.length > 0 ) {
                let intersects = raycaster.intersectObject( planta.children[0].children[0]);
                if ( intersects.length > 0 ) {
                    movement({ x: intersects[0].point.x, y: 0, z: intersects[0].point.z }, avatar.position, 0, 500, TWEEN.Easing.Linear.None);
                    avatarObject.lookAt( intersects[0].point.x, 0, intersects[0].point.z );
                }
            }
        }
    }
    
    document.onkeydown = function(event) {
        switch( true ){
            //move up
            case event.key == "w" || event.key == "ArrowUp":
                avatarObject.position.x -= ySpeed;
                //camera.position.x -= ySpeed;
                avatarObject.rotation.y = -Math.PI / 2;
            break; 
            //move down
            case event.key == "s" || event.key == "ArrowDown":
                avatarObject.position.x += ySpeed;
                //camera.position.x += ySpeed;
                avatarObject.rotation.y = Math.PI / 2;
            break; 
            //move left
            case event.key == "a" || event.key == "ArrowLeft":
                avatarObject.position.z += xSpeed;
                //camera.position.z += xSpeed;
                avatarObject.rotation.y = 0;
            break; 
            //move right
            case event.key == "d" || event.key == "ArrowRight":
                avatarObject.position.z -= xSpeed;
                //camera.position.z -= xSpeed;
                avatarObject.rotation.y = Math.PI;
            break; 
        }
    };
    document.onkeyup = function(){
        if (avatarObject.position.x > 1) { xSpeed = -0.02; ySpeed = -0.02; }
        else { xSpeed = 0.02; ySpeed = 0.02; }
    };
};