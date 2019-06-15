window.addEventListener('resize', onWindowResize, false);

let camera, scene, renderer, controls, 
    width = window.innerWidth,
    height = window.innerHeight;

let clock = new THREE.Clock();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let manager = new THREE.LoadingManager();

let planta = new THREE.Object3D();
planta.name = 'planta';

let avatar = new THREE.Object3D();
avatar.name = 'avatar';

let plantas = ['manoteras', 'tablas2-P1', 'tablas2-P0', 'tablas2-P2'];

const avatarControls = new keyControls(avatar);

$(document).ready(function () {
    generateMenu();
    initRender();
    animate();
});

function generateMenu(){
    plantas.map(function(plantName){
        $(".officeSelectorMenu").prepend('<div class="plantSelectButton" onclick=loadOffice("'+plantName+'")>'+plantName+'</div>');
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

    let container = document.getElementById('container');
    container.appendChild(element);
    element.id = "svgObject";
    
    scene.add(avatar);
    scene.add(planta);

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

    let directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(3,3,3);
    scene.add( directionalLight );
}

function loadAvatar() {
    let onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            let percentComplete = xhr.loaded / xhr.total * 100;
            if (percentComplete == 100) {
                console.log('Avatar model loaded!!');
            }
        }
    };
    let onError = function (xhr) {
    };
    
    let headLoader = new THREE.MTLLoader();
    headLoader.setPath('models/avatars/heads/');
    headLoader.setMaterialOptions ( { side: THREE.DoubleSide } );
    headLoader.load('head_2'+'.mtl', function (materials) {
        materials.preload();
        let headObjLoader = new THREE.OBJLoader();
        headObjLoader.setMaterials(materials);
        headObjLoader.setPath('models/avatars/heads/');
        headObjLoader.load('head_2'+'.obj', function (elements) {
            avatar.add(elements);
        }, onProgress, onError); 
    });
    
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/avatars/bodies/');
    mtlLoader.setMaterialOptions ( { side: THREE.DoubleSide } );
    mtlLoader.load('body_2'+'.mtl', function (materials) {
        materials.preload();
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/avatars/bodies/');
        objLoader.load('body_2'+'.obj', function (elements) {
            avatar.add(elements);
        }, onProgress, onError); 
    });
}

function loadOffice(officeName) {
    tl.tweenTo("openApp");
    $('#container').removeClass('displayOn');
    planta.remove(planta.children[0]);
    let onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            let percentComplete = xhr.loaded / xhr.total * 100;
            if (percentComplete == 100) {
                console.log(officeName+' model loaded!!');
            }
        }
    };
    let onError = function (xhr) {
    };
    
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/');
    mtlLoader.setMaterialOptions ( { side: THREE.DoubleSide } );
    mtlLoader.load(officeName+'.mtl', function (materials) {
        materials.preload();
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/');
        objLoader.load(officeName+'.obj', function (elements) {
            elements.children.map(function(interactiveObject) {
                interactiveObject.name = interactiveObject.name.replace(/_[a-z]*.[0-9]*/gi, "");
                if(Array.isArray(interactiveObject.material)){
                    interactiveObject.material.map(function(mat){ 
                        if(mat.name.substring(0,11) == 'transparent') mat.transparent = true;
                    });
                }
                else if(interactiveObject.material.name.substring(0,11) == 'transparent') interactiveObject.material.transparent = true;
            });
            elements.name = officeName;
            planta.add(elements);
            $('#container').addClass('displayOn');
            loadAvatar();
        }, onProgress, onError); 
    });
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
    new TWEEN.Tween(object)
        .to(value, duration)
        .easing(easingType)
        .onUpdate(function () {
        })
        .delay(delay)
        .start();
}
