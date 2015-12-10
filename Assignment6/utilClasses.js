var color = {};
color.red = 0;
color.green = 0;
color.blue = 0;
color.four = 255;

function color(r, g, b, alpha)
{
	color.red = r;
	color.green = g;
	color.blue = b;
	color.four = alpha;
}

function scaleVec3(vector, scalar)
{
	a = vector[0] * scalar;
	b = vector[1] * scalar;
	c = vector[2] * scalar;

	return vec3(a, b,c);
}
