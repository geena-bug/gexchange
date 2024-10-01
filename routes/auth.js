const express = require('express');
const router = express.Router();
const validations = require('../middelware/auth-validations')
const controllers = require('../controllers/auth-controller')

/* GET Signup and login page. */
router.get('/signup',controllers.signUp);
router.get('/signup-success',controllers.signUpSuccess);

router.get('/login', controllers.login);

/* Submit signup and login page. */
router.post('/signup',[validations.signUpValidation], controllers.processSignup);

router.post('/login', [validations.loginValidation], controllers.processLogin);

//Export router contents
module.exports = router;
