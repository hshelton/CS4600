"use strict";
var canvas, gl, program;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var numTimesToSubdivide = 3;
var index = 0;
var planeDrawn = false;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 1.0);

//these arrays will keep track of the geometry
var pointsArray = [];
var normalsArray = [];
var planeArray = [];
 var vertexColors = [];


var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0;
var phi    = 0;
var dr = 5.0 * Math.PI/180.0;

var left = -4.0;
var right = 4.0;
var ytop =4.0;
var bottom = -4.0;

var CTM = [];


function plane()
{
	var a = vec4( -1.5, 0.5,  -1.5, 1.0 );
	var b = vec4( 1.5,  0.5, 1.5, 1.0);
	var c = vec4( 1.5, 0.5,  -1.5, 1.0 );
	var d = vec4( -1.5,  0.5,  1.5, 1.0 );

   pointsArray.push(vec4( -2.5, -1.5,  -0.5, 1.0 ));
    pointsArray.push(vec4( -2.5,  -2.5,  0.5, 1.0 ));
    pointsArray.push(vec4( 2.5, -2.5,  0.5, 1.0 ));
    pointsArray.push(vec4( 2.5,  -1.5,  -0.5, 1.0 ));


    pointsArray.push(d);
    pointsArray.push(d);

    index+=6;




       normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);
		normalsArray.push(d[0],d[1], d[2], 0.0);
    




}
function triangle(a, b, c) {

	//these points will be vertices
     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     // normals are vectors
     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

     index += 3;

}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}




window.onload = function init() {

     canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);


	vertexColors.push(vec4(0.2, 0.7, 0.35, 1));
	vertexColors.push(vec4(0.2, 0.7, 0.35, 1));
	vertexColors.push(vec4(0.2, 0.7, 0.35, 1));
	vertexColors.push(vec4(0.2, 0.7, 0.35, 1));
    //set up random colors
    for(var i = 0; i < 10000; i++)
    {
    	var r = Math.random();
    	r = Math.random();
    	r = Math.random();
    	var g = Math.random();
    	g = Math.random();
    	g = Math.random();

    	var b = Math.random();
    	b = Math.random();
    	b = Math.random();
    	vertexColors.push(vec4(r, g, b, 1));
    }
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    plane();
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);





    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //bind vertexColors as the array holding pixel colors
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

    //set up a variable 'vColor' for 
    var vertexColor = gl.getAttribLocation( program, "vertexColor" );
    gl.vertexAttribPointer( vertexColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexColor );

	//set up mv matrix projection matrix, and normal matrix as variables for WebGL
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // normal matrix only really need if there is nonuniform scaling
    // it's here for generality but since there is
    // no scaling in this example we could just use modelView matrix in shaders

    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

   
    drawDog();



    window.requestAnimFrame(render);
}

function drawSphere(_ctm)
{
	
	//update the modelViewMatrix
	    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(_ctm) );
	    for( var i=6; i<index; i+=3)
	    {
	    	
	    	 gl.drawArrays( gl.TRIANGLE_STRIP, i, 3 );
	    	
	    }
}




function drawDog()
{

	
	    	 gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
	    

	

	drawBody();
	drawHead();
	drawTail();

}

function drawBody()
{

	var scaleMatrix = scalem(1.8, 0.75, 1);
	
	var temp = mult(modelViewMatrix, scaleMatrix);
	CTM.push(temp);
    drawSphere(temp);
    

}

function drawHead()
{
	var ct = CTM.pop();

	var scaleMatrix = scalem(0.55, 0.7, 1);
	var temp = mult(scaleMatrix, ct);
	var translateMatrix = translate(1.75, 1.65, 0);
	temp = mult(temp, translateMatrix);

	//restore stack
	CTM.push(ct);

	//push state for descendents
	CTM.push(temp);

    drawSphere(temp);



    drawEyes();

}

function drawTail()
{
	var ct = CTM.pop();
	var temp;

	var rotateMatrix = rotate(50, [0, 0, 1]);
	temp = mult(rotateMatrix, ct);


	var scaleMatrix = scalem(0.1, 1.2, 0.1);
	temp = mult(temp, scaleMatrix);


	var translateMatrix = translate(-1.8, 1.65, 2)
	temp = mult(temp, translateMatrix);








	drawSphere(temp);
	CTM.push(ct);
}

function drawEyes()
{
	var ct = CTM.pop();
}
