//setup

var c = document.getElementById('c'),
    width = 512,
    height = 512;

c.width = width;
c.height = height;
c.style.cssText = 'width:' + (width * 2) + 'px;height:' + (height*2) + 'px';
var ctx = c.getContext('2d');
var data = ctx.getImageData(0, 0, width, height);

var tileCount = 0;
//the scene
var scene = {};

//the camera is a point in space. field of view is like the viewing frustrum
//vector is where they camera is looking at
scene.camera = { //synonomous to 'eye'
    point: {
        x: 0,
        y: 1.8,
        z: 10
    },
    fieldOfView: 60,
    vector: { //synonomous to 'at'
        x: -1,
        y: 3,
        z: 0
    }
};

//the lights - we are using point lighting
scene.lights = [{
    x: 3,
    y: -5,
    z: 5
},

];

//this ray tracer handles only sphere objects with material properties
scene.objects = [ //synonomous to snowman, plane, etc
    {
        type: 'sphere',
        point: {
            x: 0,
            y: 2,
            z: 0
        },
        color: {
            x: 155,
            y: 200,
            z: 155
        },
        specular: 0.2, //same name
        lambert: 0.9, //changed to diffuse
        ambient: 0.1, //same name
        radius: 1.5
    },
   
   
    {
        type: 'sphere',
        point: {
            x: -2,
            y: 2,
            z: 1
        },
        color: {
            x: 244,
            y: 10,
            z: 18
        },
        specular: 0.1,
        lambert: 1.0,
        ambient: 0.1,
        radius: 0.8
    },
   

  
];



render(scene);

//throwing rays
function render(scene) {
	var camera = scene.camera,
    objects = scene.objects,
    lights = scene.lights;



  	var eyeVector = Vector.unitVector(Vector.subtract(camera.vector, camera.point));
  	var vpRight = Vector.unitVector(Vector.crossProduct(eyeVector, Vector.UP));
    var vpUp = Vector.unitVector(Vector.crossProduct(vpRight, eyeVector));

    //the numbers here are based on the ratio between width and height. *look into this more before copying **
   var fovRadians = Math.PI * (camera.fieldOfView / 2) / 180;

   var pixelDim = fovRadians * 2 / 512;
    

    //turn the raw pixel x and y values into values from -1 to 1 (clip space) and use these values
    //to scale the facing right and facing up vectors so that we generate a bunch of skewed eyeVectors
    //this is basically creating a bunch of vectors pointing in different directions, but coming from
    //the eye
    var index, color;

    //every ray has a starting point and a vector that points in some direction
    //in my implemnation, I should just have an array of rays, versus one array that keeps getting it's vector
    //component switched out.
    var ray = {
        point: camera.point
    };

   	//shit looks fancy but it's just computing a bunch of vectors. so it converts x and y to values between 1 and -1 and
   	//then sqews the up and right vectors to get a bunch of vectors
    for (var x = 0; x < 256; x++) {
     	for (var y = 0; y < 256; y++) {
            var xcomp = Vector.scale(vpRight, (x * pixelDim) - fovRadians);
            var ycomp = Vector.scale(vpUp, (y * pixelDim) - fovRadians);

            ray.vector = Vector.unitVector(Vector.add3(eyeVector, xcomp, ycomp));

            //for each vector, use it to ray trace the scene!!!

            //trace will return a color for dis pixel :)
			color = trace(ray, scene, 0);

			//figure out which index in the image to put this pixel at & color da pixel
			index = (x * 4) + (y * width * 4),
			data.data[index + 0] = color.x;
            data.data[index + 1] = color.y;
            data.data[index + 2] = color.z;
            data.data[index + 3] = 255;

    	}    
	}
	 //send image data to the canvas for display
	 ctx.putImageData(data, 0, 0);
}

//trace
//given a ray, shoot it until it hits an object and return that object's color, or Vector.WHITE if no object is found.
//it's recursive depth is 3

function trace(ray, scene, depth) {

    if (depth > 4) return;

    //get the next object
    var distObject = intersectScene(ray, scene);

	//If we don't hit anything, fill this pixel with the background color - in this case, white.

    if (distObject[0] === Infinity) {
        return Vector.WHITE;
    }

        var dist = distObject[0],
        object = distObject[1];

    //point at time is the intersection point of this ray into this object
    //it is computed by taking the direction of the ray and making it as long as the distance returned by the intersection check
    //so if we have vector (1, 0.5, 2.5) and it hits the object, make it a new vector that's just scaled up to the distance where it intersects with the object
     var pointAtTime = Vector.add(ray.point, Vector.scale(ray.vector, dist));


    

     return surface(ray, scene, object, pointAtTime, sphereNormal(object, pointAtTime), depth);
}



// # Detecting collisions against all objects
//
// Given a ray, let's figure out whether it hits anything, and if so,
// what's the closest thing it hits.
function intersectScene(ray, scene) {
    // The base case is that it hits nothing, and travels for `Infinity`
    var closest = [Infinity, null];
    
    // But for each object, we check whether it has any intersection,
    // and compare that intersection - is it closer than `Infinity` at first,
    // and then is it closer than other objects that have been hit?
    for (var i = 0; i < scene.objects.length; i++) {
        var object = scene.objects[i];
        var dist;
        	if(object.type== 'sphere')
        	{
        		   dist = sphereIntersection(object, ray);
        	}
        	else
        	{
        		dist = planeIntersection(object, ray);
        	}
         

        if (dist !== undefined && dist < closest[0]) {
            closest = [dist, object];
        }
    }
    return closest;
}

// ## Detecting collisions against a sphere
//
// ![](graphics/sphereintersection.png)
//
// Spheres are one of the simplest objects for rays to interact with, since
// the geometrical math for finding intersections and reflections with them
// is pretty straightforward.
function sphereIntersection(sphere, ray) {
    var eye_to_center = Vector.subtract(sphere.point, ray.point),
        // picture a triangle with one side going straight from the camera point
        // to the center of the sphere, another side being the vector.
        // the final side is a right angle.
        //
        // This equation first figures out the length of the vector side
        v = Vector.dotProduct(eye_to_center, ray.vector),
        // then the length of the straight from the camera to the center
        // of the sphere
        eoDot = Vector.dotProduct(eye_to_center, eye_to_center),
        // and compute a segment from the right angle of the triangle to a point
        // on the `v` line that also intersects the circle
        discriminant = (sphere.radius * sphere.radius) - eoDot + (v * v);
    // If the discriminant is negative, that means that the sphere hasn't
    // been hit by the ray
    if (discriminant < 0) {
        return;
    } else {
        // otherwise, we return the distance from the camera point to the sphere
        // `Math.sqrt(dotProduct(a, a))` is the length of a vector, so
        // `v - Math.sqrt(discriminant)` means the length of the the vector
        // just from the camera to the intersection point.
        var res = v - Math.sqrt(discriminant);
   
        return res;

    }
}



// A normal is, at each point on the surface of a sphere or some other object,
// a vector that's perpendicular to the surface and radiates outward. We need
// to know this so that we can calculate the way that a ray reflects off of
// a sphere.
function sphereNormal(sphere, pos) {
    return Vector.unitVector(
        Vector.subtract(pos, sphere.point));
}

var resOld = 0.0;
function planeIntersection(plane, ray)
{
	var N = plane.N;
	var Q = plane.Q;

	// a ray is defined by an origin or eye point E, and and offset Vector D
	var E = ray.point;
	var D = ray.vector;

	var tNumerator = Vector.dotProduct(N, Vector.subtract(Q, E));
	var tDenominator = Vector.dotProduct(N, D);

	var t = tNumerator/ tDenominator;
	if(t > 0)
	{
        return t;
	}

     


}

// # Surface
//
// ![](http://farm3.staticflickr.com/2851/10524788334_f2e3903b36_b.jpg)
//
// If `trace()` determines that a ray intersected with an object, `surface`
// decides what color it acquires from the interaction.
function surface(ray, scene, object, pointAtTime, normal, depth) {
    var b = object.color,
        c = Vector.ZERO,
        lambertAmount = 0;

    // **[Lambert shading](http://en.wikipedia.org/wiki/Lambertian_reflectance)**
    // is our pretty shading, which shows gradations from the most lit point on
    // the object to the least.
    if (object.lambert) {
        for (var i = 0; i < scene.lights.length; i++) {
            var lightPoint = scene.lights[0];
            // First: can we see the light? If not, this is a shadowy area
            // and it gets no light from the lambert shading process.
            if (!isLightVisible(pointAtTime, scene, lightPoint)) continue;
            // Otherwise, calculate the lambertian reflectance, which
            // essentially is a 'diffuse' lighting system - direct light
            // is bright, and from there, less direct light is gradually,
            // beautifully, less light.

            
            var contribution = Vector.dotProduct(Vector.unitVector(
                Vector.subtract(lightPoint, pointAtTime)), normal);
            // sometimes this formula can return negatives, so we check:
            // we only want positive values for lighting.
            if (contribution > 0) lambertAmount += contribution;


            
        }


     }

    // **[Specular](https://en.wikipedia.org/wiki/Specular_reflection)** is a fancy word for 'reflective': rays that hit objects
    // with specular surfaces bounce off and acquire the colors of other objects
    // they bounce into.
    if (object.specular) {
        // This is basically the same thing as what we did in `render()`, just
        // instead of looking from the viewpoint of the camera, we're looking
        // from a point on the surface of a shiny object, seeing what it sees
        // and making that part of a reflection.
        var reflectedRay = {
            point: pointAtTime,
            vector: Vector.reflectThrough(ray.vector, normal)
        };
        var reflectedColor = trace(reflectedRay, scene, ++depth);
        if (reflectedColor) {
            c = Vector.add(c, Vector.scale(reflectedColor, object.specular));
        }
    }

    // lambert should never 'blow out' the lighting of an object,
    // even if the ray bounces between a lot of things and hits lights
    lambertAmount = Math.min(1, lambertAmount);

    // **Ambient** colors shine bright regardless of whether there's a light visible -
    // a circle with a totally ambient blue color will always just be a flat blue
    // circle.
    return Vector.add3(c,
        Vector.scale(b, lambertAmount * object.lambert),
        Vector.scale(b, object.ambient));
}

// Check whether a light is visible from some point on the surface of something.
// Note that there might be an intersection here, which is tricky - but if it's
// tiny, it's actually an intersection with the object we're trying to decide
// the surface of. That's why we check for `> -0.005` at the end.
//
// This is the part that makes objects cast shadows on each other: from here
// we'd check to see if the area in a shadowy spot can 'see' a light, and when
// this returns `false`, we make the area shadowy.
function isLightVisible(pt, scene, light) {
    var distObject =  intersectScene({
        point: pt,
        vector: Vector.unitVector(Vector.subtract(pt, light))
    }, scene);
    return distObject[0] > -0.005;
}