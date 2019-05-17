var camera, scene, renderer, controls, 
    width = window.innerWidth,
    height = window.innerHeight;

var clock = new THREE.Clock();
var mouse = new THREE.Vector2();

var manager = new THREE.LoadingManager();

var interactivos = new THREE.Object3D();
interactivos.name = 'interactiveElements';

var plantas = ['manoteras', 'tablas2-P1', 'tablas2-P0'];

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

    camera = new THREE.PerspectiveCamera(60, (width / height), 0.01, 10000000);
    camera.position.set(1, 2, 0);

    scene.add(camera);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.70;
    controls.enableZoom = true;
    controls.target.set(0,0,0);

    ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    ambientLight.position.set(0, 0.6, 0);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(3,3,3);
    scene.add( directionalLight );
    window.addEventListener('resize', onWindowResize, false);
   
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
            scene.add(elements);
            $('#container').addClass('displayOn');
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

