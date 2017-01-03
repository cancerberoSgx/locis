/*
#Introduction to permission system

Permissions are very simplistic. We have the concepts of User and UserGroup. 

Then any Permissable resource / document must support the following properties: 
	
	userRead, userWrite, userGroupRead, userGroupWrite

These properties are arrays of _ids of the entities. 

#How a Permissable is validated

Note: In authentication we query the user when he provides its credential to generate a token. Because is only once (the first of may calls - we just ignore this)

 1. An api definition declares the permissions required to access it: 
*/

function hasReadPermission(userCredentials, api)
{
	return true;
}

module.exports = {
	hasReadPermission: hasReadPermission
}