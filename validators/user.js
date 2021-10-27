'use strict';


const Joi = require('@hapi/joi');
const PasswordComplexity = require('joi-password-complexity');
const isEmpty = require('is-empty');

const { userStatus, authTempLogger, dateFormat } = require('../helper/global');

// Libraries
var responseMessages = require('../lib/response-messages');
const User = require('../models/user');


exports.create = function (req, res, next) {
    const data = req.body;
    // define the validation schema
    const schema = Joi.object().keys({

        username: Joi.string().max(49).required(),
        name: Joi.string().max(99).required(),
        email: Joi.string().email({ minDomainSegments: 2 }),
        mobile: Joi.string().max(19).required(),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            let message = err.details[0].message;
            // send a 422 error response if validation fails
            let response = responseMessages.commonResponse(responseMessages.FAIL, data, '', message);
            return res.status(422).json(response);
        } else {
            next();
        }

    });
}



exports.update = function (req, res, next) {

    const data = req.body;
    // define the validation schema
    const schema = Joi.object().keys({

        username: Joi.string().max(49).required(),
        name: Joi.string().max(99).required(),
        email: Joi.string().email({ minDomainSegments: 2 }),
        mobile: Joi.string().max(19).required(),
        serviceNumber: Joi.number().positive().allow('').max(9999999999999999999),
        status: Joi.string().required().valid(userStatus()),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            // send a 422 error response if validation fails
            let message = err.details[0].message;
            let response = responseMessages.commonResponse(responseMessages.FAIL, data, '', message);
            return res.status(422).json(response);
        } else {
            next();
        }

    });
}

exports.profileUpdate = function (req, res, next) {

    const data = req.body;
    // define the validation schema
    const schema = Joi.object().keys({

        username: Joi.string().alphanum().max(49).required(),
        name: Joi.string().max(99).required(),
        email: Joi.string().email({ minDomainSegments: 2 }),
        mobile: Joi.string().max(19).required(),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            // send a 422 error response if validation fails
            let response = responseMessages.commonResponse(responseMessages.FAIL, data, '', err.details[0].message);
            return res.status(422).json(response);
        } else {
            next();
        }

    });
}

// Check the password complexity
exports.passwordComplexity = function (req, res, next) {

    // default password constraint
    // {
    //     min: 8,
    //     max: 26,
    //     lowerCase: 1,
    //     upperCase: 1,
    //     numeric: 1,
    //     symbol: 1,
    //     requirementCount: 4,
    //   }

    if (!isEmpty(req.body.password)) {
        Joi.validate(req.body.password, new PasswordComplexity(), (err, data) => {
            if (err) {
                // send a 422 error response if validation fails
                let response = responseMessages.commonResponse(responseMessages.FAIL, { password: data }, '', responseMessages.PASSWORD_MSG);
                return res.status(422).json(response);
            } else {
                next();
            }
        })
    } else {
        next();
    }

}

exports.login = function (req, res, next) {
    const data = req.body;

    // define the validation schema
    const schema = Joi.object().keys({

        // username is required
        // username must be a valid email string
        username: Joi.string().required(),

        // password is required
        password: Joi.string().min(8).required(), // To reduce the brute force added the min length


    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            authTempLogger({ userRawData: req.body });
            // send a 422 error response if validation fails
            return res.status(422).json(responseMessages.commonResponse(responseMessages.FAIL, data, '', err.details[0].message));
        } else {
            next();
        }

    });
}

exports.get = function (req, res, next) {
    next();
}

exports.signup = function (req, res, next) {
    const data = req.body;
    // define the validation schema
    const schema = Joi.object().keys({

        username: Joi.string().max(49).required(),
        name: Joi.string().max(99).required(),
        email: Joi.string().email({ minDomainSegments: 2 }),
        mobile: Joi.string().max(19).required(),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            // send a 422 error response if validation fails
            let response = responseMessages.commonResponse(responseMessages.FAIL, data, '', err.details[0].message);
            return res.status(422).json(response);
        } else {
            next();
        }

    });
}

exports.forgetPassword = function (req, res, next) {
    const data = req.body;

    // define the validation schema
    const schema = Joi.object().keys({

        email: Joi.string().email({ minDomainSegments: 2 }),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            // send a 422 error response if validation fails
            return res.status(422).json(responseMessages.commonResponse(responseMessages.FAIL, data, '', err.details[0].message));
        } else {
            next();
        }

    });
}


exports.forgetPasswordReset = function (req, res, next) {
    const data = req.body;

    // define the validation schema
    const schema = Joi.object().keys({

        // password is required
        password: Joi.string().min(8).required(),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            // send a 422 error response if validation fails
            return res.status(422).json(responseMessages.commonResponse(responseMessages.FAIL, data, '', err.details[0].message));
        } else {
            next();
        }

    });
}


exports.profilePassword = function (req, res, next) {
    const data = req.body;

    // define the validation schema
    const schema = Joi.object().keys({

        // password is required
        oldPassword: Joi.string().min(8).required(),
        password: Joi.string().min(8).required(),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            // send a 422 error response if validation fails
            //  let message = err.details[0].message;
            //message = message.replace('\"oldPassword\"', "Old password");
            let response = responseMessages.commonResponse(responseMessages.FAIL, { password: data }, '', responseMessages.PASSWORD_MSG);
            return res.status(422).json(response);
        } else {
            next();
        }

    });
}

exports.contact = function (req, res, next) {
    const data = req.body;

    // define the validation schema
    const schema = Joi.object().keys({

        subject: Joi.string().min(5).required(),
        message: Joi.string().min(5).max(1000).required(),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            // send a 422 error response if validation fails
            return res.status(422).json(responseMessages.commonResponse(responseMessages.FAIL, data, '', err.details[0].message));
        } else {
            next();
        }

    });
}

exports.createSuperAdmin = function (req, res, next) {
    const data = req.body;

    let schema = Joi.object().keys({
        username: Joi.string().required(),
        name: Joi.string().max(99).required(),
        email: Joi.string().email({ minDomainSegments: 2 }),
        mobile: Joi.string().max(19).required(),
    });

    Joi.validate(data, schema, (err, value) => {

        if (err) {
            let message = err.details[0].message;
            // send a 422 error response if validation fails
            let response = responseMessages.commonResponse(responseMessages.FAIL, data, '', message);
            return res.status(422).json(response);
        } else {
            next();
        }

    });
}

exports.duplicateUserName = (req, res, next) => {

    const data = req.body;
    let id = "";

    if (!isEmpty(req.params.id))
        id = parseInt(req.params.id)

    let dataValues = {
        username: req.sanitize(data.username),
        id
    }

    User.findByUsername(dataValues, (error, result) => {

        if (error) {
            let response = responseMessages.commonResponse(responseMessages.FAIL);
            return res.status(500).json(response);
        }

        if (result.length > 0) {
            return res.status(400).json(responseMessages.commonResponse(responseMessages.DUPLICATE_RECORD, '', '', "Duplicate entry '" + dataValues.username + "' for key 'username'")); // Duplicate Record
        }

        next();
    })
}

exports.findUserById = (req, res, next) => {

    User.get(parseInt(req.params.id), function (error, value) {

        if (error) {
            let response = responseMessages.commonResponse(responseMessages.FAIL);
            return res.status(500).json(response);
        }

        if (value.length == 0 || value[0].id == null) { // No result
            let response = responseMessages.commonResponse(responseMessages.RECORD_NOT_FOUND);
            return res.status(404).json(response);
        }

        next();

    });

}

exports.findUsersByIds = (req, res, next) => {

    const users = req.body.users;

    if (users && users.length > 0) {
        User.userValidationCount(users, function (error, value) {
            if (error) {
                let response = responseMessages.commonResponse(responseMessages.FAIL);
                return res.status(500).json(response);
            }

            if (value[0].count != users.length) {
                let response = responseMessages.commonResponse(responseMessages.FAIL, "", "", "Invalid user value is sent.");
                return res.status(422).json(response);
            }
            next();
        })

    } else {
        next();
    }

}
