/** Mongor Tracer - Written by Hayden Shelton for CS4600 2015 */

/*************************initial setup ****************************/
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
//square viewing box
var viewingDim = 512; 
//this is where the image pixels will be stored
var imageData = context.getImageData(0, 0, viewingDim, viewingDim);

/*********************Scene Variables ******************************/
var eye = vec3(0, 2, 5);
var at = vec3(-1, 2.5, 0);
var fovDegrees = 60;

var lightSource = vec3(5, -20, 0);

var skyColor = vec4(202, 242, 255, 255);



//rays start at they eye and have a direction vector
var rays = [];


var objects = 
[
	//the snowman is a collection of sphere objects
	
	//purple ball
	{   
			objectType: "sphere",
			center: vec3(0, 4, 0),
			radius: 1,
			color: vec3(102, 0, 51),
			ambient:0.5,
			diffuse: 0.5,
			specular:  0

	},

		//green ball
	{   
			objectType: "sphere",
			center: vec3(0, 2.5, 0),
			radius: 0.7,
			color: vec3(51, 204, 51),
			ambient:0.3,
			diffuse: 0.4,
			specular: 0.5

	},
		//blue ball
	{   
			objectType: "sphere",
			center: vec3(0,1.5, 0),
			radius: 0.5,
			color: vec3(0, 176, 252),
			ambient:0.5,
			diffuse: 0.5,
			specular:  0

	},

		//black ball
	{
			objectType: "sphere",
			center: vec3(0,1.0, 0),
			radius: 0.24,
			color: vec3(0, 0, 0),
			ambient:0.5,
			diffuse: 0.5,
			specular:  0
	},

    //mirror sphere
    {
        objectType: "sphere",
        center: vec3(-1.8, 2.5, 0.8),
        radius: 0.54,
		color: vec3(100, 100, 100),
		ambient:0.0,
		diffuse: 0.0,
		specular: 0.8
    }


]

render();

/*Render does the actual throwing of rays */

function render()
{
	//compute a vector that begins at the eye coordinates and is pointing at 'at'
	var eyeUnit = normalize(subtract(at, eye));

	//for the eye vector we want to compute an up vector and a right vector to define frustrum
	var eyeRight = normalize( cross(eyeUnit, vec3(0, 1, 0)) );
	var eyeUp = normalize(cross(eyeRight, eyeUnit));

	//now we generate a bunch of rays
	var fovRadians = Math.PI * (fovDegrees /2) / 180;

	//we want a ray for each square 'pixel'
	var pixelDim = fovRadians * 2 /viewingDim;

	for(var i = 0; i < viewingDim; i++)
	{
		for(var j = 0; j < viewingDim; j++)
		{
			var xOffset = scaleVec3(eyeRight, (i * pixelDim) - fovRadians);
			var yOffset = scaleVec3(eyeUp, (j * pixelDim) - fovRadians);

			var currentRay = (normalize( add(add(eyeUnit, xOffset), yOffset)));

			traceRay(currentRay, i, j);

		}
	}
	context.putImageData(imageData, 0, 0);
}

//this is a helper funtion for trace
//it calls trace and colors the pixel according to the color returned by trace
function traceRay(ray, x, y)
{

		color = trace(ray, 0);
		//color = vec4(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), 255.0);

		//figure out which pixel to write to
		index = x * 4 + (y * viewingDim * 4);
		imageData.data[index +0 ] = color[0]; //r
		imageData.data[index + 1] = color[1];  //g
		imageData.data[index + 2] = color[2];  //b
		imageData.data[index + 3] = color[3]; //alpha
	
}

//recursively trace the ray to keep getting color from the objects it hits
function trace(ray, recursionLevel, startPoint)
{
	if(recursionLevel > 8)
	{
		return;
	}
	
	if(startPoint == undefined)
	{
		startPoint = eye;
	}
	//only the closest object that we intersect with is of any value, since this is a scene with no semitranslucent
	//objects
	var closestObject = getClosestObject(ray, startPoint);

  //if the ray hits no objects, then the color is just the default sky color
	if(closestObject.distance == Number.MAX_VALUE)
	{
		return skyColor;
	}
	

	//if the ray does hit an object, we need to calculate the point of intersection
	var intersectionPoint = add(startPoint, scaleVec3(ray, closestObject.distance + 0.1));

	

	var objectNormal = subtract( closestObject.object.center, intersectionPoint);
	//objectNormal [0] = objectNormal[0] * -1;
	//objectNormal [1] = objectNormal[1] * -1;
	objectNormal [2] = objectNormal[2] * -1;


	var currentObject = closestObject;

    //figure out the color contribution of this ray
	var a = closestObject.color;

	var b = vec3(0, 0, 0);
	
	specularContribution = 0;



	if (closestObject.specular > 0) {

	    var reflectionVector = getReflectionVector(ray, objectNormal);

	    var reflectedColor = trace(reflectionVector, ++recursionLevel, intersectionPoint);
	    if (reflectedColor) {
	        b = add(b, scaleVec3(reflectedColor, closestObject.specular));
	    }
	}

	if (closestObject.diffuse > 0) {

	   
	    var contribution = dot(
    subtract(intersectionPoint, lightSource), objectNormal);

	    if (contribution > 0) {
	        b = add(b, scaleVec3(closestObject.color, closestObject.diffuse));
	    }


	}

	if (specularContribution > 1)
	{
	    specularContribution = 1;
	}

    //TODO: FIGURE OUT IF THE OBJECT IS IN SHADOW

	var result = add(b,
       scaleVec3(a, specularContribution * closestObject.diffuse));

	result = add(result, scaleVec3(a, closestObject.ambient));
	return vec4(result[0], result[1], result[2], 255);
	
}

//this function determines if a ray has a collision, and if so determines the object that it hits which is
//closest to the eye point
function getClosestObject(ray, rayStart)
{
	//this is the object we'll eventually return
	var closestObject = {distance: Number.MAX_VALUE};
	var currentDistance;
	//now we need to check this ray for intersections against all of the geometry in the scene

	for(var i =0; i < objects.length; i++)
	{
		if(objects[i].objectType == "sphere")
		{
			//determine if the ray intersects with this sphere
			currentDistance = intersectSphere(ray, rayStart, objects[i]);
		}

		if(currentDistance < closestObject.distance )
		{
			closestObject.distance = currentDistance;
			closestObject.object = objects[i];
			closestObject.color = objects[i].color;
			closestObject.specular = objects[i].specular;
			closestObject.diffuse = objects[i].diffuse;
			closestObject.ambient = objects[i].ambient;
		}
	}

	return closestObject;
}


function intersectSphere(ray, rayStart, object)
{

	var ec = subtract( object.center, eye);
	var r = dot(ec, ray);
	var ecDot = dot(ec, ec);

	var d = (object.radius * object.radius) - ecDot + (r * r);
	if(d < 0)
	{
		return;
	}
	
	return r - Math.sqrt(d);
}


//calculate the reflection vector given the direction vector of the ray and the surface normal
function getReflectionVector(d, n)
{
	var a = dot(d, n);
	var b = a * 2;
	var c = add(d, scaleVec3(n, b));
	
	c[0] *= -1;
	c[1] *= -1;
	c[2] *= -1;

	return c;
}

