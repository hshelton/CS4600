		"use strict";

		/* ----------------general variables ----------------------
		*
		*/
		var canvas, gl, program;
		var modelViewMatrix, projectionMatrix;
		var modelViewMatrixLoc, projectionMatrixLoc;
		var normalMatrix, normalMatrixLoc;
		var planeDrawn = false;
		var texCoordsArray = [];
		var pi = 3.141592654;

		var texture;

		var texCoord = [
		 	vec2(0,0),
		 	vec2(0,1),
		 	vec2(1,1),
		 	vec2(0,1)
		];

		var minX = 1;
		var maxX = -1;
		var minY = 99;
		var maxY = -1;

		var skip_TC = false;
		/*-------------------------------------------------------*/


		/* ----------positioning and perspective variables ------
		*
		*/
		var eye;
		var eyeX = 0.0;
		var eyeY = 0.0;
		var eyeZ = 8.0;
		var at;
		var atX = 1.0;
		var atY = 0.0;
		var atZ = 0.0;
		var up = vec3(0, 1.0, 0.0);
		var near = 7;
		var far = -12;
		/*-------------------------------------------------------*/



		/* -----------geometry variables -------------------------
		*
		*/
		//specify how many triangles make the spheres (how smooth)
		var numTimesToSubdivide = 5;
		//pointer for position in vertex array
		var index = 0;
		var xPos = 0;
		var zPos = 0;
		var userDirection = 0;

		//these arrays will keep track of the geometry
		var pointsArray = [];
		var normalsArray = [];
		var planeArray = [];
		var vertexColors = [];

		//these variables are for subdividing the sphere
		var va = vec4(0.0, 0.0, -1.0, 1);
		var vb = vec4(0.0, 0.942809, 0.333333, 1);
		var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
		var vd = vec4(0.816497, -0.471405, 0.333333, 1);

		//this is the transformation matrix stack
		var CTM = [];
		/*-------------------------------------------------------*/



		/*----------- lighting & material variables ----------------
		*
		*/

		var lightX = 1;
		var lightY = 3;
		var lightZ = 2;
		var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0 );
		var lightDiffuse = vec4( 0.8, 1.0, 1.0, 1.0 );
		var lightSpecular = vec4( 1, 1.0, 1.0, 1.0 );

		var brassMaterial = {
			ambient: vec4(0.329412, 0.223529, 0.027451, 1.0),
			diffuse: vec4(0.780392, 0.568627, 0.113725, 1.0),
			specular: vec4(0.992157, 0.941176, 0.807843, 1.0),
			shininess: 27.9074
		};

		var emeraldMaterial = {
			ambient: vec4(0.0215, 0.1745, 0.0215, 0.55),
			diffuse: vec4(0.07568, 0.61424, 0.07568, 0.55),
			specular: vec4(0.633, 0.727811, 0.633, 0.55),
			shininess: 76.8
		};

		var grassMaterial = {
			ambient: vec4(0.0215, 0.1745, 0.0215, 0.55),
			diffuse: vec4(0.07568, 0.61424, 0.07568, 0.55),
			specular: vec4(0.633, 0.727811, 0.633, 0.55),
			shininess: 15.0
		};

		var rubyMaterial = {
			ambient: vec4(0.1745, 0.01175, 0.01175, 0.55),
			diffuse: vec4(0.61424, 0.04136, 0.04136, 0.55),
			specular: vec4(0.727811, 0.626959, 0.626959, 0.55),
			shininess: 76.8
		};
		var pearlMaterial = 
		{
			ambient: vec4(0.25, 0.20725, 0.20725, 0.922),
			diffuse: vec4(1.0, 0.829, 0.829, 0.922),
			specular: vec4(0.296648, 0.296648, 0.296648, 0.922),
			shininess: 12.5
		};

		var lightMaterial = 
		{
			ambient: vec4(0.9, 0.9, 0.9, 0.9),
			diffuse: vec4(1.0, 0.829, 0.829, 0.922),
			specular: vec4(0.9, 0.9, 0.296648, 0.922),
			shininess: 99
		}


		var obsidianMaterial = 
		{
			ambient: vec4(0.05375, 0.05, 0.06625, 0.82),
			diffuse: vec4(0.18275, 0.17, 0.22525, 0.82),
			specular: vec4(0.332741, 0.328634, 0.346435, 0.82),
			shininess: 38.4
		};

		var turquoiseMaterial =
		{
			ambient: vec4(0.1, 0.18725, 0.1745, 0.8),
            diffuse: vec4(0.396, 0.74151, 0.69102, 0.8),
            specular:vec4(0.297254, 0.30829, 0.306678, 0.8),
            shininess:12.8
		}
	
		var currentShininessLoc, currentAbmientLoc, currentDiffuseLoc, currentSpecularLoc;
		var useTextureLoc;
		var lightLoc;
		/*-------------------------------------------------------*/


		function setMaterial(material)
		{
			var ambientProduct, diffuseProduct, specularProduct;


			gl.uniform1f( currentShininessLoc, material.shininess );

			ambientProduct = mult(lightAmbient, material.ambient);
    		diffuseProduct = mult(lightDiffuse, material.diffuse);
		    specularProduct =mult(lightSpecular, material.specular);

			gl.uniform4fv( currentAbmientLoc,flatten(ambientProduct) );
			gl.uniform4fv( currentDiffuseLoc,flatten(diffuseProduct) );
			gl.uniform4fv( currentSpecularLoc,flatten(specularProduct) );
		}

		//a plane for the dog to walk on
		function plane() {

		var yPos = -3.2;
		var a = vec4(-90, yPos - 1, -100, 1);
		var b = vec4(-90, -4.5, 10, 1);
		var c = vec4(90, -4.5, 10, 1);
		var d = vec4(90, yPos - 1, -100, 1);

		pointsArray.push(a);
		pointsArray.push(b);
		pointsArray.push(c);
		pointsArray.push(d);

		pointsArray.push(d);
		pointsArray.push(d);
	
		index +=6;

		normalsArray.push(a[0], a[1], a[2], 0.0);
		normalsArray.push(b[0], b[1], b[2], 0.0);
		normalsArray.push(c[0], c[1], c[2], 0.0);
		normalsArray.push(d[0], d[1], d[2], 0.0);
		normalsArray.push(d[0], d[1], d[2], 0.0);
		normalsArray.push(d[0], d[1], d[2], 0.0);




		}

		function triangle(a, b, c) {

		//these points will be vertices
		pointsArray.push(a);
		pointsArray.push(b);
		pointsArray.push(c);

		// normals are vectors
		normalsArray.push(a[0], a[1], a[2], 0.0);
		normalsArray.push(b[0], b[1], b[2], 0.0);
		normalsArray.push(c[0], c[1], c[2], 0.0);

		index += 3;

		if(skip_TC == false)
		{
			var aX = 0.5 +  (a[0] /2);
			var aY = 0.5 + (a[1] /2);

			var bX = 0.5 + (b[0] /2);
			var bY =  0.5 + (b[1] /2)

			var cX = 0.5 + (c[0] /2);
			var cY = 0.5 + (c[1] /2);





		texCoordsArray.push(vec2(aX, aY));
		texCoordsArray.push(vec2(bX, bY));
		texCoordsArray.push(vec2(cX, cY));


		}


		
		
		}

		//******* Code for sphere taken from Ed Angel's examples
		//use normalized vector to subdivide a triangle recursively
		function divideTriangle(a, b, c, count) {
		if (count > 0) {

		    var ab = mix(a, b, 0.5);
		    var ac = mix(a, c, 0.5);
		    var bc = mix(b, c, 0.5);

		    ab = normalize(ab, true);
		    ac = normalize(ac, true);
		    bc = normalize(bc, true);

		    divideTriangle(a, ab, ac, count - 1);
		    divideTriangle(ab, b, bc, count - 1);
		    divideTriangle(bc, c, ac, count - 1);
		    divideTriangle(ab, bc, ac, count - 1);
		}
		else {
		    triangle(a, b, c);
		}
		}

		//tetrahedron forms sphere from 3D gasket
		function tetrahedron(a, b, c, d, n) {
		divideTriangle(a, b, c, n);
		divideTriangle(d, c, b, n);
		divideTriangle(a, d, b, n);
		divideTriangle(a, c, d, n);
		}

		//intiialize WebGL confi and set up program
		//Some of the code here was taken from Ed Angel's examples

		window.onload = init;

		function init() {

		canvas = document.getElementById("gl-canvas");

		gl = WebGLUtils.setupWebGL(canvas);
		if (!gl) { alert("WebGL isn't available"); }

		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		gl.enable(gl.DEPTH_TEST);

		//
		//  Load shaders and initialize attribute buffers
		//
		var program = initShaders(gl, "vertex-shader", "fragment-shader");
		gl.useProgram(program);

		plane();
		tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

		var nBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

		var vNormal = gl.getAttribLocation(program, "vNormal");
		gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vNormal);

		var vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

		var vPosition = gl.getAttribLocation(program, "vPosition");
		gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPosition);

	

		//bind vertexColors as the array holding pixel colors
		var cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

		

		//set up mv matrix projection matrix, and normal matrix as variables for WebGL
		modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
		projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
		normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
	


		var ambientProduct = mult(lightAmbient, emeraldMaterial.ambient);
    	var diffuseProduct = mult(lightDiffuse, emeraldMaterial.diffuse);
   		var specularProduct = mult(lightSpecular, emeraldMaterial.specular);

   		//hold on to memory addresses for shader uniforms
   		currentShininessLoc = gl.getUniformLocation(program, "shininess");
   		currentAbmientLoc = gl.getUniformLocation(program, "ambientProduct");
   		currentDiffuseLoc =gl.getUniformLocation(program, "diffuseProduct");
   		currentSpecularLoc = gl.getUniformLocation(program, "specularProduct");
   		useTextureLoc = gl.getUniformLocation(program, "useTexture");


		gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
		gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
		gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
		lightLoc = gl.getUniformLocation(program, "lightPosition");
		gl.uniform4fv(lightLoc ,flatten(vec4(lightX, lightY, lightZ)) );
		


		gl.uniform1f( currentShininessLoc, emeraldMaterial.shininess );
		gl.uniform1f(useTextureLoc, 0.0);


	
		//set up texture coordinates
		var tBuffer = gl.createBuffer();
	    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
	    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

	    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
	    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
	    gl.enableVertexAttribArray( vTexCoord );

	    var image = document.getElementById("texImage");
   		configureTexture( image );

   
		render();
		}


		//Set up event listeners so that variables update when the user changes the slider values
		document.getElementById("lightXSlider").onchange = function (event) {
		lightX = parseFloat(event.target.value);
		render();
		};
		
		document.getElementById("lightYSlider").onchange = function (event) {
		lightY = parseFloat(event.target.value);
		render();
		};

		document.getElementById("lightZSlider").onchange = function (event) {
		lightZ = parseFloat(event.target.value);
		render();
		};

		document.getElementById("eyeXSlider").onchange = function (event) {
		eyeX = parseFloat(event.target.value);
		render();
		};
		
		document.getElementById("eyeYSlider").onchange = function (event) {
		eyeY = parseFloat(event.target.value);
		render();
		};

		document.getElementById("eyeZSlider").onchange = function (event) {
		eyeZ = parseFloat(event.target.value);
		render();
		};

		document.getElementById("directionSlider").onchange = function (event) {
        userDirection = parseFloat(event.target.value);
     	render();
   		 };

    document.getElementById("atXSlider").onchange = function (event) {
        atX = parseFloat(event.target.value);
        at = vec3(atX, atY, atZ);
        render();
    };
    document.getElementById("atYSlider").onchange = function (event) {
        atY = parseFloat(event.target.value);
        at = vec3(atX, atY, atZ);
        render();
    };
    document.getElementById("atZSlider").onchange = function (event) {
        atZ = parseFloat(event.target.value);
        at = vec3(atX, atY, atZ);
        render();
    };

   


		//render is recursively called to keep drawing the scene
		var render = function () {

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		eye = vec3(eyeX, eyeY, eyeZ);
		at = vec3(atX, atY, atZ);
		modelViewMatrix = lookAt(eye, at, up);

		//eighty degree frustrum
		projectionMatrix = perspective(90, 1, near, far);

		//normal matrix for non uniform scaling
		normalMatrix = [
		    vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
		    vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
		    vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
		];

		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
		gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
		gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
		
		//draw large sphere for texture shading
		
		var sphereMatrix = mult(scalem(3, 3, 3), translate(3, -0.6, -1));
		planeDrawn = false;
		drawSphere(sphereMatrix);
		planeDrawn = true;

		
		drawDog();

	
		}


	//this code will set up a texture from an image
	function configureTexture( image ) {
	    texture = gl.createTexture();
	    gl.bindTexture( gl.TEXTURE_2D, texture );
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
	         gl.RGB, gl.UNSIGNED_BYTE, image );
	    gl.generateMipmap( gl.TEXTURE_2D );
	    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
	                      gl.NEAREST_MIPMAP_LINEAR );
	    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
	}



		//draw a sphere, and if it's the first one, draw the plane
		function drawSphere(_ctm) {
		var temp = modelViewMatrix;
		var m = mult(modelViewMatrix, _ctm);
		if (planeDrawn == false) {
			setMaterial(grassMaterial);
		    gl.drawArrays(gl.TRIANGLE_FAN, 0,4);
		    planeDrawn = true;
		    setMaterial(pearlMaterial);

		    //tell fragment shader to use texture
		    gl.uniform1f(useTextureLoc, 1.0);

		}
		else
		{
			//tell fragment shader not to use texture
			gl.uniform1f(useTextureLoc, 0.0);
			  skip_TC = true;
		}

		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(m));

		for (var i = 6; i <index; i += 3) {

		    gl.drawArrays(gl.TRIANGLE_FAN,i, 3);

			}
		}

		//traverse the heirarchy and apply the correct transformations relative to eachother to draw the dog
		function drawDog() {

		setMaterial(pearlMaterial);
		drawBody();

		setMaterial(emeraldMaterial);
		drawHead();

		setMaterial(brassMaterial);
		drawTail();

		setMaterial(turquoiseMaterial);
		drawLegs();

		}

		function drawLight()
		{

			var mat = translate(lightX, lightY, lightZ);

			//gl.uniform4fv(lightLoc, false, flatten(mat));

			setMaterial(lightMaterial);
			drawSphere(mat);
		gl.uniform4fv(lightLoc ,flatten(vec4(lightX, lightY, lightZ)) );
		}

		function drawBody() {
		var mat;

		var initialDirection = rotate(userDirection, [0, 1, 0]);
		var scaleMatrix = scalem(1.3, 1, 1);
		var translateMatrix = translate(xPos, -1.8, -2 + (-1 * zPos));
		mat = mult(mult(translateMatrix, scaleMatrix), initialDirection);

		CTM.push(mat);
	
		drawSphere(mat);

		drawLight();
		}

		function drawHead() {
		var ct = CTM.pop();
		var holder = ct;

		var temp = mult(ct, scalem(0.55, 0.7, 0.55));
		var translateMatrix = translate(1.50, 1.3, 0);
		temp = mult(temp, translateMatrix);

	
		CTM.push(ct);

		//push state for descendents that are siblings
		CTM.push(temp);
		drawSphere(temp);

		setMaterial(rubyMaterial);
		drawSnout();
		CTM.push(temp);


		drawEars();

		setMaterial(pearlMaterial);
		drawEyes();

			

		}

		function drawTail() {
		var ct = CTM.pop();
		var temp;

		var rotateMatrix = rotate(50, [0, 0, 1]);
		temp = mult(ct, rotateMatrix);


		var scaleMatrix = scalem(0.2, 0.8, 0.1);
		temp = mult(temp, scaleMatrix);


		var translateMatrix = translate(-1.8, 1.65, 0)
		temp = mult(temp, translateMatrix);

		drawSphere(temp);
		CTM.push(ct);
		}


		function drawLegs() {
		var ct = CTM.pop();

		var angle = 0;

		var scaleMatrix = scalem(0.35, 1.1, 0.25);
		var def = mult(ct, rotate(angle, [0, 0, 1]));
		def = mult(def, scaleMatrix);
		def = mult(def, translate(-2, -1, 2));

		CTM.push(def);
		drawLegOne();
		drawLegFour();
		CTM.pop();        

		scaleMatrix = scalem(0.35, 1.1, 0.25);
		def = mult(ct, rotate(angle, [0, 0, 1]));
		def = mult(def, scaleMatrix);
		def = mult(def, translate(-2, -1, 2));
		CTM.push(def);
		drawLegTwo();
		drawLegThree();

		def = mult(ct, scaleMatrix);

		CTM.push(ct);
		}

		//far hind leg
		function drawLegOne() {
		var ct = CTM.pop();
		CTM.push(ct);

		ct = mult(ct, translate(0, 0, -5));

		drawSphere(ct);


		//draw foot
		ct = mult(ct, scalem(1.6, 0.3, 1));

		ct = mult(ct, translate(0.5, -2.5, 0));
		drawSphere(ct);

		}

		//far front leg
		function drawLegTwo() {
		var ct = CTM.pop();
		CTM.push(ct);
		ct = mult(ct, translate(4, 0, -5));
		drawSphere(ct);

		//draw foot
		ct = mult(ct, scalem(1.3, 0.3, 1));
		ct = mult(ct, translate(0.5, -2.5, 0));
		drawSphere(ct);

		}

		//near front leg
		function drawLegFour() {
		var ct = CTM.pop();
		CTM.push(ct);
		ct = mult(ct, translate(4, 0.5, -0.5));
		drawSphere(ct);

		//draw foot
		ct = mult(ct, scalem(1.3, 0.3, 1));
		ct = mult(ct, translate(0.5, -2.5, 0));
		drawSphere(ct);

		}

		//near hind leg
		function drawLegThree() {

		var ct = CTM.pop();
		CTM.push(ct);
		ct = mult(ct, translate(0, 0.5, 0));
		drawSphere(ct);

		//draw foot
		ct = mult(ct, scalem(1.6, 0.3, 1));

		ct = mult(ct, translate(0.5, -2.5, 0));
		drawSphere(ct);

		}

		function drawSnout() {
		var ct = CTM.pop();
		CTM.push(ct);
		ct = mult(ct, rotate(15, [0, 0, 1]));
		ct = mult(ct, scalem(0.8, 0.4, 0.85));
		ct = mult(ct, translate(1, 0, 0));
		drawSphere(ct);

		//lower snout
		ct = CTM.pop();
		ct = mult(ct, rotate(15, [0, 0, 1]));
		ct = mult(ct, scalem(0.6, 0.3, 0.50));
		ct = mult(ct, translate(1.5, -1, 0));
		drawSphere(ct);
		}

		function drawEars() {
		var ct = CTM.pop();
		CTM.push(ct);

		ct = mult(ct, rotate(15, [0, 0, 1]));
		ct = mult(ct, scalem(0.35, 0.8, 0.5));
		ct = mult(ct, translate(-1.5, 1.5, 1.5));
		drawSphere(ct);

		ct = CTM.pop();
		ct = mult(ct, translate(-0.6, 1, -0.5));
		ct = mult(ct, rotate(15, [0, 0, 1]));
		ct = mult(ct, scalem(0.35, 0.8, 0.5));

		drawSphere(ct);
		}

		function drawEyes()
		{
			var ct = CTM.pop();
			CTM.push(ct);

		ct = mult(ct, rotate(15, [0, 0, 1]));
		ct = mult(ct, translate(1.45, 1.0, 0.2));
		ct = mult(ct, scalem(0.1, 0.2, 0.1));
		
		drawSphere(ct);

		ct = CTM.pop();
		CTM.push(ct);
		ct = mult(ct, rotate(15, [0, 0, 1]));
		ct = mult(ct, translate(1.45, 1.0, -0.2));
		ct = mult(ct, scalem(0.1, 0.2, 0.1));
		

		drawSphere(ct);

		}