window.addEventListener('resize', onWindowResize, false);

//Debugg options
//Select true for skip config menu and seek to scene directly
let debbugerSkipOption = true;
//select type of controls = "camera" for free camera control or "avatar" for avatar keys control
const typeOfControls = "avatar"; // options: ["avatar", "camera"]

let camera, scene, renderer, controls, avatarControls, collisionCube, previousCollision,
    width = window.innerWidth,
    height = window.innerHeight;

let clock = new THREE.Clock();

let manager = new THREE.LoadingManager();

let planta = new THREE.Object3D();
planta.name = 'planta';

let avatar = new THREE.Object3D();
avatar.name = 'avatar';

let interactiveObjects = [];

const plantas = ['manoteras', 'tablas2-P1', 'tablas2-P0', 'tablas2-P2'];
const modelos_head = ['head_1', 'head_2','head_3', 'head_4', 'head_5'];
const modelos_body = ['body_1','body_2','body_3','body_4', 'body_5', 'body_6'];

let initialBody = initialHead = 0;

let avatarConfig = { head: 'head_1', body: 'body_1' };

let saveData = {};

let turnOnCollision = false;

collisionDirection = new THREE.Vector3( 0, 0, 0 );

$(document).ready(function () {
    generateMenu();
    initRender();
    animate();
    if(localStorage.getItem('configDataObject') !== null && debbugerSkipOption == true){
        skipMenus(JSON.parse( localStorage.getItem('configDataObject')));
    }
    if( debbugerSkipOption == false ) localStorage.removeItem('configDataObject');
});

function generateMenu(){
    plantas.map(function(plantName){
        $(".officeSelectorMenu").prepend('<div class="plantSelectButton" onclick=loadOffice("'+plantName+'")>'+plantName+'</div>');
    });
}

function setHead(value){
    initialHead += value;
    if(initialHead < 0) initialHead = modelos_head.length -1;
    if(initialHead > modelos_head.length -1) initialHead = 0;
    console.log(initialHead);
    if( typeof modelos_head[initialHead] !== 'undefined'  ) {
        document.getElementById("selectorHeadBox").src = 'images/avatarHeads/'+ modelos_head[initialHead] +'.png';
        avatarConfig.head = modelos_head[initialHead];
    }
}

function setBody(value){
    initialBody += value;
    if(initialBody < 0) initialBody = modelos_body.length -1;
    if(initialBody > modelos_body.length -1) initialBody = 0;
    if( typeof modelos_body[initialBody] !== 'undefined'  ) {
        document.getElementById("selectorBodyBox").src = 'images/avatarBodies/'+ modelos_body[initialBody] +'.png';
        avatarConfig.body = modelos_body[initialBody];
    }
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

    camera = new THREE.PerspectiveCamera(60, (width / height), 0.01, 10000000);
    camera.position.set(1, 2, 0);

    scene.add(camera);

    switch(typeOfControls){
        case "camera":
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.70;
            controls.enableZoom = true;
            controls.enableRotate = true;
            controls.enablePan = true;
            controls.target.set(0,0,0);
        break;
        case "avatar":
            avatarControls = new keyControls(avatar);
            camera.lookAt(avatar.position);
        break;    
    };

    ambientLight = new THREE.AmbientLight(0xffffff, 1);
    ambientLight.position.set(0, 0.6, 0);
    scene.add(ambientLight);

    let directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set(3,3,3);
    scene.add( directionalLight );
}

function loadAvatar(parts) {

    //remove previous avatar elements created
    avatar.remove(avatar.children[1]);
    avatar.remove(avatar.children[0]);

    //Promise to control de % of objects loading
    let onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            let percentComplete = xhr.loaded / xhr.total * 100;
            console.log(percentComplete);
            if (percentComplete == 100) {
                console.log('Avatar model loaded!!');
            }
        }
    };
    let onError = function (xhr) {
    };

    //load selected head and add to avatar group 
    let headLoader = new THREE.MTLLoader();
    headLoader.setPath('models/avatars/heads/');
    headLoader.setMaterialOptions ( { side: THREE.DoubleSide } );
    headLoader.load( parts.head +'.mtl', function (materials) {
        materials.preload();
        let headObjLoader = new THREE.OBJLoader();
        headObjLoader.setMaterials(materials);
        headObjLoader.setPath('models/avatars/heads/');
        headObjLoader.load( parts.head+'.obj', function (elements) {
            avatar.add(elements);
        }, onProgress, onError);
    });

    //load selected body & add to avatar group
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/avatars/bodies/');
    mtlLoader.setMaterialOptions ( { side: THREE.DoubleSide } );
    mtlLoader.load( parts.body +'.mtl', function (materials) {
        materials.preload();
        let objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/avatars/bodies/');
        objLoader.load( parts.body +'.obj', function (elements) {
            avatar.add(elements);
        }, onProgress, onError);
    });

    //adding cube inside avatar model to check collisions
    let collisionCubeGeometry = new THREE.BoxGeometry(0.07, 0.06, 0.06);
    let collisionCubeMaterial = new THREE.MeshLambertMaterial({color: 0xff2255});
    collisionCube = new THREE.Mesh(collisionCubeGeometry, collisionCubeMaterial);
    collisionCube.name = 'collisionCube';
    collisionCube.visible = true;
    collisionCube.position.y = 0.06;
    avatar.add(collisionCube);
    turnOnCollision = true;
    scene.add(avatar);
}

function loadOffice(officeName) {
    interactiveObjects = [];
    tl.tweenTo("openApp");
    $('#container').removeClass('displayOn');
    planta.remove(planta.children[0]);
    let onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            let percentComplete = xhr.loaded / xhr.total * 100;
            console.log(percentComplete);
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
            elements.children.map(function(plantObject) {
                plantObject.name = plantObject.name.replace(/_[a-z]*.[0-9]*/gi, "");
                if( plantObject.name.match("interact")){
                    interactiveObjects.push(plantObject);
                }
                if(Array.isArray(plantObject.material)){
                    plantObject.material.map(function(mat){
                        if(mat.name.substring(0,11) == 'transparent') mat.transparent = true;
                    });
                }
                else if(plantObject.material.name.substring(0,11) == 'transparent') plantObject.material.transparent = true;
                
            });
            elements.name = officeName;
            planta.add(elements);
            $('#container').addClass('displayOn');
            loadAvatar(avatarConfig);
        }, onProgress, onError);
    });
    scene.add(planta);
    if(debbugerSkipOption == true) {
        Object.assign(saveData, avatarConfig, { office: officeName });
        localStorage.setItem('configDataObject', JSON.stringify(saveData));
    }
}

function skipMenus(savedDatas){
    Object.assign(avatarConfig, {head: savedDatas["head"], body: savedDatas["body"]});
    tl.seek( '-=0', false );
    loadOffice(savedDatas.office); 
}

function checkCollision(cube) {
    var wpVector = new THREE.Vector3();
    var originPoint = cube.getWorldPosition(wpVector).clone();
    for (var vertexIndex = 0; vertexIndex < cube.geometry.vertices.length; vertexIndex++) {
        var localVertex = cube.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(cube.matrix);
        var directionVector = globalVertex.sub(cube.position);
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(interactiveObjects);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            if( previousCollision == collisionResults[0].object.name ){
                collisionDirection = collisionResults[0].point.clone().normalize().round();
                console.log(collisionDirection);
            }
            else {
                previousCollision = collisionResults[0].object.name;
                console.log(collisionResults[0].object.name);
            }
        } else {
            collisionDirection = new THREE.Vector3( 0, 0, 0); 
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

    setTimeout(function() {
        requestAnimationFrame(animate);
    }, 1000 / 30);

    camera.updateMatrixWorld();

    if (controls) {
        controls.update(clock.getDelta());
    }
    if ( avatarControls != undefined ) {
            // camera.lookAt(avatar.position);
            avatar.position.z += avatarControls.direction.z();
            avatar.position.x -= avatarControls.direction.x();
    }
    render();
    TWEEN.update();
}

function render() {
    renderer.render(scene, camera);
    if(turnOnCollision) checkCollision(collisionCube);
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
