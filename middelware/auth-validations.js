const {body} = require('express-validator')
const loginValidation = [
    body('email', "Invalid email")
        .isEmail()
        .trim()
        .normalizeEmail(),

    body('password', "Password is required")
        .isLength({min: 4})
        .isString()
]

const signUpValidation = [
    body('first_name', "First name is required")
        .exists()
        .isLength({min: 3})
        .trim(),

    body('last_name', "Last name is required")
        .isLength({min: 3})
        .trim(),

    body('email', "Invalid email")
        .isEmail()
        .trim(),

    body('password', "Password is required and must be between 4 to 16 characters")
        .isLength({min: 4})
        .isString(),
    body('confirmPassword')
        .isLength({min: 4})
        .withMessage("Confirm Password is required and must be between 4 to 16 characters")
        .isString()
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.password) {
                // trow error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
]

module.exports = {
    loginValidation,
    signUpValidation
}