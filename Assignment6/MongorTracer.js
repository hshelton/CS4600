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

var lightSource = vec3(0, -10, -5);

var skyColor = vec4(200, 200, 255, 255);



//rays start at they eye and have a direction vector
var rays = [];


var objects = 
[
	//the snowman is a collection of sphere objects
	
	//red ball
	{   
			objectType: "sphere",
			center: vec3(0, 2, 0),
			radius: 1,
			color: vec3(200, 0, 0),
			ambient:0.6,
			diffuse: 0.5,
			specular:  0

	},

		//green ball
	{   
			objectType: "sphere",
			center: vec3(2, 3, 0),
			radius: 1,
			color: vec3(0, 200, 0),
			ambient:0.6,
			diffuse: 0.5,
			specular:  0

	},
		//blue ball
	{   
			objectType: "sphere",
			center: vec3(1,1.5, 0),
			radius: 0.4,
			color: vec3(0, 0, 200),
			ambient:0.6,
			diffuse: 0.5,
			specular:  0

	},

		//white ball
	{   
			objectType: "sphere",
			center: vec3(1, -1, 1),
			radius: 1,
			color: vec3(255, 255, 255),
			ambient: 0.5,
			diffuse: 0.2,
			specular: 0.3

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
function trace(ray, recursionLevel, startPoint)
{
	if(recursionLevel > 3)
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
	var intersectionPoint = add(startPoint, scaleVec3(ray, closestObject.distance));



	var objectNormal = subtract( closestObject.object.center, intersectionPoint);
	//objectNormal [0] = objectNormal[0] * -1;
	//objectNormal [1] = objectNormal[1] * -1;
	objectNormal [2] = objectNormal[2] * -1;

	return calculateColor(ray, closestObject, intersectionPoint, recursionLevel, objectNormal);
	
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

	var eoDot = dot(ec, ec);

	var d = (object.radius * object.radius) - eoDot + (r * r);
	if(d < 0)
	{
		return;
	}
	var what = r - Math.sqrt(d);
	return r - Math.sqrt(d);
}








function calculateColor(ray, currentObject, intersectionPoint, depth, normal)
{
	var b = currentObject.color;

	var c = vec3(0, 0, 0);

	lambertAmount = 0;

	if(currentObject.diffuse > 0)
	{

            var lightPoint = lightSource;
            // First: can we see the light? If not, this is a shadowy area
            // and it gets no light from the lambert shading process.
            if (isLightVisible(intersectionPoint, lightPoint))
            {
   

            
            var contribution = dot(
                subtract(intersectionPoint, lightSource), normal);

           
            // sometimes this formula can return negatives, so we check:
            // we only want positive values for lighting.
            if (contribution > 0) lambertAmount += contribution;
            }
      
	}

	  if (currentObject.specular > 0) {

	  	var reflectionVector = getReflectionVector(ray, normal);

        var reflectedColor = trace(reflectionVector, ++depth, intersectionPoint);
        if (reflectedColor) {
            c = add(c, scaleVec3(reflectedColor, currentObject.specular));
        }
    }

     lambertAmount = Math.min(1, lambertAmount);

     var result = add(c,
        scaleVec3(b, lambertAmount * currentObject.diffuse));

     result = add(result, scaleVec3(b, currentObject.ambient));
	return vec4(result[0], result[1], result[2], 255);

}

	function isLightVisible(pt, light) {

	var ray = normalize(subtract(pt, light));

    var distObject =  getClosestObject(ray, pt);
        
    return true;
}


//calculate the reflection vector given the direction vector of the ray and the surface normal
function getReflectionVector(d, n)
{
	var a = dot(d, n);
	var b = a * 2;
	var c = add(d, scaleVec3(n, b));
	return c;
}

