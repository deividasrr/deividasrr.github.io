
// Deividas Rutkauskas
// Interactive Computer Graphics
// Homework 3

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
    
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +   // Model matrix
    'uniform mat4 u_NormalMatrix;\n' +  // Transformation matrix of the normal
    'uniform vec3 u_LightColor;\n' +    // Light color
    'uniform vec3 u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
    'uniform vec3 u_AmbientLight;\n' +  // Ambient light color
    'varying vec4 v_ColorDiffuse;\n' +  // Diffuse color to be sent to fshader
    'varying vec4 v_ColorSpecular;\n' + // Specular color to be sent to fshader
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +   
    
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    // Recalculate the normal based on the model matrix and make its length 1.
    '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +

    // Calculate world coordinate of vertex
    '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +

    // Calculate the light direction and make it 1.0 in length
    '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
    // The dot product of the light direction and the normal
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    // Calculate the color due to diffuse reflection
    '  vec3 diffuse = u_LightColor * nDotL;\n' +
    
    // Calculate the color due to ambient reflection
    '  vec3 ambient = u_AmbientLight;\n' +
    
    // Calculate the color due to specular reflection:
    // Formula for calculating specular light component:
    //  (( R * V)^n * K_s * I_s)
    // Calculate reflection (R)
    'vec3 reflection = reflect(lightDirection, normal);\n' +
    // Calculate dot product of reflection and view vector (R * V)
    'float dotprod = max(dot(reflection, vertexPosition.rgb),1.0);\n' +
    // Calculate shininess (n)
    'dotprod = pow(dotprod, 3.0);\n'+
    // Add specular material (K_s) and specular color (I_s)
    'vec3 specular = u_LightColor * dotprod * 0.8 * vec3(0.9,0.9,0.9) ;\n' +

    // Prepare out variables to be sent to fshader
    // add ambient color to diffuse and specular color variables
    '  v_ColorDiffuse = vec4(diffuse + ambient, 1.0);\n' + 
    ' v_ColorSpecular = vec4(specular + ambient, 1.0);\n' +
    '  gl_Position = a_Position;\n' +
    
    
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler0;\n' + // marble sampler
  'uniform sampler2D u_Sampler1;\n' + // alpha mask sampler
  'uniform sampler2D u_Sampler2;\n' + // gold sampler
  'varying vec2 v_TexCoord;\n' +
    
    'varying vec4 v_ColorSpecular;\n' + // rasterized specular color from vshader
    'varying vec4 v_ColorDiffuse;\n' +  // rasterized diffuse color from vshader
  
  'void main() {\n' +
  '  vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' + // marble
  '  vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n' + // alpha mask
  '  vec4 color2 = texture2D(u_Sampler2, v_TexCoord);\n' +  // gold 
    // if the color of the alpha mask is black for this fragment, set
    // fragColor to marble, and otherwise to gold
    'if(color1[0] > 0.8 && color1[1] > 0.8 && color1[2] > 0.8 ){ gl_FragColor = color0 * v_ColorDiffuse; }\n' +  
    'else { gl_FragColor = color2 * v_ColorSpecular; }\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Shader Initialization
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Initialize vertex buffers and get the number of vertices
  // of the object to be rendered
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Clear <canvas> color to black
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Get the storage locations of uniform variables and so on
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) { 
        console.log('Failed to get the storage location');
        return;
    }
    
    // Set the light color (white)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    // Set the light direction (in the world coordinate)
    gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
    // Set the ambient light (dim white)
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
    
    
    var modelMatrix = new Matrix4();  // Model matrix
    var mvpMatrix = new Matrix4();    // Model view projection matrix
    var normalMatrix = new Matrix4(); // Transformation matrix for normals

    // Model matrix calculation
    // Pass the model matrix to u_ModelMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Pass the model view projection matrix to u_MvpMatrix
    mvpMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Pass the matrix to transform the normal based on the model matrix to u_NormalMatrix
    
    //matrix transpose isn't required because no rotation is taking place
    //normalMatrix.setInverseOf(modelMatrix);
    //normalMatrix.transpose();
    
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);   

  // Set texture
  if (!initTextures(gl, n)) {
    console.log('Failed to intialize the texture.');
    return;
  }
}

function initVertexBuffers(gl) {
  var verticesTexCoords = new Float32Array([
    // Coordinates for textures and vertices
      -0.5,  0.5,   0.0, 1.0, 
      -0.5, -0.5,   0.0, 0.0,
      0.5,  0.5,   1.0, 1.0,
      0.5, -0.5,   1.0, 0.0,
  ]);
    
    
    var normals = new Float32Array([
        // Normal coordinates for textures and vertices
        1,  0.5,   0.0, 1.0, 
        -0.5, -0.5,   0.0, 0.0,
        0.5,  0.5,   1.0, 1.0,
        0.5, -0.5,   1.0, 0.0,
    ]);
    
    
  var n = 4; // The number of vertices

  // Create a buffer object
  var vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the positions of vertices to a vertex shader
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
    
  // Get  texture element size in bytes
  var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
  // Assign the buffer object to the a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  // error checking
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // specifies data formats and locations of vertex attrib array  
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_Position);  // enables VBO assignment
    
    
    // Assign the buffer object to the a_Normal variable
    var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return -1;
    }
    // specifies data formats and locations of vertex attrib array 
    gl.vertexAttribPointer(a_Normal, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Normal);  // enables VBO assignment
    
    
    

    // Assign the buffer object to the a_TexCoord variable
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
    // specifies data formats and locations of vertex attrib array 
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);  // enables VBO assignment

  return n;
}

function initTextures(gl, n) {
  // Create a texture objects
  var texture0 = gl.createTexture(); 
  var texture1 = gl.createTexture();
  var texture2 = gl.createTexture();
  if (!texture0 || !texture1 || !texture2) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of texture samplers from shader
  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  var u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');    
  if (!u_Sampler0 || !u_Sampler1 || !u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  // Create the image objects
  var image0 = new Image();
  var image1 = new Image();
  var image2 = new Image();    
  if (!image0 || !image1 || !image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // invoke the loadTexture function once image objects load
  image0.onload = function(){ loadTexture(gl, n, texture0, u_Sampler0, image0, 0); };
  image1.onload = function(){ loadTexture(gl, n, texture1, u_Sampler1, image1, 1); };
  image2.onload = function(){ loadTexture(gl, n, texture2, u_Sampler2, image2, 2); };
  // Tell the browser to load an Image
  image0.src = 'marble.jpg';
  image1.src = 'letters.png';
  image2.src = 'gold.jpg';

  return true;
}
// Specify whether the texture unit is ready to use
var g_texUnit0 = false, g_texUnit1 = false, g_texUnit2 = false; 
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);// Flip the image's y-axis
  // Make the texture unit active
  if (texUnit == 0) {
    gl.activeTexture(gl.TEXTURE0);
    g_texUnit0 = true;
  } else if (texUnit == 1) {
    gl.activeTexture(gl.TEXTURE1);
    g_texUnit1 = true;
  } else {
      gl.activeTexture(gl.TEXTURE2);
      g_texUnit2 = true;
  }
      
  // Write data into the texture buffer object
  gl.bindTexture(gl.TEXTURE_2D, texture);   

  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
  gl.uniform1i(u_Sampler, texUnit);   // Pass the texture unit to u_Sampler
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (g_texUnit0 && g_texUnit1) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);   // Draw the rectangle
  }
}
