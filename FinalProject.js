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
var colorC = [0, 0, 1, 1, 0, 0, 0, 1, 0];
var t_ColorLoc;
var transformation_Matrix;
var transformation_MatrixLoc;
var move = true;

var NumPoints = 5000;
var indices = [ //These are indices necessary for the construction of the tetrahedron; 
    1, 2, 3,
    2, 3, 0,
    3, 0, 1,
    0, 1, 2
];

/** */
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = [0, 0, 0];
var thetaLoc;



window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL 2.0 isn't available");
    }

    var vertices = [ //These are vertices of the tetrahedron; 
        -0.3, -0.3, -0.3,
        0.3, -0.3, -0.3,
        0.0, 0.3, 0.0,
        0.0, -0.3, 0.3
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