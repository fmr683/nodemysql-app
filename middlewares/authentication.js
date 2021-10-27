'use strict';
const isEmpty = require('is-empty');
const urlPattern = require('url-pattern');
const config = require('config');
const async = require('async');

const User = require('../models/user');
const Permission = require('../models/permission');
const responseMessages = require('../lib/response-messages');
const { userStatus, APIResponse, settings } = require('../helper/global');

/**
* Authenticate request
* @param {object} req - Request data
* @param {object} res - Response data
* @param {object} next - Next data
 */
function authRequest(req, res, next) {


    if (!isEmpty(req.headers['authorization'])) {
        var jwt = req.headers['authorization'];
        jwt = jwt.replace('Bearer', '');
        jwt = jwt.trim();

        async.waterfall([
            function (callback) {

                let result = {};
                User.validateJwt(jwt, userStatus()[0], function (error, result, tokenInfo) {

                    if (error || result.length == 0) { // Not found in normal user table so check the super admin
                        result = {
                            checkAdmin: true
                        };
                    }

                    callback(null, result, tokenInfo);
                });
            }, function (result, tokenInfo, callback) {

                if (!isEmpty(result.checkAdmin)) {

                    SuperAdmin.validateJwt(jwt, userStatus()[0], function (error, result, tokenInfo) { // check the token in super admin table

                        if (error || result.length == 0) { // Not found in user or admin table
                            return res.status(401).json(responseMessages.commonResponse(responseMessages.INVALID_OR_EXPIRED_TOKEN));
                        }

                        // See more details for https://projects.test.com.au/#/tasks/25782208 
                        // if (tokenInfo.token != result[0].token && result[0].user_type == 'INTERNAL') {
                        //     return res.status(401).json(responseMessages.commonResponse(responseMessages.NEW_LOG_IN, "", "", responseMessages.NEW_LOG_IN_MSG));
                        // }

                        if (!isEmpty(tokenInfo)) {
                            // JWT validation success & set user data to the request where it can be accessed from anywhere
                            req.user = result[0];
                            req.user.token = jwt;
                            req.user.superAdmin = true;
                            req.user.permissions = [
                                {
                                    route_name: 'sys-admin',
                                }
                            ]

                            return callback(null);

                        } else {
                            return callback(true);
                        }
                    });

                } else {

                    // See more details for https://projects.test.com.au/#/tasks/25782208 
                    // if (tokenInfo.token != result[0].token) {
                    //     return res.status(401).json(responseMessages.commonResponse(responseMessages.NEW_LOG_IN, "", "", responseMessages.NEW_LOG_IN_MSG));
                    // }


                    if (!isEmpty(tokenInfo)) {
                        // JWT validation success & set user data to the request where it can be accessed from anywhere
                        req.user = result[0];
                        req.user.token = jwt;

                        Permission.getMappingPermissionDetails(req.user.role_id, req.user.clientId, function (error, permissionResult) {

                            if (error) {
                                return callback(error);
                            }

                            if (permissionResult.length == 0) {
                                return res.status(401).json(responseMessages.commonResponse(responseMessages.PERMISSION_EMPTY));
                            }

                            req.user.permissions = permissionResult;

                            callback(null);
                        });

                    } else {
                        return callback(true);
                    }
                }
            }
        ], function (error, result) {

            if (error) {
                console.log(error);
                return res.status(500).json(responseMessages.commonResponse(responseMessages.UNKNOWN_ERROR));
            } else {
                next();
            }
        })

    } else if (isGuestAction(req.path, req.method)) {
        next();
    } else {
        return res.status(401).json(responseMessages.commonResponse(responseMessages.AUTH_FAILED,
            null, null, 'Invalid Authorization token'));
    }
}



/**
 * Export module functions to be accessed from outside
 */
module.exports = {
    authRequest
}