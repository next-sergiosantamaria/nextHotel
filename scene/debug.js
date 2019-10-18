const DEBUG_ENABLED = true;

function debug(nearCol, avatar) {
  if (DEBUG_ENABLED) {

    if (nearCol && avatar) {
      var text = `[Coll] ${nearCol.object.name}  dist: ${nearCol.distance} point:[ x: ${nearCol.point.x}, y: ${nearCol.point.y}, z:${nearCol.point.z}]`
      var name = nearCol.object.name;
      var dist = Math.round(nearCol.distance * 100);
      var x0 = Math.round(avatar.x * 100);
      var z0 = Math.round(avatar.z * 100);
      var x = Math.round(nearCol.point.x * 100);
      var z = Math.round(nearCol.point.z * 100);
  
      var dir = new THREE.Vector3();
      dir.subVectors( avatar.clone(), nearCol.point.clone() ).normalize().multiplyScalar(100).round();
      var dirX = dir.x;
      var dirZ = dir.z;
      var direction = Math.abs(dirX) > Math.abs(dirZ) ? 'X' : 'Z';
  
      document.getElementById('debugWindow').innerText = 
      `[ ${x0} , ${z0} ] Coll ${name} |  dist: ${dist} point[ ${x}, ${z} ]`;
    } else {
      document.getElementById('debugWindow').innerText = nearCol;
    }
  }
}

if (!DEBUG_ENABLED) {
  document.getElementById('debugWindow').style.display = "none";
}