const ZERO = () => 0;
const UP = 1;
const DOWN = -1;
const LEFT = 1;
const RIGHT = -1;

keyControls = function(avatarObject) {

    this.mouseClicked = false;
    this.moveSpeed = 0.02;
    
    this.moveX = ZERO;
    this.moveZ = ZERO;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.direction = { x: ZERO, y: ZERO, z: ZERO };
    
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
                // rotate
                this.moveSpeed > 0 ? avatarObject.rotation.y = -Math.PI / 2 : avatarObject.rotation.y = Math.PI / 2;
                // move
                this.direction.x = () => collisionDirection.x <= 0 ? UP * this.moveSpeed : 0;
            break; 
            //move down
            case event.key == "s" || event.key == "ArrowDown":
                // rotate
                this.moveSpeed > 0 ? avatarObject.rotation.y = Math.PI / 2 : avatarObject.rotation.y = -Math.PI / 2;
                // move
                this.direction.x = () => collisionDirection.x >= 0 ? DOWN * this.moveSpeed : 0;
            break; 
            //move left
            case event.key == "a" || event.key == "ArrowLeft":
                // rotate
                this.moveSpeed > 0 ? avatarObject.rotation.y = 0 : avatarObject.rotation.y = Math.PI;
                // move
                this.direction.z = () => collisionDirection.z >= 0 ? LEFT * this.moveSpeed : 0;
            break; 
            //move right
            case event.key == "d" || event.key == "ArrowRight":
                // rotate
                this.moveSpeed > 0 ? avatarObject.rotation.y = Math.PI : avatarObject.rotation.y = 0;
                // move
                this.direction.z = () => collisionDirection.z <= 0 ? RIGHT * this.moveSpeed : 0;
            break; 
        }
    };
    document.onkeyup = () => {
        // this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = false;    
        this.direction.x = () => 0;
        this.direction.z = () => 0;
        if (avatarObject.position.x > 1) { this.moveSpeed = -Math.abs(this.moveSpeed); }
        else { this.moveSpeed = Math.abs(this.moveSpeed); }
    };
};