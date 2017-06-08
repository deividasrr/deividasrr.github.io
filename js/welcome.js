var scene, camera, renderer, welcomeText;
var hasLoaded = false;

init();
animate();

function init() {

  scene = new THREE.Scene();
      // var WIDTH = window.innerWidth,
      //     HEIGHT = window.innerHeight;
      var WIDTH = window.innerWidth * 0.8;
      var HEIGHT = window.innerHeight * 0.4;

      var canvas = document.getElementById("webgl");
      renderer = new THREE.WebGLRenderer({canvas:canvas});
      renderer.setSize(WIDTH, HEIGHT);
      document.body.appendChild(renderer.domElement);

      // Create a camera, zoom it out from the model a bit, and add it to the scene.
      camera = new THREE.PerspectiveCamera(20, WIDTH / HEIGHT, 0.1, 20000);
      camera.position.set(0,0.5,-20);
      scene.add(camera);

      // Create an event listener that resizes the renderer with the browser window.
      window.addEventListener('resize', function() {
        WIDTH = window.innerWidth * 0.8,
        HEIGHT = window.innerHeight * 0.4;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
      });

      // Set the background color of the scene.
      renderer.setClearColor( 0x0000ff, 1 );

      //Create a light, set its position, and add it to the scene.
      var light = new THREE.PointLight(0xffffff);
      light.position.set(-100,200,100);
      scene.add(light);




      var geometry = new THREE.CubeGeometry( 3, 3, 3 );
      var material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
      cube = new THREE.Mesh( geometry, material );
      scene.add(cube);







      // Load in the mesh and add it to the scene.
      var loader = new THREE.JSONLoader();
      loader.load( "models/untitled.js", function(geometry, materials){
        var material = new THREE.MeshFaceMaterial( materials );
        // var material = new THREE.MeshLambertMaterial();
        welcomeText = new THREE.Mesh(geometry, material);
        scene.add(welcomeText);
        hasLoaded = true;
      });

      // Add OrbitControls so that we can pan around with the mouse.
      controls = new THREE.OrbitControls(camera, renderer.domElement);

    }

    // Rotate an object around an arbitrary axis in object space
    var rotObjectMatrix;
    function rotateAroundObjectAxis(object, axis, radians) {
      rotObjectMatrix = new THREE.Matrix4();
      rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);


      object.matrix.multiply(rotObjectMatrix);
      object.rotation.setFromRotationMatrix(object.matrix);
    }

    var phongMaterial = new THREE.MeshPhongMaterial( { ambient: 0xff0000, color: 0xff0000, specular: 0xff0000, shininess: 50, shading: THREE.SmoothShading } );
    var basicMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 1} );

    var timer = 0;
    // Renders the scene and updates the render as needed.
    function animate() {

      // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
      requestAnimationFrame(animate);

      // renderer.setClearColor( 0xf0f0f0, 1 );

      //timer++;
      // var rgbColor = new THREE.Color("rgb(" + .5*(1+ Math.sin( timer/30.0 )) + "," + 0.0 + "," + .5*(1+Math.cos( timer/30.0 )) + ")");
      // var color2 = new THREE.Color("rgb(100%, 0%, 0%)");
      // renderer.setClearColor(new THREE.Color(0xffffff), 1);

      var yAxis = new THREE.Vector3(0,1,0);
      if (hasLoaded){
          // rotateAroundObjectAxis(cube, yAxis, Math.PI / 180);
          // cube.material.color.setHex( 0x00ff00 );
          cube.rotateX(Math.PI / 360);
          cube.rotateY(Math.PI / 360);
          cube.rotateZ(Math.PI / 360);


          welcomeText.rotateY(Math.PI / 90);
          welcomeText.material = basicMaterial;
          // cube.material.transparent = true;
          // cube.material.opacity = 1 + Math.sin(new Date().getTime() * .0025);
          // welcomeText.matrixAutoUpdate = false;
          // welcomeText.updateMatrix();
        }


      // Render the scene.
      renderer.render(scene, camera);
      controls.update();

    }