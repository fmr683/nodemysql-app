const request = require('supertest');
const isEmpty = require('is-empty');
const crypto = require('crypto');
const config = require('config');

const { userStatus, dateFormat } = require('../../../../helper/global');
const mockFunctions = require('../etc/mockfunc');
const { MOBILE } = require('../etc/constants');
const User = require('../../../../models/user');
const responseMessages = require('../../../../lib/response-messages');

let dateTime = new Date().valueOf();

var server;
var id;
var accessToken;
var resetToken;
var resetPassword = "#jnK834jfsdf";


/// DO NOT CHANGE - Because these information used to clean the database in case of Test case fails
const mobile = MOBILE;
/// DO NOT CHANGE

const userObjectInvestigation = {
    "username": "Test3" + dateTime,
    "name": "Test",
    "alias": "Test",
    "email": "Test3" + dateTime + "@test.com.au",
    "mobile": mobile,
}

const userObject = {
    "username": "Test1" + dateTime,
    "name": "Test",
    "email": "Test1" + dateTime + "@test.com.au",
    "mobile": mobile,
}

const userObject_signup = {
    "username": "Test2" + dateTime,
    "name": "Test",
    "email": "Test2" + dateTime + "@test.com.au",
    "mobile": mobile
}

// User Object (Signup) with username field as an email
const userObject_signup_email = {
    "username": "Test1" + dateTime + "@test.com.au",
    "name": "Test",
    "email": "Test2" + dateTime + "@test.com.au",
    "mobile": mobile,
}

const invalidUserObject = {
    "username": "",
    "name": "",
    "email": "",
    "mobile": "",
}
const newName = "Brian";

var mockUser;

describe('User Module', () => {

    beforeAll(async (done /* call it or remove it*/) => {

        // Incase test case fails in the middle, this function will clear all the Mock users from database.

        mockFunctions.mockCreateUser(async (error, result) => {

            if (error) {
                console.log("Unable to create Mock user............");
                console.log("****************");
                console.log(error);
                console.log("****************");
            }

            mockUser = result;


            done(); // calling it
        });

        server = require('../../../../bin/www');

    });

    afterAll(async () => {
        server.close();
    });
    // Empty Signup
    // invalid code
    // Email unique
    // Username unique

    const testSingupUser = (data) => {
        return request(server).post('/v1/user/signup')
            .send(data);
    }

    it('/v1/user/signup post - Signup User - Empty', async () => {

        let res = await testSingupUser(invalidUserObject);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);

    });

    it('/v1/user/signup post - Signup User - Invalid client code', async () => {

        let res = await testSingupUser(userObject_signup);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(404);

    });

    it('/v1/user/signup post - Signup User - Duplicate Username', async () => {

        let tempUser = await testSingupUser(userObject_signup);
        let res = await testSingupUser(userObject_signup);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(400);
        expect(res.body.message).toEqual("Duplicate entry '" + userObject_signup.username + "' for key 'username'");

        // Delete the temp user added above
        accessToken = User.getJwt(mockUser);
        await testDeleteUserExec(tempUser.body.data.user[0].id);
        accessToken = '' // Reset the token so below test cases can use accordingly
    }, 15000);

    it('/v1/user/signup post - Signup User - Duplicate Email', async () => {

        let tempUser = await testSingupUser(userObject_signup);
        userObject_signup.username = "changeusername";
        let res = await testSingupUser(userObject_signup);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(400);
        expect(res.body.message).toEqual("Duplicate entry '" + userObject_signup.email + "' for key 'user.email'");

        // Delete the temp user added above
        accessToken = User.getJwt(mockUser);
        await testDeleteUserExec(tempUser.body.data.user[0].id);
        accessToken = '' // Reset the token so below test cases can use accordingly
    }, 13000);

    it('/v1/user/signup post - Signup User', async () => {

        userObject_signup.code = mockUser.code;
        let res = await testSingupUser(userObject_signup);
        let userNotificationSettingRes = await mockFunctions.getUserNotificationByUserId(res.body.data.user[0].id);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
        expect(userNotificationSettingRes.length).toBeGreaterThanOrEqual(2);

        // Delete the temp user added above
        accessToken = User.getJwt(mockUser);
        await testDeleteUserExec(res.body.data.user[0].id);
        accessToken = '' // Reset the token so below test cases can use accordingly
    }, 30000);

    // Signing up user with username as email
    it('/v1/user/signup post - Signup User with email as a username', async () => {

        userObject_signup_email.code = mockUser.code;
        let res = await testSingupUser(userObject_signup_email);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);

        // Delete the temp user added above
        accessToken = User.getJwt(mockUser);
        await testDeleteUserExec(res.body.data.user[0].id);
        accessToken = '' // Reset the token so below test cases can use accordingly
    }, 10000);

    it('/v1/user/signup post - Signup User - Notes fields empty', async () => {

        userObject_signup.code = mockUser.code;
        userObject_signup.notes = '';
        let res = await testSingupUser(userObject_signup);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);

        // Delete the temp user added above
        accessToken = User.getJwt(mockUser);
        await testDeleteUserExec(res.body.data.user[0].id);
        accessToken = '' // Reset the token so below test cases can use accordingly
    }, 10000);
    //

    // User Empty login
    // User Invalid password length
    // User Invalid code
    // User Invalid credentials and with correct code
    // User invalid data
    // User pending or deactive
    // User Invalid password
    // User login

    const testLoginUser = (data) => {
        return request(server).post('/v1/user/login')
            .send(data);
    }

    it('/v1/user/login post - Login User - Empty Login', async () => {

        let res = await testLoginUser({
            username: "",
            password: "",
            code: ""
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);

    });

    it('/v1/user/login post - Login User - Invalid password length', async () => {

        let res = await testLoginUser({
            username: mockUser.username,
            password: "hN8*(",
            code: mockUser.code
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);

    });

    it('/v1/user/login post - Login User - Invalid code', async () => {

        let res = await testLoginUser({
            username: mockUser.username,
            password: mockUser.password,
            code: "NATIA201934"
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(401);

    });

    it('/v1/user/login post - Login User - Invalid credentials', async () => {

        let res = await testLoginUser({
            username: "anderson",
            password: "hN8*(kjsdfni",
            code: mockUser.code
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(401);

    });

    it('/v1/user/login post - Login User - Invalid password', async () => {

        let res = await testLoginUser({
            username: mockUser.username,
            password: "hN8*(kjsdfni",
            code: mockUser.code
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(401);

    });

    it('/v1/user/login post - Login User - Pending', async () => {

        userObject_signup.code = mockUser.code;
        let tempUser = await testSingupUser(userObject_signup);
        let res = await testLoginUser({
            username: userObject_signup.username,
            password: "34343nN*3$#",
            code: mockUser.code
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(401);
        expect(res.body.message).toEqual(expect.stringContaining(userStatus()[1]));

        // Delete the temp user added above
        accessToken = User.getJwt(mockUser);
        await testDeleteUserExec(tempUser.body.data.user[0].id);
        accessToken = '' // Reset the token so below test cases can use accordingly
    }, 15000);

    it('/v1/user/login post - Login User', async () => {

        let res = await testLoginUser({
            username: mockUser.username,
            password: mockUser.password,
            code: mockUser.code
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
        expect(res.body.data.user[0]).toHaveProperty('accessToken');
        expect(res.body.data.user[0].date_format).toBe(dateFormat()[0]);
        accessToken = res.body.data.user[0].accessToken;
    });



   

    // Empty values
    // Duplicate username/email
    // password strength
    // Email check
    // max length
    // user created
    // user get all users
    // user get user
    // user update
    // user delete
    const testCreateUser = (data) => {
        return request(server).post('/v1/user/')
            .set('Authorization', 'Bearer ' + accessToken)
            .send(data);
    }

    it('/v1/user post - User Create - Empty Response', async () => {
        let res = await testCreateUser(invalidUserObject);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);
    });

    it('/v1/user post - User Create - Weak Password', async () => {

        let origValue = userObject.password;
        userObject.password = '123abc';

        let res = await testCreateUser(userObject);
        userObject.password = origValue;

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);
    });

    it('/v1/user post - User Create - Email verification', async () => {

        let origValue = userObject.email;
        userObject.email = '123abc.com';

        let res = await testCreateUser(userObject);
        userObject.email = origValue;

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);
    });

    it('/v1/user post - User Create - Username Max length', async () => {

        let origValue = userObject.username;
        userObject.username = 'sdfsdfssdfsdf8sd7f87sd8f78sd78fsd8f78sd8f8sd8f7sd87f8sd7f8sd78f7sd87f8sd78f7sd87f8sd78f78sd7f8s7f';

        let res = await testCreateUser(userObject);
        userObject.username = origValue;

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);
    });


    it('/v1/user post - User Create - investigation Invalid investigation', async () => {

        userObjectInvestigation.investigation = [9999, 3333]; // Invalid Id
        let res = await testCreateUser(userObjectInvestigation);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);

    }, 10000);

    it('/v1/user post - User Create - investigation Include', async () => {

        userObjectInvestigation.investigation = [investigationResult1.insertId, investigationResult2.insertId];

        let res = await testCreateUser(userObjectInvestigation);

        withInvestId = res.body.data.user[0].id;
        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
        expect(res.body.data.user[0].investigation).toEqual(expect.arrayContaining([investigationResult1.insertId, investigationResult2.insertId]));
    }, 10000);

    it('/v1/user post - User Create - Duplicate Record', async () => {
        let res = await testCreateUser(userObject);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(400);
    }, 10000);

    // --
    // Note: Negative scenario cannot check because user is already in database (i.e current user)

    const testGetAllUserExec = () => {
        return request(server)
            .get('/v1/user/')
            .set('Authorization', 'Bearer ' + accessToken);
    }

    it('/v1/user/ get - User get all users', async () => {

        let res = await testGetAllUserExec();
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(200);
        expect(res.body.data.user[0]).toHaveProperty('id');
    }, 10000);
    // --

    // ---
    const testResendEmailUserExec = (id) => {
        return request(server)
            .get('/v1/user/resend-mail/' + id)
            .set('Authorization', 'Bearer ' + accessToken);
    }

    it('/v1/user/resend-mail/:id GET - User Resend Email', async () => {

        let res = await testResendEmailUserExec(id);
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(200);
    }, 15000);

    it('/v1/user/resend-mail/:id GET - User Resend Email - Invalid Id', async () => {

        let res = await testResendEmailUserExec(id + dateTime);
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(404);
    }, 10000);

    // // ---

    // --
    const testUpdateUser = (id, status = null, userObject) => {
        userObject.name = newName;
        userObject.status = !isEmpty(status) ? status : userStatus()[1];

        return request(server).put('/v1/user/' + id)
            .set('Authorization', 'Bearer ' + accessToken)
            .send(userObject);
    }

    it('/v1/user/:id PUT - User Update - Invalid Id', async () => {
        let res = await testUpdateUser(id + dateTime, null, userObject); // random id

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(404);

    }, 30000);

    it('/v1/user/:id PUT - User Update - Invalid Status', async () => {
        let res = await testUpdateUser(id, "K", userObject);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);

    });


    it('/v1/user/:id PUT - User Update - Empty object', async () => {
        let res = await testUpdateUser(id, null, invalidUserObject);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);

    });

    it('/v1/user/:id PUT - User Update', async () => {
        let res = await testUpdateUser(id, null, userObject);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
        expect(res.body.data.user[0]).toHaveProperty('id');
        expect(res.body.data.user[0].name).toEqual(newName);

    }, 90000);

    it('/v1/user/:id PUT - User Update - Duplicate Username', async () => {

        let userObject_clone = JSON.parse(JSON.stringify(userObject));
        userObject_clone.username = mockUser.username;
        let res = await testUpdateUser(id, null, userObject_clone);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(400);
        expect(res.body.code).toBe(responseMessages.DUPLICATE_RECORD);
    }, 90000);

    it('/v1/user/:id PUT - User Update - Investigation Empty', async () => {
        userObjectInvestigation.investigation = [];
        let res = await testUpdateUser(withInvestId, null, userObjectInvestigation);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
    }, 90000);

    it('/v1/user/:id PUT - User Update - Investigation invalid id', async () => {
        userObjectInvestigation.investigation = [-7777];
        let res = await testUpdateUser(withInvestId, null, userObjectInvestigation);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);
    }, 90000);
    // --

    // --
    it('/v1/user/resend-mail/:id get - User Resend Email - User Status Not Approved', async () => {

        let res = await testResendEmailUserExec(id);
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(400);
    });
    // --

    // --
    const testGetUserExec = (userId) => {
        return request(server)
            .get('/v1/user/' + userId)
            .set('Authorization', 'Bearer ' + accessToken);
    }

    it('/v1/user/:id get - User Get detail - invalid id', async () => {

        let res = await testGetUserExec(dateTime);

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(404);;
    });

    it('/v1/user/:id get - User Get detail', async () => {

        let res = await testGetUserExec(id);
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(200);
        expect(res.body.data.user[0]).toHaveProperty('id');
    });

    it('/v1/user/:id get - User Get detail - With Investigation', async () => {

        let res = await testGetUserExec(withInvestId);

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(200);
        expect(res.body.data.user[0].investigation).toEqual(expect.arrayContaining([investigationResult1.insertId]));
    });

    // // --

    it('/v1/user/login post - Login User - Password Empty in the DB', async () => {

        await testUpdateUser(id, userStatus()[0], userObject); // change to APPROVED status
        let res = await testLoginUser({
            username: userObject.username,
            password: "34343nN*3$#",
            code: mockUser.code
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(403);
    }, 11000);


    // // Empty Password
    // // Password min length
    // // complexity
    // // Invalid Token
    // // Token Expired
    // // success

    // ---
    const testPasswordResetExec = (token, data) => {
        return request(server)
            .put('/v1/user/password-reset/' + token)
            .send(data);
    }

    it('/v1/user/password-reset/:token PUT - Password Reset - Password Empty', async () => {


        let buf = crypto.randomBytes(20);
        let res = await testPasswordResetExec(buf.toString('hex'), { password: "" });

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(422);

    });

    it('/v1/user/password-reset/:token PUT - Password Reset - Invalid length', async () => {


        let buf = crypto.randomBytes(20);
        let res = await testPasswordResetExec(buf.toString('hex'), { password: "#jnK8" });

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(422);

    });

    it('/v1/user/password-reset/:token PUT - Password Reset - Complexity', async () => {


        let buf = crypto.randomBytes(20);
        let res = await testPasswordResetExec(buf.toString('hex'), { password: "abcdefgb13243" });

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(422);

    });

    it('/v1/user/password-reset/:token PUT - Password Reset - Invalid Token', async () => {

        //let userTokenDetails = await mockFunctions.getTokenDetail(userObject.email); // get above user created token
        //resetToken = userTokenDetails[0].reset_password_token;

        let buf = crypto.randomBytes(20);
        let res = await testPasswordResetExec(buf.toString('hex'), { password: "#jnK834jfsdf" });

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(401);

    });


    it('/v1/user/password-reset/:token PUT - Password Reset - Time expired', async () => {

        //let userTokenDetails = await mockFunctions.getTokenDetail(userObject.email); // get above user created token
        //resetToken = userTokenDetails[0].reset_password_token;

        await mockFunctions.updateTokenExpiryTime(userObject.email, "old");

        let buf = crypto.randomBytes(20);
        let res = await testPasswordResetExec(buf.toString('hex'), { password: "#jnK834jfsdf" });

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(401);

    }, 10000);

    it('/v1/user/password-reset/:token PUT - Password Reset', async () => {

        let userTokenDetails = await mockFunctions.getTokenDetail(userObject.email); // get above user created token
        resetToken = userTokenDetails[0].reset_password_token;

        await mockFunctions.updateTokenExpiryTime(userObject.email, "new");

        let res = await testPasswordResetExec(resetToken, { password: resetPassword });

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(200);

    }, 10000);

    it('/v1/user/login post - Password Reset - Login Succuss', async () => {

        let res = await testLoginUser({
            username: userObject.username,
            password: resetPassword,
            code: mockUser.code
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
        expect(res.body.data.user[0]).toHaveProperty('accessToken');
    });
    //

    // Empty email
    // Invalid email
    // Email not in database
    // Invalid Token
    // Account is pending

    const testForgetPasswordUserExec = (data) => {
        return request(server)
            .put('/v1/user/forget-password')
            .send(data);
    }

    it('/v1/user/forget-password PUT - Forget Password - Empty Email', async () => {

        let res = await testForgetPasswordUserExec({
            "email": ""
        });
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(422);
    }, 10000);

    it('/v1/user/forget-password PUT - Forget Password - Invalid Email', async () => {

        let res = await testForgetPasswordUserExec({
            "email": "asdkfjalskfj"
        });
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(422);
    }, 10000);

    it('/v1/user/forget-password PUT - Forget Password - Email Not in Database', async () => {

        let res = await testForgetPasswordUserExec({
            "email": "hello@mock.com"
        });
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(404);
    }, 10000);

    it('/v1/user/forget-password PUT - Forget Password - Account is Pending', async () => {

        await testUpdateUser(id, userStatus()[1], userObject); // change to PENDING status

        let res = await testForgetPasswordUserExec({
            "email": userObject.email
        });

        await testUpdateUser(id, userStatus()[0], userObject); // change to APPROVED status

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(403);
    }, 30000);

    it('/v1/user/forget-password PUT - Forget Password', async () => {

        let res = await testForgetPasswordUserExec({
            "email": userObject.email
        });

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(200);
    }, 10000);

    it('/v1/user/password-reset/:token PUT - Forget Password - Password Reset', async () => {

        let userTokenDetails = await mockFunctions.getTokenDetail(userObject.email); // get above user created token
        resetToken = userTokenDetails[0].reset_password_token;

        let res = await testPasswordResetExec(resetToken, { password: resetPassword });

        expect(res.type).toBe('application/json')
        expect(res.status).toBe(200);
    }, 10000);

    it('/v1/user/login post - Forget Password - Login Succuss', async () => {

        let res = await testLoginUser({
            username: userObject.username,
            password: resetPassword,
            code: mockUser.code
        });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
        expect(res.body.data.user[0]).toHaveProperty('accessToken');
    }, 10000);
    //

    // --
    // Empty password
    // Invalid password
    // Invalid length
    // Invalid Token
    // Succuss
    const testProfilePasswordUpdate = (profileObj, token) => {

        return request(server).put('/v1/user/profile/password')
            .set('Authorization', 'Bearer ' + token)
            .send(profileObj);
    }

    it('/v1/user/profile/password put - User Profile Password - Empty', async () => {

        let res = await testProfilePasswordUpdate({
            "oldPassword": "",
            "password": ""
        }, accessToken);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);
    });

    it('/v1/user/profile/password put - User Profile Password - Invalid', async () => {

        let res = await testProfilePasswordUpdate({
            "oldPassword": "*DFJN8kns2#n",
            "password": mockUser.password
        }, accessToken);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);
    });

    it('/v1/user/profile/password put - User Profile Password - Invalid Length', async () => {

        let res = await testProfilePasswordUpdate({
            "oldPassword": "*DFJf",
            "password": "*DFJf"
        }, accessToken);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);
    });

    it('/v1/user/profile/password put - User Profile Password - Invalid Token', async () => {

        let res = await testProfilePasswordUpdate({
            "oldPassword": mockUser.password,
            "password": mockUser.password
        }, config.get("invalidToken"));

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(401);
    });

    it('/v1/user/profile/password put - User Profile Password', async () => {

        let res = await testProfilePasswordUpdate({
            "oldPassword": mockUser.password,
            "password": mockUser.password
        }, accessToken);

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
    });
    // ---

    // --
    // User Profile - API
    // Empty value
    // Invalid user Token
    // Duplicate Email
    const testProfileUpdate = (profileObj) => {

        return request(server).put('/v1/user/profile')
            .set('Authorization', 'Bearer ' + accessToken)
            .send(profileObj);
    }

    it('/v1/user/profile put - User Profile - Empty', async () => {
        let res = await testProfileUpdate({ ...invalidUserObject, date_format: "" });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(422);

    });

    it('/v1/user/profile put - User Profile - InvalidToken', async () => {

        let oldToken = accessToken;
        accessToken = config.get("invalidToken");
        let res = await testProfileUpdate({ ...userObject, date_format: dateFormat()[0] });
        accessToken = oldToken;

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(401);
        expect(res.body.code).toEqual(responseMessages.INVALID_OR_EXPIRED_TOKEN);
    });


    it('/v1/user/profile put - User Profile - Duplicate Username', async () => {

        userObject_signup.code = mockUser.code; // add the client code
        let tempUser = await testSingupUser(userObject_signup); // create sample temp user

        // update existing user with above created user email
        let profileObj = userObject; // refer to another variable
        delete profileObj.status; // delete the status
        delete profileObj.investigation; // delete the status
        delete profileObj.role_id; // delete the status
        profileObj.email = userObject_signup.email;
        let res = await testProfileUpdate({ ...profileObj, date_format: dateFormat()[0] });

        expect(res.type).toBe('application/json');
        expect(res.status).toBe(400);

        // await testDeleteUserExec(tempUser.body.data.user[0].id);
    }, 10000);

    it('/v1/user/profile put - User Profile', async () => {

        let tempMock = mockUser;
        tempMock.alias = "newAlias"
        delete tempMock.code;
        delete tempMock.id;
        delete tempMock.password;
        delete tempMock.clientId;
        delete tempMock.role_id;
        tempMock.date_format = dateFormat()[1]
        let res = await testProfileUpdate(tempMock);

        expect(res.type).toBe('application/json');
        expect(res.body.data.user[0].date_format).toBe(dateFormat()[1]);
        expect(res.status).toBe(200);
    });
    //

    // --
    // User Profile - API
    // Invalid user token
    // Valid user token
    const testProfileGet = (token) => {

        return request(server).get('/v1/user/profile')
            .set('Authorization', 'Bearer ' + token);
    }

    it('/v1/user/profile GET - User Profile', async () => {

        let res = await testProfileGet(config.get('invalidToken'));
        expect(res.type).toBe('application/json');
        expect(res.status).toBe(401);
    });

    it('/v1/user/profile GET - User Profile', async () => {

        let res = await testProfileGet(accessToken);
        expect(res.type).toBe('application/json');
        expect(res.status).toBe(200);
    });


    // ---
    const testDeleteUserExec = (id) => {
        return request(server)
            .delete('/v1/user/' + id)
            .set('Authorization', 'Bearer ' + accessToken);
    }

    it('/v1/user/:id delete - User Delete - invalid id', async () => {

        let res = await testDeleteUserExec(id + dateTime);
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(404);
    });

    it('/v1/user/:id delete - User Delete', async () => {

        let res = await testDeleteUserExec(id);
        expect(res.type).toBe('application/json')
        expect(res.status).toBe(200);
    });
    // ---


    it('User - Mock Data Deletion confirmed', async () => {


        // Incase test case fails in the middle, this function will clear all the Mock users from database.
        let data = await mockFunctions.deleteMockUsers(mobile, serviceNumber);
        let investgationData1 = await mockFunctions.deleteInvestigation();
        let client = await mockFunctions.deleteMockClient();



        expect(data.affectedRows).toBeGreaterThanOrEqual(1);
        expect(client.affectedRows).toBeGreaterThanOrEqual(1);
        expect(investgationData1.affectedRows).toBeGreaterThanOrEqual(0);
    }, 30000);

});
