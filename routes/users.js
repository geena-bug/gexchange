const express = require('express');
const router = express.Router();
const userController = require('../controllers/users-controller')
const validation = require('../middelware/user-validations')
const multer  = require('multer');

//set up multer to upload images
const storage = multer.diskStorage({
  //configure file destination i.e where the file will be saved
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  //configure the filename to be used while saving the file
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})

/* Define user routes. */
//Load dashboard
router.get('/', userController.dashboard);
//Load conversions page
router.get('/conversions', userController.listConversions);
//Load live exchange page
router.get('/live-exchange', userController.liveExchange);

//Load the update account page
router.get('/update-account', userController.updateAccount);
//Submit the form on the update account page
router.post('/update-account',[validation.updateAccountValidation], userController.updateAccountFormSubmit);
//submit the conversion form
router.post('/save-conversion',[validation.conversionValidation], userController.saveConversion);
//submit the picture
router.post('/upload-picture',upload.single('photo'), userController.uploadPhoto);
//Load the logout page
router.get('/logout',userController.logout);
//Export the router and its content(routes) to anywhere it will be used.
module.exports = router;
