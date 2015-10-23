	//performs matrix vector multiplicaiton
	function multMV(matrix, vector)
	{
		var v0 = matrix[0][0] * vector[0] + matrix[1][0] * vector[1] + matrix[2][0] * vector[2];
		var v1 = matrix[0][1] * vector[0] + matrix[1][1] * vector[1] + matrix[2][1] * vector[2];
		return vec3([v0, v1, 1]);
	}
	//degrees to radians
	function degToRad(degrees)
	{
		return degrees * 0.0174533;
	}

	//return a rotation matrix specifying a rotation by theta degrees
	function getRotationMatrix(theta)
	{
		var deg = degToRad(theta);
		var c = Math.cos(deg);
        var s = Math.sin(deg);
        return mat3(vec3([c, s, 0]), vec3([s * -1 , c, 0]), vec3([0, 0, 1]));
        
	}