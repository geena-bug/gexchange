const express = require('express');
const router = express.Router();
const validations = require('../middelware/auth-validations')
const controllers = require('../controllers/auth-controller')
const session = require('express-session'); // Import express-session to manage sessions
const passport = require('../lib/passport');

/* GET Signup and login page. */
router.get('/signup',controllers.signUp);
router.get('/signup-success',controllers.signUpSuccess);

router.get('/login', controllers.login);

/* Submit signup and login page. */
router.post('/signup',[validations.signUpValidation], controllers.processSignup);

router.post('/login', [validations.loginValidation], controllers.processPassportLogin);
// router.post('/login', passport.authenticate('local', {
//     successRedirect: '/users',
//     failureRedirect: '/auth/login',
//     failureFlash: true,
//     failureMessage: 'Invalid username or password',
// }));

//Export router contents
module.exports = router;
