    "use strict";
    var canvas, gl, program;
    var modelViewMatrix, projectionMatrix;
    var modelViewMatrixLoc, projectionMatrixLoc;
    var normalMatrix, normalMatrixLoc;
    var planeMatrix, planeMatrixLoc, tempLoc;

    //specify how many triangles make the spheres (how smooth)
    var numTimesToSubdivide = 3;
    
    //pointer for position in vertex array
    var index = 0;

    var planeDrawn = false;
    var eye;
    var at = vec3(0, 1, 0.0);
    var up = vec3(0, 1.0, 0.0);

    //initial settings for the scene
    var speed = 0.02;

    var atX = 1.0;
    var atY = 0.0;
    var atZ = 0.0;
    var near = 7;
    var far = -12;

    var eyeX = 0.0;
    var eyeY = 0.0;
    var eyeZ = 8.0;

    var xPos = 0.0;
    var zPos = 0.0;
    var userDirection = 0;

    var previousX = xPos;
    var previousZ = zPos;
    var useZ = false;

    var track_camera = false;

    //these arrays will keep track of the geometry
    var pointsArray = [];
    var normalsArray = [];
    var planeArray = [];
    var vertexColors = [];

    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    
    //this is the transformation matrix stack
    var CTM = [];

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

        var e = vec4(0, 0, 0, 1.0);
        pointsArray.push(e);
        pointsArray.push(e);

        index += 6;

        normalsArray.push(a[0], a[1], a[2], 0.0);
        normalsArray.push(b[0], b[1], b[2], 0.0);
        normalsArray.push(c[0], c[1], c[2], 0.0);
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

        //the first couple of colors are for the plane
        vertexColors.push(vec4(0.2, 0.5, 0.6, 1));
        vertexColors.push(vec4(0.3, 0.8, 0.4, 1));
        vertexColors.push(vec4(0.3, 0.8, 0.4, 1));
        vertexColors.push(vec4(0.2, 0.5, 0.6, 1));
        //set up random colors
        for (var i = 0; i < 10000; i++) {
            var r = Math.random();
            var g = Math.random();
            var b = Math.random();
            vertexColors.push(vec4(r, g, b, 1));
        }
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

        //set up a variable 'vColor' for 
        var vertexColor = gl.getAttribLocation(program, "vertexColor");
        gl.vertexAttribPointer(vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vertexColor);

        planeMatrix = mat4();
        //set up mv matrix projection matrix, and normal matrix as variables for WebGL
        modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
        normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
        planeMatrixLoc = gl.getUniformLocation(program, "planeMatrix");
        render();
    }


    //Set up event listeners so that variables update when the user changes the slider values
    document.getElementById("speedSlider").onchange = function (event) {
        speed = parseFloat(event.target.value);
        
    };

    document.getElementById("atXSlider").onchange = function (event) {
        atX = parseFloat(event.target.value);
        at = vec3(atX, atY, atZ);
    };
    document.getElementById("atYSlider").onchange = function (event) {
        atY = parseFloat(event.target.value);
        at = vec3(atX, atY, atZ);
    };
    document.getElementById("atZSlider").onchange = function (event) {
        atZ = parseFloat(event.target.value);
        at = vec3(atX, atY, atZ);
    };

    document.getElementById("eyeXSlider").onchange = function (event) {
        eyeX = parseFloat(event.target.value);
        eye = vec3(eyeX, eyeY, eyeZ);
    };
    document.getElementById("eyeYSlider").onchange = function (event) {
        eyeY = parseFloat(event.target.value);
        eye = vec3(eyeX, eyeY, eyeZ);
    };
    document.getElementById("eyeZSlider").onchange = function (event) {
        eyeZ = parseFloat(event.target.value);
        eye = vec3(eyeX, eyeY, eyeZ);
    };

    document.getElementById("directionSlider").onchange = function (event) {
        userDirection = parseFloat(event.target.value);
        useZ = true;
    };

    function preset1()
    {
        var _eye = [9.0, 24.0, 17.0];
        var _at = [-10, 0, -10];
        var _dir = 143;
        var _speed = 0.12;
        triggerChange(_speed, _dir, _at, _eye);
        useZ = true;
    }

    function preset2()
    {
        var _eye = [0, 0, 0];
        var _at = [1, 0, -5];
        zPos = 40;
        var _dir = 280;
        var _speed = 0.08;
        triggerChange(_speed, _dir, _at, _eye);
        useZ = true;
    }

    function tracking()
    {
        track_camera = !track_camera;

    }
    function triggerChange(_speed, _dir, _at, _eye)
    {
        document.getElementById("speedSlider").value = _speed;
        document.getElementById("directionSlider").value = _dir;
        document.getElementById("atXSlider").value = _at[0];  
        document.getElementById("atYSlider").value = _at[1];
        document.getElementById("atZSlider").value = _at[2];
        document.getElementById("eyeXSlider").value = _eye[0];
        document.getElementById("eyeYSlider").value = _eye[1];
        document.getElementById("eyeZSlider").value = _eye[2];

        
        var ev = new Event('change');

        var elem = document.getElementById("speedSlider");
        elem.dispatchEvent(ev);

        elem = document.getElementById("directionSlider");
        elem.dispatchEvent(ev);

        elem =document.getElementById("atXSlider");
        elem.dispatchEvent(ev);

        elem = document.getElementById("atYSlider");
        elem.dispatchEvent(ev);

        elem = document.getElementById("atZSlider");
        elem.dispatchEvent(ev);

        elem = document.getElementById("eyeXSlider");
        elem.dispatchEvent(ev);

        elem = document.getElementById("eyeYSlider");
        elem.dispatchEvent(ev);

        elem = document.getElementById("eyeZSlider");
        elem.dispatchEvent(ev);

        track_camera = false;
    }


    //reset everything except for the speed and direction
    document.getElementById('body').onkeydown = function (event) {
     
        if (event.keyCode == 82) {
            xPos = 0;
            zPos = 0;
            atX = 1.0;
            atY = 0.0;
            atZ = 0.0
            at = vec3(atX, atY, atZ);

            eyeX = 0.0;
            eyeY = 0.0;
            eyeZ = 8.0;
            eye = vec3(eyeX, eyeY, eyeZ);
            triggerChange(speed, userDirection, [1, 0, 0], [0, 0, 8]);


            
        }

        else 
        {
            if(event.keyCode == 38 || event.keyCode == 40)
            {
                    var elem = document.getElementById("directionSlider");
               
               //up
                if(event.keyCode == 40)
                {
                    if(userDirection >= 0)
                    {
                        elem.stepUp(-2);
                    }
                }
                //down
                if(event.keyCode == 38)
                {
                  
                        elem.stepUp(1);
                }

                var ev = new Event('change');
                elem.dispatchEvent(ev);
            }
        }

    };

    //render is recursively called to keep drawing the scene
    var render = function () {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);




        eye = vec3(eyeX, eyeY, eyeZ);
        at = vec3(atX, atY, atZ);
        modelViewMatrix = lookAt(eye, at, up);

        //eighty degree frustrum
        projectionMatrix = perspective(80, 1, near, far);

        //normal matrix for non uniform scaling
        normalMatrix = [
            vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
            vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
            vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
        ];

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));
        gl.uniformMatrix4fv(planeMatrixLoc, false, flatten(planeMatrix));
        planeDrawn = false;
        drawDog();
    }

    //draw a sphere, and if it's the first one, draw the plane
    function drawSphere(_ctm) {
        var temp = modelViewMatrix;
        var m = mult(modelViewMatrix, _ctm);
        if (planeDrawn == false) {

            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
            planeDrawn = true;
        }

        planeMatrix = mat4();
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(m));

        for (var i = 6; i < index; i += 3) {

            gl.drawArrays(gl.TRIANGLE_STRIP, i, 3);

        }
    }

    //traverse the heirarchy and apply the correct transformations relative to eachother to draw the dog
    function drawDog() {
        drawBody();
        previousX = xPos;
        previousZ = zPos;
        //update x and y position based on the direction he's walking in
        xPos += speed * Math.cos(radians(userDirection));
        zPos += speed * Math.sin(radians(userDirection));

        if(track_camera)
        {
            atX = xPos /3;
            atZ = zPos/3;
          
        }
        drawHead();

        drawTail();

        drawLegs();

        setTimeout(function () { window.requestAnimFrame(render); }, 20);

    }
   
    function drawBody() {
        var mat;

        var initialDirection = rotate(userDirection, [0, 1, 0]);
        var scaleMatrix = scalem(1.3, 1, 1);
        var translateMatrix = translate(xPos, -1.8, -2 + (-1 * zPos));
        mat = mult(mult(translateMatrix, scaleMatrix), initialDirection);

        CTM.push(mat);
        drawSphere(mat);
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
        drawSnout();
        CTM.push(temp);
        drawEars();

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

     
        var angle;

        var deltaX = Math.abs(xPos -previousX);
        var takeZ = useZ && deltaX < 0.03 && previousZ != zPos;

        if(takeZ)
        {
            angle = 27 * Math.sin(zPos);
        }
        else
        {
             angle = 27 * Math.sin(xPos);
        }
     



        var scaleMatrix = scalem(0.35, 1.1, 0.25);
        var def = mult(ct, rotate(angle, [0, 0, 1]));
        def = mult(def, scaleMatrix);
        def = mult(def, translate(-2, -1, 2));

        CTM.push(def);
        drawLegOne();
        drawLegFour();
        CTM.pop();

        if(takeZ)
        {
            angle = -27 * Math.sin(zPos);
        }
        else
        {
             angle = -27 * Math.sin(xPos);
        }
       
        
    
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