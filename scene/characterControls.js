keyControls = function(object) {

    this.mouseClicked = false;
    this.xSpeed = this.ySpeed = 0.02;

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
                    object.lookAt( intersects[0].point.x, 0, intersects[0].point.z );
                }
            }
        }
    }
    
    document.getElementById("container").onkeydown = function(event) {
        console.log(event);
        switch( true ){
            //move up
            case event.key == "w" || event.key == "ArrowUp":
                object.position.x -= this.ySpeed;
                //camera.position.x -= ySpeed;
                object.rotation.y = -Math.PI / 2;
            break; 
            //move down
            case event.key == "s" || event.key == "ArrowDown":
                object.position.x += this.ySpeed;
                //camera.position.x += ySpeed;
                object.rotation.y = Math.PI / 2;
            break; 
            //move left
            case event.key == "a" || event.which == "ArrowLeft":
                object.position.z += this.xSpeed;
                //camera.position.z += xSpeed;
                object.rotation.y = 0;
            break; 
            //move right
            case event.key == "d" || event.key == "ArrowRight":
                object.position.z -= this.xSpeed;
                //camera.position.z -= xSpeed;
                object.rotation.y = Math.PI;
            break; 
        }
    };
    
    document.onkeyup = function(){
        if (object.position.x > 1) { this.xSpeed = -0.02; this.ySpeed = -0.02; }
        else { this.xSpeed = 0.02; this.ySpeed = 0.02; }
    };
};