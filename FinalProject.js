/***
 * 
Name: Jimmy Kha 
Student Number: 588541 
CMPT 325: Spring 2021
Assignment #4-2: Affine Transformations in a WebGL Application
Due Date: November 18, 2021
 * 
 */


"use strict";

var gl;
var program;
var t_vPosition;
var tBuffer;
var t_cBuffer;
var colorC = [1.000, 0.388, 0.278,
    1.000, 0.388, 0.278,
    1.000, 0.388, 0.278,
    1.000, 0.388, 0.278,
    1.000, 0.388, 0.278,
    1.000, 0.388, 0.278,
    1.000, 0.388, 0.278,
    1.000, 0.388, 0.278,
];
var v_Normal;
var modelView_Matrix;
var modelView_MatrixLoc;
var move = true;

var NumPoints = 5000;


var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];


/** */
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];
var thetaLoc;
var texture;


/***Textbook code below */
var uLightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
/****Textbook code ends here */
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL 2.0 isn't available");
    }



    var vertices = [
        -0.5, -0.5, 0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
    ];




    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    viewerPos = vec3(0.0, 0.0,-20.0);

    projection = ortho(-1, 1, -1, 1, -100, 100);

    var uAmbientProduct = mult(lightAmbient, materialAmbient);
    var uDiffuseProduct = mult(lightDiffuse, materialDiffuse);
    var uSpecularProduct = mult(lightSpecular, materialSpecular);

    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    t_vPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(t_vPosition, 3, gl.FLOAT, false, 0, 0);

    t_cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, t_cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorC), gl.STATIC_DRAW);

    v_Normal = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(v_Normal, 3, gl.FLOAT, false, 0, 0);

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint8Array(indices), gl.STATIC_DRAW);

    gl.useProgram(program);
    gl.enableVertexAttribArray(t_vPosition);

    gl.enableVertexAttribArray(v_Normal);


    //set the default position
    modelView_Matrix = mat4();
    modelView_MatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    gl.uniformMatrix4fv(modelView_MatrixLoc, false, flatten(modelView_Matrix));


    //Translation transformations
    var translateTemp = [0, 0, 0]; //This will store all of the temporary values of the past slider value
    document.getElementById("xTranslateSlider").onchange = function (event) {
        var change = event.target.value - translateTemp[0];
        modelView_Matrix = mult(modelView_Matrix, translate(change, 0, 0));
        move = true;
        translateTemp[0] = event.target.value;
    };

    document.getElementById("yTranslateSlider").onchange = function (event) {
        var change = event.target.value - translateTemp[1];
        modelView_Matrix = mult(modelView_Matrix, translate(0, change, 0));
        move = true;
        translateTemp[1] = event.target.value;
    };

    document.getElementById("zTranslateSlider").onchange = function (event) {
        var change = event.target.value - translateTemp[2];
        modelView_Matrix = mult(modelView_Matrix, translate(0, 0, change));
        move = true;
        translateTemp[2] = event.target.value;
    };


    //Rotation transformations

    var rotateTemp = [0, 0, 0]; //This will store all of the temporary values of the past slider value
    document.getElementById("xRotateSlider").onchange = function (event) {
        var change = event.target.value - rotateTemp[0];
        modelView_Matrix = mult(modelView_Matrix, rotate(change, 1.0, 0.0, 0.0));
        move = true;
        rotateTemp[0] = event.target.value;
    };

    document.getElementById("yRotateSlider").onchange = function (event) {
        var change = event.target.value - rotateTemp[1];
        modelView_Matrix = mult(modelView_Matrix, rotate(change, 0.0, 1.0, 0.0));
        move = true;
        rotateTemp[1] = event.target.value;
    };

    document.getElementById("zRotateSlider").onchange = function (event) {
        var change = event.target.value - rotateTemp[2];
        modelView_Matrix = mult(modelView_Matrix, rotate(change, 0.0, 0.0, 1.0));
        move = true;
        rotateTemp[2] = event.target.value;
    };

    //Scale transformations

    var scaleTemp = [1.0, 1.0, 1.0]; //This will store all of the temporary values of the past slider value
    document.getElementById("xScaleSlider").onchange = function (event) {
        var change = event.target.value - scaleTemp[0] + 1.0;
        modelView_Matrix = mult(modelView_Matrix, scale(change, 1, 1));
        move = true;
        scaleTemp[0] = event.target.value;
    };

    document.getElementById("yScaleSlider").onchange = function (event) {
        var change = event.target.value - scaleTemp[1] + 1.0;
        modelView_Matrix = mult(modelView_Matrix, scale(1, change, 1));
        move = true;
        scaleTemp[1] = event.target.value;
    };
    document.getElementById("zScaleSlider").onchange = function (event) {
        var change = event.target.value - scaleTemp[2] + 1.0;
        modelView_Matrix = mult(modelView_Matrix, scale(1, 1, change));
        move = true;
        scaleTemp[2] = event.target.value;
    };

    //Shear transformations
    var shearTemp = [0, 0, 0]; //This will store all of the temporary values of the past slider value

    document.getElementById("shearXYSlider").onchange = function (event) {
        var change = event.target.value - shearTemp[0];
        modelView_Matrix = mult(modelView_Matrix, shearXY(change, change));
        move = true;
        shearTemp[0] = event.target.value;
    };



    document.getElementById("shearXZSlider").onchange = function (event) {
        var change = event.target.value - shearTemp[1];
        modelView_Matrix = mult(modelView_Matrix, shearXZ(change, change));
        shearTemp[1] = event.target.value;
        move = true;
    };


    document.getElementById("shearYZSlider").onchange = function (event) {
        var change = event.target.value - shearTemp[2];
        modelView_Matrix = mult(modelView_Matrix, shearYZ(change, change));
        shearTemp[2] = event.target.value;
        move = true;
    };

    //Reflection transformations

    document.getElementById("ReflectionX").onclick = function () {
        modelView_Matrix = mult(modelView_Matrix, reflection(-1, 1, 1));
        move = true;
    }

    document.getElementById("ReflectionY").onclick = function () {

        modelView_Matrix = mult(modelView_Matrix, reflection(1, -1, 1));
        move = true;
    }

    document.getElementById("ReflectionZ").onclick = function () {
        modelView_Matrix = mult(modelView_Matrix, reflection(1, 1, -1));
        move = true;
    }




    //The code below would test the order of the transformations

    document.getElementById("ScaleRotate").onclick = function () { //Scale and then the rotation
        document.getElementById("xScaleSlider").value = 0.2;
        modelView_Matrix = mult(modelView_Matrix, scale(0.2, 1, 1));
        document.getElementById("yRotateSlider").value = -45;
        modelView_Matrix = mult(modelView_Matrix, rotate(-45, 0.0, 1.0, 0.0));
        move = true;
    }


    document.getElementById("RotateScale").onclick = function () { //Rotation then the scale
        document.getElementById("yRotateSlider").value = -45;
        modelView_Matrix = mult(modelView_Matrix, rotate(-45, 0.0, 1.0, 0.0));
        document.getElementById("xScaleSlider").value = 0.2;
        modelView_Matrix = mult(modelView_Matrix, scale(0.2, 1, 1));
        move = true;
    }


    document.getElementById("resetButton").onclick = function () {
        //Upon the reset button being pressed, all of the transformation sliders will be set back to zero. 
        document.getElementById("xTranslateSlider").value = 0;
        document.getElementById("yTranslateSlider").value = 0;
        document.getElementById("zTranslateSlider").value = 0;
        document.getElementById("xRotateSlider").value = 0;
        document.getElementById("yRotateSlider").value = 0;
        document.getElementById("zRotateSlider").value = 0;
        document.getElementById("xScaleSlider").value = 0;
        document.getElementById("yScaleSlider").value = 0;
        document.getElementById("zScaleSlider").value = 0;
        document.getElementById("shearXYSlider").value = 0;
        document.getElementById("shearXZSlider").value = 0;
        document.getElementById("shearYZSlider").value = 0;




        modelView_Matrix = mat4();
        move = true;
    };

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),
        flatten(uAmbientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),
        flatten(uDiffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),
        flatten(uSpecularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
        flatten(uLightPosition));

    gl.uniform1f(gl.getUniformLocation(program,
        "uShininess"), materialShininess);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uProjectionMatrix"),
        false, flatten(projection));



    // var image = document.getElementById("dogImageTest");
    // configureTexture( image );
    render();
};


function render() { //Rendering of the tetrahedron on the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (move == true) {
        gl.uniformMatrix4fv(modelView_MatrixLoc, false, flatten(modelView_Matrix));
        move = false;
    }


    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(render);
}