const fs = require('fs') // Import the file system module to handle file operations
const countryList = require('../common/currency-list') // Import the list of countries/currencies
const { validationResult } = require('express-validator') // Import validation result from express-validator

const dashboard = (req, res) => {
    // Redirect user back to login page if not authenticated
    if (!req.session.user) {
        return res.redirect('/auth/login') // If no user session exists, redirect to login
    }

    // Render the user dashboard with relevant data
    res.render('user/dashboard', {
        pageTitle: 'Converter', // Set the page title
        countries: countryList, // Pass the country/currency list
        userId: req.session.user.id, // Pass the user's ID from session
        userPhoto: req.session.user.photo // Pass the user's photo from session
    });
}

const saveConversion = (req, res) => {
    // Redirect user back to login page if not authenticated
    if (!req.session.user) {
        return res.redirect('/auth/login') // If no user session exists, redirect to login
    }

    // Extract conversion data from the request body
    const userId = req.body.userId
    const currencyFrom = req.body.currencyFrom
    const currencyTo = req.body.currencyTo
    const amount = req.body.amount
    const convertedAmount = req.body.convertedAmount
    const convertedDate = new Date() // Get current date for the conversion

    // Save conversion data to the database
    req.app.get('db').run(`
        INSERT INTO conversions (user_id, currency_from, currency_to, amount, converted_amount, conversion_date) VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, currencyFrom, currencyTo, amount, convertedAmount, convertedDate.toDateString()]
    )

    // Respond with a success message
    return res.json({
        message: 'Conversion saved'
    });
}

const listConversions = async (req, res) => {
    // Redirect user back to login page if not authenticated
    if (!req.session.user) {
        return res.redirect('/auth/login') // If no user session exists, redirect to login
    }

    // Get current logged-in user's ID from the session
    const userId = req.session.user.id

    // Fetch the user's conversion history from the database
    const dbQuery = new Promise((resolve, reject) => {
        req.app.get('db').all(`
            SELECT currency_from, currency_to, amount, converted_amount, conversion_date, b.id FROM users a JOIN conversions b ON a.id = b.user_id WHERE b.user_id = ?
        `, [userId], (err, rows) => {
            if (err) {
                reject(err) // Handle database error
            }
            if (rows) {
                resolve(rows) // Return the fetched conversion data
            }
        })
    })

    const result = await dbQuery // Wait for the database query to complete

    // Render the conversion history page
    res.render('user/conversions', {
        pageTitle: 'My Conversions', // Set the page title
        conversions: result, // Pass the conversion data
        currencies: countryList, // Pass the country/currency list
        userPhoto: req.session.user.photo // Pass the user's photo from session
    });
}

const updateAccountFormSubmit = async (req, res) => {
    // Redirect user back to login page if not authenticated
    if (!req.session.user) {
        return res.redirect('/auth/login') // If no user session exists, redirect to login
    }

    // Validate the form fields
    const validate = validationResult(req)
    const firstname = req.body.first_name
    const lastname = req.body.last_name
    let password = req?.body?.password // Optional chaining for password
    const email = req.body.email
    const userId = req.session.user.id

    let errors = []
    // Check if validation failed, collect error messages
    if (!validate.isEmpty()) {
        errors = validate.array().map(error => error.msg) // Map error messages
    }

    if (errors.length === 0) {
        // Check if email already exists for another user
        const dbQuery = new Promise((resolve, reject) => {
            req.app.get('db').all(`
                SELECT * FROM users WHERE email = ?
            `, [email], (err, rows) => {
                if (err) {
                    reject(err) // Handle database error
                }
                if (rows) {
                    resolve(rows) // Return the fetched user data
                }
            })
        })
        const result = await dbQuery

        // If email exists and belongs to another user, add error message
        if (result.length > 0 && result[0].id !== userId) {
            errors.push('Email already exists')
        } else {
            if (!password) {
                password = result[0].password // Keep existing password if not updated
            }
            // Update user details in the database
            req.app.get('db').run(`
                UPDATE users SET first_name = ?, last_name = ?, email = ?, password = ? WHERE id = ?
            `, [firstname, lastname, email, password, userId])
        }
    }

    // Redirect to the account update page after submission
    return res.redirect('/users/update-account');
}

const updateAccount = async (req, res) => {
    // Redirect to login page if user is not logged in
    if (!req.session.user) {
        return res.redirect('/auth/login') // If no user session exists, redirect to login
    }

    // Fetch current user details from the database
    const dbQuery = new Promise((resolve, reject) => {
        req.app.get('db').all(`
            SELECT * FROM users WHERE id = ?
        `, [req.session.user.id], (err, rows) => {
            if (err) {
                reject(err) // Handle database error
            }
            if (rows) {
                resolve(rows) // Return the user data
            }
        })
    })

    const result = await dbQuery // Wait for the database query to complete
    const user = result[0] // Get the first user record

    // Render the account update page
    res.render('user/update-account', {
        pageTitle: 'Update Account', // Set the page title
        userData: user, // Pass the user's data
        userPhoto: req.session.user.photo // Pass the user's photo from session
    });
}

const uploadPhoto = async (req, res) => {
    const filename = req.file.filename // Get the uploaded file's filename
    const currentPhoto = req.session.user.photo // Get the current user photo from the session

    // Update the user photo in the database
    req.app.get('db').run(`
        UPDATE users SET photo = ? WHERE id = ?
    `, [filename, req.session.user.id])

    // Update the user session data with the new photo
    req.session.user = {
        ...req.session.user,
        photo: filename,
    }

    // Delete the old photo from the filesystem
    fs.unlink(process.cwd() + '/public/images/' + currentPhoto, function (err) {
        console.log(err) // Log any errors
    })

    // Redirect to the account update page
    return res.redirect('/users/update-account');
}

const logout = async (req, res) => {
    // Delete the user session
    delete req.session.user

    // Redirect to the homepage
    return res.redirect('/');
}

const deleteHistory = async (req, res) => {
    // Get the conversion ID from the query string
    const conversionId = req.query.conversion_id

    // Delete the conversion record from the database
    req.app.get('db').run(`DELETE FROM conversions WHERE ID = ?`, [conversionId])

    // Redirect to the conversions page
    return res.redirect('/users/conversions');
}

const liveExchange = async (req, res) => {
    // Set the API key for the currency converter service
    const apiKey = 'c50ca59ab4a6fbf8a8525554'

    // Make an API request to fetch the latest exchange rates
    const request = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/CAD`)

    // Parse the JSON response from the API
    const data = await request.json()

    // Render the live exchange rates page
    res.render('user/live-exchange', {
        pageTitle: 'Current Exchange Rate', // Set the page title
        rates: data.conversion_rates, // Pass the exchange rates data
        currencies: countryList, // Pass the list of countries/currencies
        updated_date: data.time_last_update_utc, // Pass the last updated date
        userPhoto: req.session.user.photo // Pass the user's photo from session
    });
}

// Export the module functions for use in other parts of the app where they are needed
module.exports = {
    dashboard,
    updateAccount,
    listConversions,
    saveConversion,
    updateAccountFormSubmit,
    uploadPhoto,
    logout,
    liveExchange,
    deleteHistory,
}
