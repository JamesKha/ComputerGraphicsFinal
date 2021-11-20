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
var t_ColorLoc;
var transformation_Matrix;
var transformation_MatrixLoc;
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
function configureTexture(image) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}
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

    tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    t_vPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(t_vPosition, 3, gl.FLOAT, false, 0, 0);

    t_cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, t_cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorC), gl.STATIC_DRAW);

    t_ColorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(t_ColorLoc, 3, gl.FLOAT, false, 0, 0);

    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint8Array(indices), gl.STATIC_DRAW);

    gl.useProgram(program);
    gl.enableVertexAttribArray(t_vPosition);

    gl.enableVertexAttribArray(t_ColorLoc);


    //set the default position
    transformation_Matrix = mat4();
    transformation_MatrixLoc = gl.getUniformLocation(program, "uTransformationMatrix");
    gl.uniformMatrix4fv(transformation_MatrixLoc, false, flatten(transformation_Matrix));


    //Translation transformations
    var translateTemp = [0, 0, 0]; //This will store all of the temporary values of the past slider value
    document.getElementById("xTranslateSlider").onchange = function (event) {
        var change = event.target.value - translateTemp[0];
        transformation_Matrix = mult(transformation_Matrix, translate(change, 0, 0));
        move = true;
        translateTemp[0] = event.target.value;
    };

    document.getElementById("yTranslateSlider").onchange = function (event) {
        var change = event.target.value - translateTemp[1];
        transformation_Matrix = mult(transformation_Matrix, translate(0, change, 0));
        move = true;
        translateTemp[1] = event.target.value;
    };

    document.getElementById("zTranslateSlider").onchange = function (event) {
        var change = event.target.value - translateTemp[2];
        transformation_Matrix = mult(transformation_Matrix, translate(0, 0, change));
        move = true;
        translateTemp[2] = event.target.value;
    };


    //Rotation transformations

    var rotateTemp = [0, 0, 0]; //This will store all of the temporary values of the past slider value
    document.getElementById("xRotateSlider").onchange = function (event) {
        var change = event.target.value - rotateTemp[0];
        transformation_Matrix = mult(transformation_Matrix, rotate(change, 1.0, 0.0, 0.0));
        move = true;
        rotateTemp[0] = event.target.value;
    };

    document.getElementById("yRotateSlider").onchange = function (event) {
        var change = event.target.value - rotateTemp[1];
        transformation_Matrix = mult(transformation_Matrix, rotate(change, 0.0, 1.0, 0.0));
        move = true;
        rotateTemp[1] = event.target.value;
    };

    document.getElementById("zRotateSlider").onchange = function (event) {
        var change = event.target.value - rotateTemp[2];
        transformation_Matrix = mult(transformation_Matrix, rotate(change, 0.0, 0.0, 1.0));
        move = true;
        rotateTemp[2] = event.target.value;
    };

    //Scale transformations

    var scaleTemp = [1.0, 1.0, 1.0]; //This will store all of the temporary values of the past slider value
    document.getElementById("xScaleSlider").onchange = function (event) {
        var change = event.target.value - scaleTemp[0] + 1.0;
        transformation_Matrix = mult(transformation_Matrix, scale(change, 1, 1));
        move = true;
        scaleTemp[0] = event.target.value;
    };

    document.getElementById("yScaleSlider").onchange = function (event) {
        var change = event.target.value - scaleTemp[1] + 1.0;
        transformation_Matrix = mult(transformation_Matrix, scale(1, change, 1));
        move = true;
        scaleTemp[1] = event.target.value;
    };
    document.getElementById("zScaleSlider").onchange = function (event) {
        var change = event.target.value - scaleTemp[2] + 1.0;
        transformation_Matrix = mult(transformation_Matrix, scale(1, 1, change));
        move = true;
        scaleTemp[2] = event.target.value;
    };

    //Shear transformations
    var shearTemp = [0, 0, 0]; //This will store all of the temporary values of the past slider value

    document.getElementById("shearXYSlider").onchange = function (event) {
        var change = event.target.value - shearTemp[0];
        transformation_Matrix = mult(transformation_Matrix, shearXY(change, change));
        move = true;
        shearTemp[0] = event.target.value;
    };



    document.getElementById("shearXZSlider").onchange = function (event) {
        var change = event.target.value - shearTemp[1];
        transformation_Matrix = mult(transformation_Matrix, shearXZ(change, change));
        shearTemp[1] = event.target.value;
        move = true;
    };


    document.getElementById("shearYZSlider").onchange = function (event) {
        var change = event.target.value - shearTemp[2];
        transformation_Matrix = mult(transformation_Matrix, shearYZ(change, change));
        shearTemp[2] = event.target.value;
        move = true;
    };

    //Reflection transformations

    document.getElementById("ReflectionX").onclick = function () {
        transformation_Matrix = mult(transformation_Matrix, reflection(-1, 1, 1));
        move = true;
    }

    document.getElementById("ReflectionY").onclick = function () {

        transformation_Matrix = mult(transformation_Matrix, reflection(1, -1, 1));
        move = true;
    }

    document.getElementById("ReflectionZ").onclick = function () {
        transformation_Matrix = mult(transformation_Matrix, reflection(1, 1, -1));
        move = true;
    }




    //The code below would test the order of the transformations

    document.getElementById("ScaleRotate").onclick = function () { //Scale and then the rotation
        document.getElementById("xScaleSlider").value = 0.2;
        transformation_Matrix = mult(transformation_Matrix, scale(0.2, 1, 1));
        document.getElementById("yRotateSlider").value = -45;
        transformation_Matrix = mult(transformation_Matrix, rotate(-45, 0.0, 1.0, 0.0));
        move = true;
    }


    document.getElementById("RotateScale").onclick = function () { //Rotation then the scale
        document.getElementById("yRotateSlider").value = -45;
        transformation_Matrix = mult(transformation_Matrix, rotate(-45, 0.0, 1.0, 0.0));
        document.getElementById("xScaleSlider").value = 0.2;
        transformation_Matrix = mult(transformation_Matrix, scale(0.2, 1, 1));
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




        transformation_Matrix = mat4();
        move = true;
    };

    // var image = document.getElementById("dogImageTest");
    // configureTexture( image );
    render();
};


function render() { //Rendering of the tetrahedron on the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (move == true) {
        gl.uniformMatrix4fv(transformation_MatrixLoc, false, flatten(transformation_Matrix));
        move = false;
    }


    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(render);
}