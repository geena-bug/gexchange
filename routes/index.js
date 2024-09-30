const express = require('express');
const router = express.Router();
const validations = require('../middelware/auth-validations')
const controllers = require('../controllers/auth-controller')

/* GET Signup and login page. */
router.get('/auth/signup',controllers.signUp);

router.get('/auth/login', controllers.login);

/* Submit signup and login page. */
router.post('/auth/signup',[validations.signUpValidation], controllers.processSignup);

router.post('/auth/login', [validations.loginValidation], controllers.processLogin);

//Export router contents
module.exports = router;
