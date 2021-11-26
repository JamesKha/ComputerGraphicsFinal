"use strict";

var Projection_Lighting_Shading = function() {
var canvas;
var gl;

var numPositions = 36;

var positionsArray = [];
var normalsArray = [];

//
var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

//default lighting 
var lightPosition = vec4(1.0,1.0,3.0, 0.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

//default material
var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 10.0;


//store location of attribute of html
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var ambientProductLoc, diffuseProductLoc, specularProductLoc, lightPositionLoc, materialShininessLoc;

var program;

var viewerPos;

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     normal = vec3(normal);


     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     positionsArray.push(vertices[b]);
     normalsArray.push(normal);
     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     positionsArray.push(vertices[d]);
     normalsArray.push(normal);
}


function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

//data of eye
var radius = 2.0;
var theta = 18;
var phi = 0;


//data of View
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1, 0.0);

//data of perspective projection
var  fovy = 70.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 1.0;       // Viewport aspect ratio
var near = 0.3;
var far = 3.0;

//scale 
var x_cube=1;
var y_cube=1;
var z_cube=1;

//element coordinate
var coord=[0,0,0]

//light ambient intensity
var intensity=0.2;

//light on state
var light=true;

//project model state
var projection=1;

//light color 
var lightc=[1,1,1];

//light ambient color
var light_a = [1,1,1];

//percentage of the light color data
var light_d=1;
var light_s=1;

//position of light
var light_coord=[1,1,3];

//scale data
var cube_size= 1;


//rotate data
var xAxis = 0;
    var yAxis = 1;
    var zAxis = 2;
    var axis = 0;
    var r_theta = vec3(0, 0, 0);
var flag = false;

var rotate_v = [0,0,0];
window.onload = function init() {
	
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
	
	 viewerPos = vec3(0.0, 0.0, -20.0);

    //radius from the element
	document.getElementById("cube_side_size").onchange = function(event) {
       cube_size = event.target.value;
    };
	
	//change material color
	document.getElementById("material_color").onchange = function(event) {
		materialAmbient	= hexToRgb( event.target.value);
    };
	
    
	//change shiness
	document.getElementById("material_shn").onchange = function(event) {
       materialShininess = event.target.value;
    };
	
	//change angle of the view
	document.getElementById("orien_al").onchange = function(event) {
       theta = event.target.value;  
    };
    
	document.getElementById("orien_az").onchange = function(event) {
       phi = event.target.value;  
    };
	
	
	//change projection state
	document.getElementById("select_projs").onchange = function(event) {
       projection = event.target.value;  
    };
	
	//change coordinate of element
	document.getElementById("coor_x").onchange = function(event) {
       coord[0] = event.target.value;
	 
    };
	document.getElementById("coor_y").onchange = function(event) {
       coord[1] = event.target.value;
	 
    };
	document.getElementById("coor_z").onchange = function(event) {
       coord[2] = event.target.value;
	 
    };
	
	//self control rotate
	document.getElementById("rotate_x").onchange = function(event) {
       rotate_v[0] = event.target.value;
	 
    };
	document.getElementById("rotate_y").onchange = function(event) {
       rotate_v[1] = event.target.value;
	 
    };
	document.getElementById("rotate_z").onchange = function(event) {
       rotate_v[2] = event.target.value;
	 
    };
	
	//change light ambient color and intensity
		//var amb_color = document.getElementById("amb_color");
        //var amb_inten = document.getElementById("amb_inten");
		 lightAmbient = scaleColor(hexToRgb(amb_color.value), Number(amb_inten.value));
		document.getElementById("amb_color").onchange = function(event) {
			lightAmbient = scaleColor(hexToRgb(amb_color.value), Number(amb_inten.value));
				
		
		};
	
		document.getElementById("amb_inten").onchange = function(event) {
			lightAmbient = scaleColor(hexToRgb(amb_color.value), Number(amb_inten.value));
            amb_inten_value.innerHTML = "(" + amb_inten.value + ")";	
		
		};
       

		//lightcolor
	//change light ambient color
	//scale light diffuse percentage
	//scale light specular percentage
		lightDiffuse = scaleColor(hexToRgb(amb_color.value), Number(light_dif.value));
		lightSpecular = scaleColor(hexToRgb(amb_color.value), Number(light_spe.value));
		
		document.getElementById("light_color").onchange = function(event) {
			 lightDiffuse = scaleColor(hexToRgb(light_color.value), Number(light_dif.value));
			lightSpecular = scaleColor(hexToRgb(light_color.value), Number(light_spe.value));
		
		};
		document.getElementById("light_dif").onchange = function(event) {
			lightDiffuse = scaleColor(hexToRgb(light_color.value), Number(light_dif.value));
			light_dif_value.innerHTML = "(" + light_dif_value.value + ")";
		
		};
		document.getElementById("light_spe").onchange = function(event) {
			lightSpecular = scaleColor(hexToRgb(light_color.value), Number(light_spe.value));
			light_spe_value.innerHTML = "(" + light_spe_value.value + ")";		
		};
		
	
	//change lighton state
	document.getElementById("light_on").onchange = function(event) {
      var checkBox = document.getElementById("light_on");
	   if (checkBox.checked == true){
		   light=true;
	   }else{
		   light=false;
	   }		
    };
	
	//change light coordinate
	document.getElementById("light_x").onchange = function(event) {
       light_coord[0] = event.target.value;
	 
    };
	document.getElementById("light_y").onchange = function(event) {
       light_coord[1] = event.target.value;
	 
    };
	document.getElementById("light_z").onchange = function(event) {
       light_coord[2] = event.target.value;
	 
    };
	
	//auto rotate button
//	document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
//    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
//    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
//    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
	
	//store with html attribute location 
	ambientProductLoc  = gl.getUniformLocation(program, "uAmbientProduct");
	diffuseProductLoc = gl.getUniformLocation(program, "uDiffuseProduct");
	specularProductLoc = gl.getUniformLocation(program, "uSpecularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "uLightPosition");
    materialShininessLoc = gl.getUniformLocation(program, "uShininess");
	projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");  
	
	//render
    render();
}

var render = function(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	
	lightPosition = vec4(light_coord[0], light_coord[1],light_coord[2], 0.0);
	
	var ambientProduct;
	var	diffuseProduct ;
	var	specularProduct;	
	
	//detemine light on or off
	//on --> product = light * material
	//off --> product = material
	if(!light){
		var temp_l	= 	vec4(0, 0, 0,1);
		
		ambientProduct = mult(temp_l, materialAmbient);
		diffuseProduct = mult(temp_l, materialDiffuse);
		specularProduct = mult(temp_l, materialSpecular);
	}else{
		ambientProduct = mult(lightAmbient, materialAmbient);
		diffuseProduct = mult(lightDiffuse, materialDiffuse);
		specularProduct = mult(lightSpecular, materialSpecular);
		
	}
	
	//decide where is the eye of view 
	eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

	
	//View 
	modelViewMatrix = lookAt(eye, at, up);
	
	 //decide projection
	 //if 1, perspective
	 //if 2, orthogonal
	if(projection == 1){
		projectionMatrix = perspective(fovy, aspect, near, far);		
	}else if(projection == 2){
		projectionMatrix = ortho(-2,2, -2, 2, -100, 100);
		
	}
	
	//apply translate 	
	//apply scale
	//apply rotate
	var translateMat = mat4(1, 0, 0, coord[0],
                                0, 1, 0, coord[1],
                                0, 0, 1, coord[2],
                                0, 0, 0, 1);
	
	if(flag){
		r_theta[axis] += 2.0;
	}			
	modelViewMatrix = mult(modelViewMatrix, translateMat);
	modelViewMatrix=mult( scale(cube_size,cube_size,1),modelViewMatrix);	
    modelViewMatrix = mult(modelViewMatrix, rotate(r_theta[xAxis], vec3(1, 0, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(r_theta[yAxis], vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(r_theta[zAxis], vec3(0, 0, 1)));
	
	
	 modelViewMatrix = mult(modelViewMatrix, rotate(rotate_v[xAxis], vec3(1, 0, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(rotate_v[yAxis], vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(rotate_v[zAxis], vec3(0, 0, 1)));
	
	
	
	
	//pass data to html
	gl.uniform4fv(ambientProductLoc,ambientProduct);
	gl.uniform4fv(diffuseProductLoc, diffuseProduct );
	gl.uniform4fv(specularProductLoc,specularProduct );
	gl.uniform4fv(lightPositionLoc, lightPosition );
	gl.uniform1f(materialShininessLoc, materialShininess);	
    gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "uModelViewMatrix"), false, flatten(modelViewMatrix));	
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
	 
	 
	//dray the array
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

	//animation frame
    requestAnimationFrame(render);
}
}
Projection_Lighting_Shading();


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
		vec4(parseInt(result[1], 16) / 255, 
			parseInt(result[2], 16) / 255, 
			parseInt(result[3], 16) / 255, 
			1.0) : null;
}

function scaleColor(color, factor) {
	return mult(vec4(factor, factor, factor, 1.0), color);
}