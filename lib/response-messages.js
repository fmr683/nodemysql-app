'use strict';



/**
 * Prepare common response JSON
 * @param {string} code - Error code
 * @param {string} attribute - Attribute name. This should available only for validation errors
 * @param {object} data - Any other date to be sent. Ex:view record data
 * @param {string} message - Optional message to be sent
 * @returns {object}
 */
function commonResponse(code, attribute = '', data = '', message = '') {
    var msg = {
        'code': code,
        'attribute': attribute,
        'data': data,
        'message': message
    }

    return msg;
}

/*
    Replace 
*/
function replaceDuplicateEntryMessage(param) {
    let msg = "Duplicate ##param## value sent";

    return msg.replace("##param##", param)
}


/**
 * Export module functions to be accessed from outside
 */
module.exports = {
    // Responses
    commonResponse: commonResponse,
    replaceDuplicateEntryMessage: replaceDuplicateEntryMessage,

    // Error codes
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
    MISSING_MANDATORY_ATTRIBUTE: 'MISSING_MANDATORY_ATTRIBUTE',
    DUPLICATE_RECORD: 'DUPLICATE_RECORD',
    RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
    NO_DEVICE_FOUND: 'NO_DEVICE_FOUND',
    NOT_FOUND: 'NOT_FOUND',
    INVALID_EMAIL: 'INVALID_EMAIL',
    EXCEED_CHARACTER_LENGTH: 'EXCEED_CHARACTER_LENGTH',
    SUBCEED_CHARACTER_LENGTH: 'SUBCEED_CHARACTER_LENGTH',
    INVALID_MOBILE: 'INVALID_MOBILE',
    INVALID_USERNAME_PASSWORD: 'INVALID_USERNAME_PASSWORD',
    AUTH_FAILED: 'AUTH_FAILED',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    ROLE_IN_USE: 'ROLE_IN_USE',
    PERMISSION_IN_USE: 'PERMISSION_IN_USE',
    PERMISSION_EMPTY: 'PERMISSION_EMPTY',
    INVALID_OLD_PASSWORD: 'INVALID_OLD_PASSWORD',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    INVALID_OR_EXPIRED_TOKEN: 'INVALID_OR_EXPIRED_TOKEN',
    INACTIVE_USER: 'INACTIVE_USER',
    INVALID_USER_ID: 'INVALID_USER_ID',
    INVALID_SHOP_ID: 'INVALID_SHOP_ID',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    INVALID_VERIFICATION_CODE: 'INVALID_VERIFICATION_CODE',
    INVALID_INVITE_CODE: 'INVALID_INVITE_CODE',
    INVITATION_EXPIRED: 'INVITATION_EXPIRED',
    EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
    INVALID_PHONE: 'INVALID_PHONE',
    INVALID_FAX: 'INVALID_FAX',
    ALREADY_SUBSCRIBED: 'ALREADY_SUBSCRIBED',
    USER_NOT_REGISTERED: 'USER_NOT_REGISTERED',
    USER_NOT_SUBSCRIBED: 'USER_NOT_SUBSCRIBED',
    INVALID_DATA_TYPE: 'INVALID_DATA_TYPE',
    INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
    INVALID_DEVICE_TYPE: 'INVALID_DEVICE_TYPE',
    DEFAULT_ROLE: 'DEFAULT_ROLE',
    SOME_RECORDS_SYNCED: 'SOME_RECORDS_SYNCED',
    RECORD_HAS_DEPENDENCIES: 'RECORD_HAS_DEPENDENCIES',
    INVALID_BOOKING_DATE_TIME: 'INVALID_BOOKING_DATE_TIME',
    INSUFFICIENT_POINTS: 'INSUFFICIENT_POINTS',
    INVALID_ACTION: 'INVALID_ACTION',
    USER_STATUS_IS_NOT_APPROVED: 'USER_STATUS_IS_NOT_APPROVED',
    INVALID_CODE: 'INVALID_CODE',
    PASSWORD_EMPTY: 'PASSWORD_EMPTY',
    EMPTY_RESULT: 'EMPTY_RESULT',
    DEVICE_IN_USE: 'DEVICE_IN_USE',

    SIGNUP_SUCCESS_MSG: 'Your application for access to test has been received. Your request will be assessed and processed. If approved you will receive an email containing the log in details for your account.',
    PASSWORD_EMPTY_MSG: 'Please check your email or reset your password via forget password',
    INVALID_CODE_MSG: 'Invalid client code',
    NEW_LOG_IN: 'NEW_LOG_IN',
    NEW_LOG_IN_MSG: 'You have been logged out because you have logged in elsewhere',
    INVALID_OLD_PASSWORD_MSG: "The current password you entered is incorrect, retype the correct password.",
    PASSWORD_MSG: "The password you entered doesn't meet the minimum requirements.",
    DEVICE_IN_USE_MSG: "Target assigned for this device.",
    SIGNUP_FAIL_MSG: "Admin users are available in the system, so you cannot create a new user.",
    STATUS_CHANGE_MSG: "Sorry you cannot change your own status.",
    DUPLICATE_RECORD_USERNAME: "Duplicate entry '{{username}}' for key 'username'",
    PUBLIC_KEY_FILE_UPLOAD_MSG: "please upload the public key file",
    INVALID_PAYLOAD_MSG: "Invalid payload verification",
    INVALID_AUDIENCE_MSG: "Invalid audience",
    AUDIENCE_NOT_VALID_MSG: "Audience is not valid",
    PROCESS_FAILED_MSG: "Process failed",
    INVALID_PUBLIC_KEY_MSG: "Invalid public key uploaded",
    UNABLE_TO_GENERATE_MACHINE_ID_MSG: "Sorry, unable to generate machine id",
    INVALID_DL_MSG: "Invalid license uploaded",
    AWS_S3_BUCKET_ALREADY_EXIST: "Please delete the bucket or rename the bucket in S3 and retry it here.",
    INVALID_DATE_RANGE: "Invalid date range.",
    INVALID_LOGIN_MSG: "Login Unsuccessful (#%s).",
    LOGIN_STATUS_MSG: "Your account is %s (#%s).",
    SERVER_ERROR_MSG: "Server error, please try again.",
    FORGET_LINK_MSG: "If your account exists, you will receive an email with a recovery link.",
    USER_NOT_FOUND_MSG: "User not found (#%s).",
    JS_FILE_UPLOAD_MSG: "Please upload the file."
}

