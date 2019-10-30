window.addEventListener('resize', onWindowResize, false);
//Debugg options
//Select true for skip config menu and seek to scene directly
let debbugerSkipOption = false;
//select type of controls = "camera" for free camera control or "avatar" for avatar keys control
const typeOfControls = "avatar";// options: ["avatar", "camera"]

let camera, scene, renderer, controls, avatarControls, collisionCube, previousCollision, animLoader, 
headanimLoader, mixer, headmixer, bodyModel, headModel, avatarAnimations, avatarHeadAnimation, socket, ownavatarName,
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

let jumping = false;

$(document).ready(function () {
    generateMenu();
    initRender();
    animate();
    if(localStorage.getItem('configDataObject') !== null && debbugerSkipOption == true){
        skipMenus(JSON.parse( localStorage.getItem('configDataObject')));
    }
    if( debbugerSkipOption == false ) localStorage.removeItem('configDataObject');
    //var socket = io.connect('http://34.240.9.59:3031', { 'forceNew': true });
    socket = io.connect('http://192.168.0.157:3031', { 'forceNew': true });

    socket.on('setNewUser', function (data) {
        console.log('un nuevo usuario aparece', data.name);
        if( data.name !==  ownavatarName ) loadAvatar(data.name);
    });
    
    socket.on('refreshUsers', function (data) {
        console.log('actualuzar usuarios: ', data.position);
    });
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
    renderer.gammaOutput = true;
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

function loadAvatar(externalAvatar) {

    //remove previous avatar elements created
    scene.remove(avatar);
    for (var i = avatar.children.length - 1; i >= 0; i--) {
        avatar.remove(avatar.children[i]);
    }

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

    animLoader = new THREE.GLTFLoader();
    animLoader.load( 'models/avatars/bodies/' + avatarConfig.body + '.glb', function ( gltf ) {
        bodyModel = gltf.scene;
        avatarAnimations = gltf.animations;
        bodyModel.name = 'body';
        avatar.add( bodyModel );
        mixer = new THREE.AnimationMixer( bodyModel );
    }, onProgress, onError);

    headanimLoader = new THREE.GLTFLoader();
    headanimLoader.load( 'models/avatars/heads/' + avatarConfig.head + '.glb', function ( gltf ) {
        headModel = gltf.scene;
        avatarHeadAnimation = gltf.animations;
        headModel.name = 'head';
        avatar.add( headModel );
        headmixer = new THREE.AnimationMixer( headModel );
    }, onProgress, onError);

    //adding cube inside avatar model to check collisions
    let collisionCubeGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    let collisionCubeMaterial = new THREE.MeshLambertMaterial({color: 0xff2255});
    collisionCube = new THREE.Mesh(collisionCubeGeometry, collisionCubeMaterial);
    collisionCube.name = 'collisionCube';
    collisionCube.visible = false;
    collisionCube.position.y = 0.06;
    avatar.add(collisionCube);
    avatar.name = externalAvatar ? externalAvatar : ownavatarName;
    turnOnCollision = true;
    scene.add(avatar);
    avatarControls.checkCollision = () => checkCollision(collisionCube);
    if(!externalAvatar) {
        ownavatarName = document.getElementById("inputaNameLabel").value;
        socket.emit('userAparition',{name: ownavatarName, avatarConfig: avatarConfig });
    }
    setInterval(() => { 
        socket.emit('avatarstatus', { name: ownavatarName, position: avatar.position, status: avatarControls.action }); 
    }, 1000);
}

function loadOffice(officeName) {
    interactiveObjects = [];
    tl.tweenTo("openApp");
    $('#container').removeClass('displayOn');
    scene.remove(planta);
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
                plantObject.name = plantObject.name.replace('interact','');
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
        Object.assign(saveData, avatarConfig, { office: officeName }, { userName: document.getElementById("inputaNameLabel").value });
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
    var nearCol;
    for (var vertexIndex = 0; vertexIndex < cube.geometry.vertices.length; vertexIndex++) {
        var localVertex = cube.geometry.vertices[vertexIndex].clone();
        var globalVertex = localVertex.applyMatrix4(cube.matrix);
        var directionVector = globalVertex.sub(cube.position);
        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        var collisionResults = ray.intersectObjects(interactiveObjects);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            nearCol = collisionResults.reduce((max = {}, item) => item.distance < max.distance ? max : item);
            avatarControls.blockIfCollision();
            if( previousCollision == nearCol.object.name ){
                doSomething(nearCol.object.name);
                debug(nearCol, originPoint);
                return nearCol;
            }
            else {
                previousCollision = nearCol.object.name;
                debug(nearCol, originPoint);
                return nearCol;
            }
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

    var dt = clock.getDelta();
    if ( mixer ) mixer.update( dt );
    if ( headmixer ) headmixer.update( dt );

    camera.updateMatrixWorld();

    if (controls) {
        controls.update(clock.getDelta());
    }
    if ( avatarControls != undefined ) {
        if(mixer){
            let readedAction = avatarControls.action != undefined ? avatarControls.action : "walk";            

            let bodyAnimation = avatarAnimations[ avatarAnimations.findIndex(x => x.name === readedAction) ];
            let headAnimation = avatarHeadAnimation[ avatarHeadAnimation.findIndex(x => x.name === readedAction) ];
            let bodyClip = mixer.clipAction( bodyAnimation );
            let headClip = headmixer.clipAction( headAnimation );

            switch(readedAction) {
                case 'jump': 
                    mixer.addEventListener( 'loop', function( e ) {
                        var curAction = e.action;
                        curAction.stop();
                    } );
                    headmixer.addEventListener( 'loop', function( e ) {
                        var curAction = e.action;
                        curAction.stop();
                    } );

                    bodyClip.setEffectiveTimeScale(3);
                    bodyClip.play();
                    headClip.setEffectiveTimeScale(3);
                    headClip.play();                    
                break;
                case 'walk':
                        if(avatarControls.direction.x != 0 || avatarControls.direction.z != 0) {
                            bodyClip.play();
                            headClip.play();
                        } else {
                            bodyClip.stop();
                            headClip.stop();
                        }
        
                        camera.lookAt(avatar.position);
                        avatar.position.z += avatarControls.direction.z;
                        avatar.position.x -= avatarControls.direction.x;
                        camera.position.x = avatar.position.x + 0.5;
                        camera.position.z = avatar.position.z;
                break;
            }
        }            
    }
    render();
    TWEEN.update();

    setTimeout(function() {
        requestAnimationFrame(animate);
    }, 1000 / 30);
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
