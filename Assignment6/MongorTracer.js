/** Mongor Tracer - Written by Hayden Shelton for CS4600 2015 */

/*************************initial setup ****************************/
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
//this is where the image pixels will be stored
var imageData = context.getImageData(0, 0, 512, 512);

var camera = vec3(0, 2.0, 8);






/*
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
