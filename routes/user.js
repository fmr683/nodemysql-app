const express = require('express');
const router = express.Router();
const userController = require("../controllers/user");
const userValidation = require("../validators/user");
const { checkPermission, checkAnyPermission } = require('../helper/global');


/* POST login user. */
router.post('/login', [userValidation.login], userController.login);

/* POST Register user. */
router.post('/signup', [userValidation.signup], userController.signup);

/* PUT Forget Password. */
router.put('/forget-password', [userValidation.forgetPassword], userController.forgetPassword);

/* PUT Password Reset. */
router.put('/password-reset/:token', [userValidation.forgetPasswordReset, userValidation.passwordComplexity], userController.passwordReset);

/* PUT User Profile Password Update */
router.put('/profile/password', [userValidation.profilePassword, userValidation.passwordComplexity], userController.profilePassword);

/* GET all user details. */
router.get('/', checkPermission('user.list'), userController.list);

/* GET user details. */
router.get('/:id', checkAnyPermission(['user.view', 'user.update']), userController.get);

/* GET user User Resend email. */
router.get('/resend-mail/:id', checkPermission('user.resend-email'), userController.resend);

/* POST Create User. */
router.post('/', checkPermission('user.create'), [userValidation.create, userValidation.duplicateUserName, investigationValidation.investigation, userRoleValidation.userRole], userController.create);

/* PUT user details. */
router.put('/:id', checkPermission('user.update'), [userValidation.update, userValidation.findUserById, userValidation.duplicateUserName, investigationValidation.investigation, userRoleValidation.userRole], userController.update);

/* GET user details. */
router.delete('/:id', checkPermission('user.delete'), userController.delete);



module.exports = router;
