const _ = require('lodash');

/**
	 * Check whether user has permission to particular action
	 * @param {string} 
	 * 	permission - required permission
	 * 	userPermissions - user permission
	 * @returns {string}
	 */
module.exports.hasPermission = (requirePermission, userPermissions) => {

	if (_.find(userPermissions, function (permission) { return permission.route_name == requirePermission })) {
		return true;
	} else {
		return false;
	}
}