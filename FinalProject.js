"use strict";
/*global variable defined*/
var canvas;
var gl;
var numPositions  = 36;
var texSize = 64;
var program;
var positionsArray = new Float32Array([
    -0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,
    -0.5,  0.5,  -0.5,
     0.5,  0.5,  -0.5,
     0.5, -0.5,  -0.5,

    -0.5, -0.5,   0.5,
     0.5, -0.5,   0.5,
    -0.5,  0.5,   0.5,
    -0.5,  0.5,   0.5,
     0.5, -0.5,   0.5,
     0.5,  0.5,   0.5,

    -0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,
    -0.5,   0.5,  0.5,
     0.5,   0.5,  0.5,
     0.5,   0.5, -0.5,

    -0.5,  -0.5, -0.5,
     0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,  -0.5,  0.5,
     0.5,  -0.5, -0.5,
     0.5,  -0.5,  0.5,

    -0.5,  -0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5, -0.5,
    -0.5,  -0.5,  0.5,
    -0.5,   0.5,  0.5,
    -0.5,   0.5, -0.5,

     0.5,  -0.5, -0.5,
     0.5,   0.5, -0.5,
     0.5,  -0.5,  0.5,
     0.5,  -0.5,  0.5,
     0.5,   0.5, -0.5,
     0.5,   0.5,  0.5,

]);

var texCoordsArray = new Float32Array([
    // select the top left image
    0   , 0  ,
    0   , 0.5,
    0.25, 0  ,
    0   , 0.5,
    0.25, 0.5,
    0.25, 0  ,
    // select the top middle image

    //Write your code
    0.25, 0  ,
    0.5 , 0  ,
    0.25, 0.5,
    0.25, 0.5,
    0.5 , 0  ,
    0.5 , 0.5,

    // select to top right image
    0.5 , 0  ,
    0.5 , 0.5,
    0.75, 0  ,
    0.5 , 0.5,
    0.75, 0.5,
    0.75, 0  ,
    // select the bottom left image
    0   , 0.5,
    0.25, 0.5,
    0   , 1  ,
    0   , 1  ,
    0.25, 0.5,
    0.25, 1  ,



    // select the bottom middle image
    0.25, 0.5,
    0.25, 1  ,
    0.5 , 0.5,
    0.25, 1  ,
    0.5 , 1  ,
    0.5 , 0.5,
    // select the bottom right image


    0.5 , 0.5,
    0.75, 0.5,
    0.5 , 1  ,
    0.5 , 1  ,
    0.75, 0.5,
    0.75, 1  ,

]);
var normalsArray = [
    //front
    vec3(0.0, 0.0, 1.0),
    vec3(0.0, 0.0, 1.0),
    vec3(0.0, 0.0, 1.0),
    vec3(0.0, 0.0, 1.0),
    vec3(0.0, 0.0, 1.0),
    vec3(0.0, 0.0, 1.0),
    //back



    vec3(0.0, 0.0, -1.0),
    vec3(0.0, 0.0, -1.0),
    vec3(0.0, 0.0, -1.0),
    vec3(0.0, 0.0, -1.0),
    vec3(0.0, 0.0, -1.0),
    vec3(0.0, 0.0, -1.0),

    //top
    vec3(0.0, 1, 0.0),
    vec3(0.0, 1, 0.0),
    vec3(0.0, 1, 0.0),
    vec3(0.0, 1, 0.0),
    vec3(0.0, 1, 0.0),
    vec3(0.0, 1, 0.0),
    // Bottom

    vec3(0.0, -1, 0.0),
    vec3(0.0, -1, 0.0),
    vec3(0.0, -1, 0.0),
    vec3(0.0, -1, 0.0),
    vec3(0.0, -1, 0.0),
    vec3(0.0, -1, 0.0),
    //right
    vec3(1.0, 0.0, 0.0),
    vec3(1.0, 0.0, 0.0),
    vec3(1.0, 0.0, 0.0),
    vec3(1.0, 0.0, 0.0),
    vec3(1.0, 0.0, 0.0),
    vec3(1.0, 0.0, 0.0),
    //left

    vec3(-1.0, 0.0, 0.0),
    vec3(-1.0, 0.0, 0.0),
    vec3(-1.0, 0.0, 0.0),
    vec3(-1.0, 0.0, 0.0),
    vec3(-1.0, 0.0, 0.0),
    vec3(-1.0, 0.0, 0.0),
]
var texture;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var theta = vec3(0.0, 0.0, 0.0);
var flag = false;
var modelViewMatrixLoc;
var projectionMatrixLoc;
var textureLocation;
var viewMatrix;
var time = 0;
var projectionMatrix;
var modelViewMatrix;
var cubes = [


    //translate(?, 0, ?),
    //translate(?, 0, ?)


    
translate(0, 0, -2), 
translate(0, 0, 2)
];
var lightPosition = vec4(0.0, 2.0, 0.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100;

//Execute a JavaScript immediately after a page has been loaded
window.onload = function init(){

    //Initialize the canvas by document.getElementById method
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl){
        alert("WebGL 2.0 isn't available");
    }
    //set the viewport and canvas background color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //Create buffer for normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    //Create buffer for vertex
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positionsArray, gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    //Create buffer for texture coordinate
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordsArray, gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    //load an image
    var image = document.getElementById("texImage");
    configureTexture(image);
    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
   
    //set the perspective projection
    var fieldOfView = 70.0; //Change the value
    var aspect = canvas.width/canvas.height;
    var zNear = 1; //Change the value
    var zFar = 2000; //Change the value
    projectionMatrix = perspective(fieldOfView, aspect, zNear, zFar);

    //set the model-view matrix
    var cameraPosition = vec3(2, 2, 4.0);
    var up = vec3(0.0, 1.0, 0.0);
    var target = vec3(0.0, 0.0, 0.0);
    modelViewMatrix = lookAt(cameraPosition, target, up);

    //set event to the buttons
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    render(); 
}

//function for setting the texture
function configureTexture(image){
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
        new Uint8Array([0, 0, 255, 255]));
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //generate the Mipmap
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, texture);         
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

//render function
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(flag){
        theta[axis] += 2.0;  //Change the value
    }
    //rotating the light
    lightPosition[0] = 5.5 * Math.sin(0.02 * time);
    lightPosition[2] = 5.5 * Math.cos(0.02 * time);
    time += 2; //Change the value

    //generate two cubes, one is closer to the viewer and the other farther from the viewer
    for(var index = 0; index < cubes.length; index++){
        gl.uniform4fv( gl.getUniformLocation(program, "uLightPosition"), lightPosition);
        viewMatrix = mult(modelViewMatrix, cubes[index]);
        viewMatrix = mult(viewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
        viewMatrix = mult(viewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
        viewMatrix = mult(viewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(viewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        var diffuseProduct = mult(lightDiffuse, materialDiffuse);
        gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"), diffuseProduct);

        var ambientProduct = mult(lightAmbient, materialAmbient);
        gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"), ambientProduct);

        var specularProduct = mult(lightSpecular, materialSpecular);
        gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"), specularProduct);

        gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);
        gl.uniform1i(textureLocation, index);
        gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    }
    requestAnimationFrame(render);
}


