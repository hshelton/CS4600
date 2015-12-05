/** Mongor Tracer - Written by Hayden Shelton for CS4600 2015 */

/*************************initial setup ****************************/
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
//square viewing box
var viewingDim = 512; 
//this is where the image pixels will be stored
var imageData = context.getImageData(0, 0, viewingDim, viewingDim);

/*********************Scene Variables ******************************/
var eye = vec3(0, 1.8, 10);
var at = vec3(-1, 3, 0);
var fovDegrees = 60;

var lightSource = vec3(3, -5, 50);

var skyColor = vec4(200, 200, 255, 255);

//rays start at they eye and have a direction vector
var rays = [];


var objects = 
[
	{   //the snowman is a collection of sphere objects
		objectType: "sphere",
		center: vec3(0, 2, 0),
		radius: 1.5,
		color: vec3(155, 200, 155),
		ambient: 0.1,
		diffuse: 0.9,
		specular: 0.2

	}

];

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
	//convert fov to radians
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
function trace(ray, recursionLevel)
{
	if(recursionLevel > 3)
	{
		return;
	}
	
	//only the closest object that we intersect with is of any value, since this is a scene with no semitranslucent
	//objects
	var closestObject = getClosestObject(ray);

  //if the ray hits no objects, then the color is just the default sky color
	if(closestObject.distance == Math.max)
	{
		return skyColor;
	}
	

	//if the ray does hit an object, we need to calculate the point of intersection
	var intersectionPoint = add(eye, scaleVec3(ray, closestObject.distance));

	var objectNormal = subtract(intersectionPoint, closestObject.object.center);

	return calculateColor(ray, closestObject, intersectionPoint, recursionLevel, objectNormal);
	
}

//this function determines if a ray has a collision, and if so determines the object that it hits which is
//closest to the eye point
function getClosestObject(ray)
{
	//this is the object we'll eventually return
	var closestObject = {distance: Math.max, object: null};

	//now we need to check this ray for intersections against all of the geometry in the scene


	for(var i =0; i < objects.length; i++)
	{
		closestObject.object = objects[i];
		if(objects[i].objectType == "sphere")
		{
			//determine if the ray intersects with this sphere
			closestObject.distance = intersectSphere(ray, objects[i]);
		}
	}

	return closestObject;
}


function intersectSphere(ray, object)
{
	//this vector is a straight line from eye to center of the sphere
	var ec = subtract(object.center, eye);

	var r = dot(ec, ray);

	var eoDot = dot(ec, ec);

	var d = (object.radius * object.radius) - eoDot + (r * r);
	if(d < 0)
	{
		return Math.max;
	}
	return r = Math.sqrt(d);
}


/*


fun
for(var i = 0; i < 30000; i+=4)
{
       var what = imageData.data[i];
       imageData.data[i] = 0;
       imageData.data[i+1] = 0;
       imageData.data[i+2] = 255;
       imageData.data[i+3] = 255;
}
*/

//this loads imageData into the canvas to display the ray traced image
context.putImageData(imageData, 0, 0);



var x = 32;


function calculateColor(ray, currentObject, intersectionPoint, depth, normal)
{

	return vec4(244, 222, 222, 255);
}