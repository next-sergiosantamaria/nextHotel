keyControls = function(avatarObject) {

    this.mouseClicked = false;
    this.moveSpeed = 0.02;
    
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.direction = { "x":0, "y":0, "z":0 };
    
    document.getElementById("container").onmousedown  = () => {this.mouseClicked = true;}
    document.getElementById("container").onmouseup  = () => {this.mouseClicked = false;}
    document.getElementById("container").onmousemove = (event) => {
        if(this.mouseClicked) {
            this.mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
            this.raycaster.setFromCamera( this.mouse, camera );
            if( planta.children.length > 0 ) {
                let intersects = this.raycaster.intersectObject( planta.children[0].children[0]);
                if ( intersects.length > 0 ) {
                    movement({ x: intersects[0].point.x, y: 0, z: intersects[0].point.z }, avatar.position, 0, 500, TWEEN.Easing.Linear.None);
                    avatarObject.lookAt( intersects[0].point.x, 0, intersects[0].point.z );
                }
            }
        }
    }
    
    document.onkeydown = (event) => {
        switch( true ){
            //move up
            case event.key == "w" || event.key == "ArrowUp":
                this.moveForward = true;
                if( this.moveSpeed > 0 ) avatarObject.rotation.y = -Math.PI / 2;
                else avatarObject.rotation.y = Math.PI / 2;
            break; 
            //move down
            case event.key == "s" || event.key == "ArrowDown":
                this.moveBackward = true;
                if( this.moveSpeed > 0 ) avatarObject.rotation.y = Math.PI / 2;
                else avatarObject.rotation.y = -Math.PI / 2;
            break; 
            //move left
            case event.key == "a" || event.key == "ArrowLeft":
                this.moveLeft = true;
                if( this.moveSpeed > 0 ) avatarObject.rotation.y = 0;
                else avatarObject.rotation.y = Math.PI;
            break; 
            //move right
            case event.key == "d" || event.key == "ArrowRight":
                this.moveRight = true;
                if( this.moveSpeed > 0 ) avatarObject.rotation.y = Math.PI;
                else avatarObject.rotation.y = 0;
            break; 
        }
        this.direction.x = ( Number( this.moveForward ) - Number( this.moveBackward )) * this.moveSpeed;
        this.direction.z = ( Number( this.moveLeft ) - Number( this.moveRight )) * this.moveSpeed;
    };
    document.onkeyup = () => {
        this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = false;    
        this.direction.x = 0;
        this.direction.z = 0;
        if (avatarObject.position.x > 1) { this.moveSpeed = -Math.abs(this.moveSpeed); }
        else { this.moveSpeed = Math.abs(this.moveSpeed); }
    };
};