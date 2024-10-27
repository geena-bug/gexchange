const express = require('express');
const router = express.Router();
const userController = require('../controllers/users-controller')
const validation = require('../middelware/user-validations')
const isAuthenticated = require('../middelware/authentication')

/* Define user routes. */
//Load dashboard
router.get('/',isAuthenticated, userController.dashboard);
//Load conversions page
router.get('/conversions', isAuthenticated, userController.listConversions);
router.get('/delete-conversions', isAuthenticated, userController.deleteHistory);
//Load live exchange page
router.get('/live-exchange', isAuthenticated, userController.liveExchange);
router.get('/recent-activities', isAuthenticated, userController.recentActivity);

//Load the update account page
router.get('/update-account', isAuthenticated, userController.updateAccount);
//Submit the form on the update account page
router.post('/update-account',isAuthenticated, [validation.updateAccountValidation], userController.updateAccountFormSubmit);
//submit the conversion form
router.post('/save-conversion', isAuthenticated,[validation.conversionValidation], userController.saveConversion);
//submit the picture
router.post('/upload-picture', isAuthenticated, userController.uploadPhoto);
//Load the logout page
router.get('/logout', userController.logout);
//Export the router and its content(routes) to anywhere it will be used.
module.exports = router;
