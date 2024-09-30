const {body} = require('express-validator')

const conversionValidation = [
    body('currencyFrom', "Currency from is required")
        .exists()
        .isLength({min: 1})
        .trim(),

    body('currencyTo', "Currency to is required")
        .isLength({min: 1})
        .trim(),

    body('amount', "Amount is required")
        .isNumeric()
        .isLength({min: 1}),

    body('convertedAmount', "Converted Amount is required")
        .isLength({min: 4})
        .isNumeric({min: 1}),

    body('userId', "User id is required")
        .isLength({min: 4})
        .isNumeric({min: 1})
]

const updateAccountValidation = [
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
]

module.exports = {
    conversionValidation,
    updateAccountValidation
}