// User valid status
module.exports.userStatus = function () {
    return ['APPROVED', 'PENDING', 'DEACTIVATED', 'DENIED'];
}


// Base url replace
module.exports.APIResponse = function (res, error, result, messages = "") {

    if (error) {
        if (error.errno == 1452) // invalid parameter sent
            return res.status(400).json(responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND, '', '', (process.env.NODE_ENV !== 'production' ? error.sqlMessage + ' ' : '') + "Server error, (#50001)")); // Invalid paramter
        else if (error.errno == 1062) // duplicate records
            return res.status(400).json(responseMessages.commonResponse(responseMessages.DUPLICATE_RECORD, '', '', error.sqlMessage)); // Invalid paramter
        else {
            process.env.NODE_ENV !== 'production' ? console.log(error) : '';

            Logger.error(error);

            return res.status(500).json(responseMessages.commonResponse(responseMessages.FAIL, '', '', responseMessages.SERVER_ERROR_MSG));
        }

    }

    if (result == null) { // No result
        return res.status(404).json(responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND));
    } else { // result found
        return res.status(200).json(responseMessages.commonResponse(responseMessages.SUCCESS, "", result === true ? '' : result, messages));
    }
}


/**
 * Used in Routes to check user Permission
 * @param  permission {String}- Permission item name
 */
module.exports.checkPermission = (permission) => {
    return function (req, res, next) {

        if (!util.hasPermission(permission, req.user.permissions)) {
            var response = responseMessages.commonResponse(responseMessages.PERMISSION_DENIED);
            return res.status(403).json(response);
        } else {
            next();
        }
    }
}


/**
 * Middleware function to check any given permisson exists.
 * @param {String[]} permission - Permission item name array
 */
module.exports.checkAnyPermission = (permissions) => {

    return function (req, res, next) {
        let isAuthorized = false;
        for (let i = 0; i < permissions.length; i++) {
            if (util.hasPermission(permissions[i], req.user.permissions)) {
                isAuthorized = true;
                break;
            }
        }
        if (!isAuthorized) {
            var response = responseMessages.commonResponse(responseMessages.PERMISSION_DENIED);
            return res.status(403).json(response);
        } else {
            return next();
        }
    }
}

module.exports.settings = {
    api: {
        "guestActions": [
            {
                "url": "/v1/user/signup",
                "method": "POST"
            },
            {
                "url": "/v1/user/login",
                "method": "POST"
            },
            {
                "url": "/v1/user/app/login",
                "method": "POST"
            },
            {
                "url": "/v1/user/forget-password",
                "method": "PUT"
            },
            {
                "url": "/v1/user/password-reset/*",
                "method": "PUT"
            },
            {
                "url": "/sr/*",
                "method": "GET"
            },
            {
                "url": "/v1/sys-admin/login",
                "method": "POST"
            },
            {
                "url": "/v1/sys-admin/forget-password",
                "method": "PUT"
            },
            {
                "url": "/v1/sys-admin/password-reset/*",
                "method": "PUT"
            },
            {
                "url": "/v1/sys-admin/signup",
                "method": "POST"
            },
            {
                "url": "/device-direct/*",
                "method": "GET"
            },
            {
                "url": "/device-direct/*",
                "method": "POST"
            }
        ]
    }
}

module.exports.replaceToHTTPS = (url) => {
    return url.replace(/^http:\/\//i, 'https://')
}