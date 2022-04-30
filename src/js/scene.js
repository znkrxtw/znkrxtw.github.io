var three = THREE;

var scene = new three.Scene();
scene.background = new THREE.Color( 0xFFFFFFFF );
var camera = new three.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

var renderer = new three.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

let blo = document.getElementById("myCanvas");
blo.replaceWith(renderer.domElement);

var geometry = new three.BoxGeometry(1, 1, 1);
three.ImageUtils.crossOrigin = '';
var texture = three.ImageUtils.loadTexture('http://i.imgur.com/CEGihbB.gif');
texture.anisotropy = renderer.getMaxAnisotropy();

var material = new three.MeshFaceMaterial([
    new three.MeshBasicMaterial({
        color: 0x00ff00
    }),
    new three.MeshBasicMaterial({
        color: 0xff0000
    }),
    new three.MeshBasicMaterial({
        //color: 0x0000ff,
        map: texture
    }),
    new three.MeshBasicMaterial({
        color: 0xffff00
    }),
    new three.MeshBasicMaterial({
        color: 0x00ffff
    }),
    new three.MeshBasicMaterial({
        color: 0xff00ff
    })
]);
/* */

var cube = new three.Mesh(geometry, material);
cube.rotation.x = Math.PI/4;
cube.rotation.y = Math.PI/4;
scene.add(cube);


camera.position.z = 5;

/* */
var isDragging = false;
var previousMousePosition = {
    x: 0,
    y: 0
};

const canvas = document.getElementById('myCanvas');

renderer.domElement.addEventListener('mousedown', function(e) {
    isDragging = true;
    console.log("down");
});

renderer.domElement.addEventListener('mousemove', function(e) {
    //console.log(e);
    var deltaMove = {
        x: e.offsetX-previousMousePosition.x,
        y: e.offsetY-previousMousePosition.y
    };

    if(isDragging) {
            
        var deltaRotationQuaternion = new three.Quaternion()
            .setFromEuler(new three.Euler(
                toRadians(deltaMove.y * 1),
                toRadians(deltaMove.x * 1),
                0,
                'XYZ'
            ));
        
        cube.quaternion.multiplyQuaternions(deltaRotationQuaternion, cube.quaternion);
    }
    
    previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY
    };
});
/* */

renderer.domElement.addEventListener('mouseup', function(e) {
    isDragging = false;
});

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var lastFrameTime = new Date().getTime() / 1000;
var totalGameTime = 0;

function update(dt, t) {  
    setTimeout(function() {
        var currTime = new Date().getTime() / 1000;
        var dt = currTime - (lastFrameTime || currTime);
        totalGameTime += dt;
        
        update(dt, totalGameTime);
    
        lastFrameTime = currTime;
    }, 0);
}

function render() {
    renderer.render(scene, camera);   
    requestAnimFrame(render);
}

render();
update(0, totalGameTime);

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

function toDegrees(angle) {
	return angle * (180 / Math.PI);
}

