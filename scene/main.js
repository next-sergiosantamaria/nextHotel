var camera, scene, renderer, controls, 
    width = window.innerWidth,
    height = window.innerHeight;

var clock = new THREE.Clock();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var mouseClicked = false;

var manager = new THREE.LoadingManager();

var interactivos = new THREE.Object3D();
interactivos.name = 'interactiveElements';

var avatar = new THREE.Object3D();
avatar.name = 'avatar';

var plantas = ['manoteras', 'tablas2-P1', 'tablas2-P0', 'tablas2-P2'];

$(document).ready(function () {
    generateMenu();
    initRender();
    animate();
});

function generateMenu(){
    plantas.map(function(plantName){
        $(".plantSelectMenu").append('<div class="plantSelectButton" onclick=loadOffice("'+plantName+'")>'+plantName+'</div>');
    });
}

function initRender() {

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true, alpha: true});
    renderer.sortObjects = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    renderer.setViewport(0, 0, width, height);
    renderer.getMaxAnisotropy();

    element = renderer.domElement;

    var container = document.getElementById('container');
    container.appendChild(element);
    
    scene.add(avatar);
    scene.add(interactivos);

    camera = new THREE.PerspectiveCamera(60, (width / height), 0.01, 10000000);
    camera.position.set(1, 2, 0);
    camera.lookAt(avatar.position);

    scene.add(camera);

    /*controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.dampingFactor = 0.70;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = true;
    controls.target.set(0,0,0);*/

    ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    ambientLight.position.set(0, 0.6, 0);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(3,3,3);
    scene.add( directionalLight );
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('container').addEventListener( 'mousemove', onMouseMove, false );
    document.getElementById('container').addEventListener ("mousedown", function () {mouseClicked = true}, false);
    document.getElementById('container').addEventListener ("mouseup", function () {mouseClicked = false}, false);
   
}

function loadAvatar() {
    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            if (percentComplete == 100) {
                console.log('Avatar model loaded!!');
            }
        }
    };
    var onError = function (xhr) {
    };
    
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.setMaterialOptions ( { side: THREE.DoubleSide } );
    mtlLoader.load('testAvatar'+'.mtl', function (materials) {
        console.log(materials);
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load('testAvatar'+'.obj', function (elements) {
            avatar.add(elements);
            //elements.position.set(0,0,-2.22);
        }, onProgress, onError); 
    });
}

function loadOffice(officeName) {
    $('#container').removeClass('displayOn');
    plantas.map(function(plantName){
        scene.remove(scene.getObjectByName( plantName ));
    });

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            if (percentComplete == 100) {
                console.log(officeName+' model loaded!!');
            }
        }
    };
    var onError = function (xhr) {
    };
    
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.setMaterialOptions ( { side: THREE.DoubleSide } );
    mtlLoader.load(officeName+'.mtl', function (materials) {
        console.log(materials);
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load(officeName+'.obj', function (elements) {
            elements.children.map(function(interactiveObject) {
                interactiveObject.name = interactiveObject.name.replace(/_[a-z]*.[0-9]*/gi, "");
                //console.log(interactiveObject.material);
                if(Array.isArray(interactiveObject.material)){
                    interactiveObject.material.map(function(mat){ 
                        if(mat.name.substring(0,11) == 'transparent') mat.transparent = true;
                    });
                }
                else if(interactiveObject.material.name.substring(0,11) == 'transparent') interactiveObject.material.transparent = true;
            });
            elements.name = officeName;
            interactivos.add(elements);
            $('#container').addClass('displayOn');
            loadAvatar();
        }, onProgress, onError); 
    });
}

var xSpeed = 0.02;
var ySpeed = 0.02;

document.onkeydown = function(event) {
    console.log(event.which);
    switch( true ){
        case event.which == 87 || event.which == 38:
            avatar.position.x -= ySpeed;
            //camera.position.x -= ySpeed;
            avatar.rotation.y = -Math.PI / 2;
        break; 
        case event.which == 83 || event.which == 40:
            avatar.position.x += ySpeed;
            //camera.position.x += ySpeed;
            avatar.rotation.y = Math.PI / 2;
        break; 
        case event.which == 65 || event.which == 37:
            avatar.position.z += xSpeed;
            //camera.position.z += xSpeed;
            avatar.rotation.y = 0;
        break; 
        case event.which == 68 || event.which == 39:
            avatar.position.z -= xSpeed;
            //camera.position.z -= xSpeed;
            avatar.rotation.y = Math.PI;
        break; 
    }
};


document.onkeyup = function(){
    if (avatar.position.x > 1) { xSpeed = -0.02; ySpeed = -0.02; }
    else  { xSpeed = 0.02; ySpeed = 0.02; }
};

function onMouseMove( event ) {
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    // See if the ray from the camera into the world hits one of our meshes
    var intersects = raycaster.intersectObject( interactivos.children[0].children[0]);
    if ( intersects.length > 0 ) {
       if(mouseClicked) {
           console.log(intersects[0].point);
           movement({ x: intersects[0].point.x, y: 0, z: intersects[0].point.z }, avatar.position, 0, 4000, TWEEN.Easing.Quartic.Out);
           avatar.lookAt( intersects[0].point.x, 0, intersects[0].point.z );
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  camera.updateMatrixWorld();
  
  camera.lookAt(avatar.position);
  
  if (controls) {
    controls.update(clock.getDelta());
  }
  render();
  TWEEN.update();
}

function render() {
    renderer.render(scene, camera);
}

function movement(value, object, delay, duration, easingType) {
    var tween = new TWEEN.Tween(object)
        .to(value, duration)
        .easing(easingType)
        .onUpdate(function () {
        })
        .delay(delay)
        .start();
}

