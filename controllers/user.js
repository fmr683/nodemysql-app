'use strict';

const bcrypt = require('bcryptjs');
const config = require('config');
const moment = require('moment');
const async = require("async");
const isEmpty = require('is-empty');
const crypto = require('crypto');

const User = require('../models/user');
const responseMessages = require('../lib/response-messages');
var { userStatus, APIResponse } = require('../helper/global');


module.exports.login = async (req, res, next) => {

    async.waterfall([
        function (callback) {

            let dataArray = [
                req.sanitize(req.body.username),
            ];

            // User Login
            User.login(dataArray, function (error, value) {

                if (error) {
                    return callback(error);
                }

                if (value.length == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.INVALID_USERNAME_PASSWORD, "", "", vsprintf(responseMessages.INVALID_LOGIN_MSG, ['40003']));
                    return res.status(401).json(response);

                } else if (userStatus()[0] != value[0].status) { // Not Valid
                 
                    let response = responseMessages.commonResponse(responseMessages.AUTH_FAILED, "", "", vsprintf(responseMessages.LOGIN_STATUS_MSG, [value[0].status, '40004']));
                    return res.status(401).json(response);

                } else if (isEmpty(value[0].password)) { // password empty
                 
                    let response = responseMessages.commonResponse(responseMessages.PASSWORD_EMPTY, "", "", vsprintf(responseMessages.INVALID_LOGIN_MSG, ['40005']));
                    return res.status(403).json(response);

                } else if (!bcrypt.compareSync(req.body.password, value[0].password)) { // password mismatch
                 
                    let response = responseMessages.commonResponse(responseMessages.AUTH_FAILED, "", "", vsprintf(responseMessages.INVALID_LOGIN_MSG, ['40006']));
                    return res.status(401).json(response);

                } else { // result found

                    delete value[0].password; // delete the password from the response
                    callback(null, value);
                }
            });

        }, function (result, callback) {

            crypto.randomBytes(20, function (error, buffer) {

                if (error) {
                    return callback(error);
                }

                callback(null, result, buffer.toString('hex'));
            });

        }, function (result, token, callback) {

            result[0].token = token;
            result[0].accessToken = User.getJwt(result[0]);

            let dataArray = [
                token,
                req.sanitize(result[0].id),
            ];

            // Update login record for the user
            User.updateLastLogin(dataArray, function (error, value) { // update the last login at
                if (error) {
                    return callback(error);
                }

                if (value.affectedRows == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND, "", "", vsprintf(responseMessages.USER_NOT_FOUND_MSG, ['40008']));
                    return res.status(401).json(response);
                } else { // result found
                    callback(null, {
                        user: result
                    });
                }
            });
        }
    ], function (error, result) {
        return APIResponse(res, error, result);
    });
}

/* POST Signup */
module.exports.signup = async (req, res, next) => {

    async.waterfall([
        function (callback) {


            let dataValues = {
                username: req.sanitize(req.body.username)
            }

            User.findByUsername(dataValues, function (error, userResult) {

                if (error) {
                    return callback(error);
                }

                if (userResult.length > 0) {
                    return res.status(400).json(responseMessages.commonResponse(responseMessages.DUPLICATE_RECORD, '', '', responseMessages.DUPLICATE_RECORD_USERNAME.replace("{{username}}", dataValues.username))); // Invalid paramter
                }

                callback(null, result);
            })

        }, function (result, callback) {

            let data = req.body;

            // Do not change this order
            let dataValues = {
                clientId: clientId,
                username: req.sanitize(data.username),
                name: req.sanitize(data.name),
                email: req.sanitize(data.email),
                mobile: req.sanitize(data.mobile),
                created_at: moment().unix(),
            };

            User.insert(dataValues, function (error, value) { // Create the user

                if (error) {
                    return callback(error);
                }

                data.id = value.insertId
                return callback(null, { 'user': [data] });
            });
        }
    ], function (error, result) {

        return APIResponse(res, error, result, responseMessages.SIGNUP_SUCCESS_MSG);
    });
}

module.exports.forgetPassword = async (req, res, next) => {

    let data = req.body;

    async.waterfall([

        function (callback) {

            // Find by Email address
            User.findByEmail(req.sanitize(data.email), function (error, value) {

                if (error) {
                    return callback(error);
                }

                if (value.length == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND, "", "", responseMessages.FORGET_LINK_MSG);
                    return res.status(404).json(response);
                } else if (userStatus()[0] != value[0].status) { // Not Valid
                    let response = responseMessages.commonResponse(responseMessages.AUTH_FAILED, "", "", vsprintf(responseMessages.LOGIN_STATUS_MSG, [value[0].status]));
                    return res.status(403).json(response);
                } else { // result found
                    return callback(null, value);
                }
            });
        }, function (result, callback) {

            crypto.randomBytes(20, function (error, buffer) {
                let token = buffer.toString('hex');

                if (error) {
                    return callback(error);
                }

                callback(null, result, token);
            });

        }, function (result, token, callback) {

            // Do not change this order
            let dataValues = [
                token,
                moment().add(1, 'hours').unix(), // 1 hour
                result[0].id,
                moment().unix(),
            ];

            User.updateTokenResetDetails(dataValues, result[0].id, function (error, value) {
                if (error) {
                    return callback(error);
                }

                if (value.affectedRows == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND, "", "", vsprintf(responseMessages.USER_NOT_FOUND_MSG, ['40020']));
                    return res.status(404).json(response);
                } else { // result found
                    return callback(null, result, token);
                }
            })

        }
    ], function (error, result) {
        return APIResponse(res, error, result);
    })
}

/* POST User Reset password */
module.exports.passwordReset = async (req, res, next) => {

    let token = req.params.token;
    let data = req.body;

    async.waterfall([
        function (callback) {

            let dataValues = [
                token,
                moment().unix(),
            ];

            User.tokenValidity(dataValues, function (error, value) {

                if (error) {
                    callback(error);
                }

                if (value.length == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND, "", "", 'Password reset token is invalid or expired.');
                    return res.status(401).json(response);
                } else { // result found
                    return callback(null, value);
                }
            })

        }, function (result, callback) {

            let salt = bcrypt.genSaltSync(config.get('saltRound'));
            data.password = bcrypt.hashSync(data.password, salt);

            let dataValues = [
                data.password,
                null,
                null,
            ];

            User.updateTokenAndPassword(result[0].id, dataValues, function (error, value) {

                if (error) {
                    return callback(error);// Something went wrong
                }

                if (value.affectedRows == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND, "", "", vsprintf(responseMessages.USER_NOT_FOUND_MSG, ['40020']));
                    return res.status(404).json(response);
                } else { // result found
                    callback(null, '');
                }
            });
        }
    ], function (error, result) {
        return APIResponse(res, error, result);
    })
}

/* POST User Create */
module.exports.create = async (req, res, next) => {
    let data = req.body;

    async.waterfall([

        function (callback) {

            // Generate the token link to send in email
            crypto.randomBytes(20, function (error, buffer) {
                let token = buffer.toString('hex');

                if (error) {
                    return callback(error);
                }

                callback(null, token);
            });
        }, function (token, callback) {

            let dataValues = {
                username: req.sanitize(data.username),
                name: req.sanitize(data.name),
                email: req.sanitize(data.email),
                mobile: req.sanitize(data.mobile),
                status: userStatus()[0],
                created_by: req.user.id,
                created_at: moment().unix(),
                reset_password_token: token,
                reset_password_expires: moment().add(24, 'hours').unix(), // 24 hour
            };

            User.createUser(dataValues, function (error, value) { // Create the user

                if (error) {
                    if (error.errno == 1062)
                        return res.status(400).json(responseMessages.commonResponse(responseMessages.DUPLICATE_RECORD, '', '', error.sqlMessage)); // Duplicate Record
                    else
                        return callback(error);
                }

                data.id = value.insertId

                return callback(null, { 'user': [data] });

            });

        },
    ], function (error, result) {
        return APIResponse(res, error, result);
    })

}


/* GET User details */
module.exports.get = async (req, res, next) => {

    let recordId = req.sanitize(req.params.id);

    User.get(recordId, function (error, data) {

        if (error) {
            let response = responseMessages.commonResponse(responseMessages.FAIL);
            return res.status(500).json(response);
        }

        if (data.length == 0 || data[0].id == null) { // No result, and because of left join it return empty table
            let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
            return res.status(404).json(response);
        } else { // result found

            let response = responseMessages.commonResponse(responseMessages.SUCCESS, "", { 'user': data });
            return res.status(200).json(response);
        }
    });
}


/* GET All User details */
module.exports.list = async (req, res, next) => {

    let listData = {
        clientId: req.user.clientId
    }

    async.waterfall([
        function (callback) {
            // arg1 now equals 'one' and arg2 now equals 'two'

            User.getAll(listData, function (error, data) {

                if (error) {
                    return callback(error);
                }

                if (data.length == 0) { // No result
                    return callback(null, null);
                } else { // result found
                    return callback(null, { 'user': data });
                }
            });

        }
    ], function (error, result) {

        return APIResponse(res, error, result);
    });
}


/* Delete User */
module.exports.delete = async (req, res, next) => {

    let recordId = req.sanitize(req.params.id);

    async.waterfall([
        function (callback) {

            let dataValue = {
                id: recordId,
            }

            User.getById(dataValue, function (error, result) {

                if (error) {
                    return callback(error);
                }

                return callback(null, result);

            })

        }, function (result, callback) {

            User.delete(recordId, function (error, data) {

                if (error) {
                    let response = responseMessages.commonResponse(responseMessages.FAIL);
                    return res.status(500).json(response);
                }

                if (data.affectedRows == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
                    return res.status(404).json(response);
                } else { // result found

                    let response = responseMessages.commonResponse(responseMessages.SUCCESS);
                    return res.status(200).json(response);
                }
            });

        },
    ], function (error, result) {

        return APIResponse(res, error, result);
    });


}

/* Update User */
module.exports.update = async (req, res, next) => {

    let data = req.body;
    data.status = data.status.toUpperCase();

    let recordId = req.sanitize(req.params.id);

    let dataValues = {
        username: req.sanitize(data.username),
        name: req.sanitize(data.name),
        alias: req.sanitize(data.alias),
        email: req.sanitize(data.email),
        mobile: req.sanitize(data.mobile),
        status: req.sanitize(data.status),
        updated_by: req.user.id,
        updated_at: moment().unix(),
    };

    let resetData = {}

    async.waterfall([

        function (callback) {

            if (dataValues.status == userStatus()[0]) { // approved
                // Generate the token link to send in email if user is not logged in
                crypto.randomBytes(20, function (error, buffer) {
                    let token = buffer.toString('hex');

                    if (error) {
                        return callback(error);
                    }

                    resetData.reset_password_token = token;
                    resetData.reset_password_expires = moment().add(24, 'hours').unix()

                    callback(null, true);
                });
            } else {
                callback(null, true);
            }
        },
        function (result, callback) {

            // get the existing record before the update
            User.get(recordId, function (error, value) {

                if (error) {
                    return callback(error);
                }

                if (value.length == 0 || value[0].id == null) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
                    return res.status(404).json(response);
                } else { // result found
                    return callback(null, value);
                }
            });
        }, function (userResult, callback) {

            // Approved or Denied AND Never logged IN AND New status is not similar to previous record
            if ((userStatus()[0] == data.status || userStatus()[3] == data.status) && isEmpty(userResult[0].last_login_at) && userResult[0].status != data.status) {
                dataValues = { ...dataValues, ...resetData };
            }

            User.updateUser(dataValues, req.sanitize(recordId), req.user.clientId, data.investigation, function (error, value) {

                if (error) {
                    return callback(error);
                }

                if (value.affectedRows == 0) { // No result
                    return callback(null, null);
                } else { // result found

                    return callback(null, { 'user': [data] });
                }
            });
        }
    ], function (error, result) {

        return APIResponse(res, error, result);
    });
}

/* GET User details */
module.exports.resend = async (req, res, next) => {

    let recordId = req.sanitize(req.params.id);


    async.waterfall([
        function (callback) {

            User.get(recordId, function (error, value) {

                if (error) {
                    return callback(error);
                }

                if (value.length == 0 || value[0].id == null) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
                    return res.status(404).json(response);
                }

                if (value[0].status != userStatus()[0]) { // check user status, if not approved status then no need to send
                    let response = responseMessages.commonResponse(responseMessages.USER_STATUS_IS_NOT_APPROVED);
                    return res.status(400).json(response);
                }

                return callback(null, value);
            });

        }, function (result, callback) {

            crypto.randomBytes(20, function (error, buffer) {
                let token = buffer.toString('hex');

                if (error) {
                    return callback(error);
                }

                callback(null, result, token);
            });

        }, function (result, token, callback) {

            // Do not change this order
            let dataValues = [
                token,
                moment().add(1, 'hours').unix(), // 1 hour
                result[0].id,
                moment().unix(),
            ];

            User.updateTokenResetDetails(dataValues, result[0].id, function (error, value) {
                if (error) {
                    return callback(error);
                }

                if (value.affectedRows == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
                    return res.status(404).json(response);
                } else { // result found

                    let dataObj = {
                        token: token,
                        username: result[0].username,
                    }
                    
                    return callback(null, dataObj);
                }
            })

        },
    ], function (error, result) {

        return APIResponse(res, error, result);
    });
}


/* GET Profile details */
module.exports.getProfileDetails = async (req, res, next) => {

    async.waterfall([

        function (callback) {

            let dataValues = {
                id: req.sanitize(req.user.id),
                clientId: req.sanitize(req.user.clientId)
            };

            // User Login
            User.getById(dataValues, function (error, value) {

                if (error) {
                    return callback(error);
                }

                if (value.length == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
                    return res.status(404).json(response);

                } else { // result found

                    callback(null, value);
                }
            });

        }, function (result, callback) {

            Permission.getMappingPermissionDetails(result[0].role_id, result[0].clientId, function (error, data) {

                if (error) {
                    callback(error);
                }

                if (data.length == 0) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
                    return res.status(404).json(response);
                } else { // result found

                    let userRole = [
                        {
                            id: result[0].role_id,
                            name: result[0].role_name,
                            description: result[0].description,
                        }
                    ];

                    delete result[0].role_name; // move it into userRole object
                    delete result[0].role_id; // move it into userRole object
                    delete result[0].description; // move it into userRole object

                    callback(null, {
                        user: result,
                        userRole: userRole,
                        permission: data
                    });
                }
            });

        }
    ], function (error, result) {
        return APIResponse(res, error, result);
    });
}

/* User Profile Update */
module.exports.profile = async (req, res, next) => {

    let data = req.body;

    let recordId = req.sanitize(req.user.id);

    // Do not change this order
    let dataValues = {
        username: req.sanitize(data.username),
        name: req.sanitize(data.name),
        email: req.sanitize(data.email),
        mobile: req.sanitize(data.mobile),
        updated_by: recordId,
        updated_at: moment().unix()
    };

    async.waterfall([
        function (callback) {

            // get the existing record before the update
            User.get(recordId, function (error, value) {

                if (error) {
                    return callback(error);
                }

                if (value.length == 0 || value[0].id == null) { // No result
                    let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
                    return res.status(404).json(response);
                } else { // result found
                    return callback(null, value);
                }
            });
        }, function (result, callback) {

            let dataValues = {
                username: req.sanitize(data.username),
                id: recordId
            }

            User.findByUsername(dataValues, function (error, userResult) {

                if (error) {
                    return callback(error);
                }

                if (userResult.length > 0) {
                    return res.status(400).json(responseMessages.commonResponse(responseMessages.DUPLICATE_RECORD, '', '', responseMessages.DUPLICATE_RECORD_USERNAME.replace("{{username}}", dataValues.username))); // Invalid paramter
                }

                callback(null, result);
            })

        }, function (userResult, callback) {
            // update the user record
            User.update(dataValues, req.sanitize(recordId), req.user.clientId, function (error, value) {

                if (error) {
                    if (error.errno == 1062)
                        return res.status(400).json(responseMessages.commonResponse(responseMessages.DUPLICATE_RECORD, '', '', error.sqlMessage)); // Duplicate Record
                    else
                        return callback(error);
                }

                if (value.affectedRows == 0) { // No result
                    return callback(null, null);
                } else { // result found

                    return callback(null, { 'user': [data] });
                }
            });
        }
    ], function (error, result) {

        return APIResponse(res, error, result);
    });
}


