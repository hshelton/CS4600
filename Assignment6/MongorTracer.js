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

//rays start at they eye and have a direction vector
var rays = [];

//the snowman is a collection of sphere objects
var snowman = 
[
	{
		objectType: "shpere",
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


function traceRay(ray, x, y)
{

		color = trace(ray, 0);

		//figure out which pixel to write to
		index = x * 4 + (y * viewingDim * 4);
		imageData.data[index +0 ] = Math.floor(Math.random() * 256); //r
		imageData.data[index + 1] = Math.floor(Math.random() * 256); //g
		imageData.data[index + 2] = Math.floor(Math.random() * 256); //b
		imageData.data[index + 3] = Math.floor(Math.random() * 256); //alpha
	


}

function trace()
{
	return;
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
