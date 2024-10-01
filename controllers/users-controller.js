const countryList = require('../common/currency-list')
const {validationResult} = require('express-validator')

const dashboard = (req, res) => {
    //Redirect user back to login page if not authenticated
    if(!req.session.user){
        return res.redirect('/auth/login')
    }
    res.render('user/dashboard', {
        pageTitle: 'Converter',
        countries: countryList,
        userId: req.session.user.id,
        userPhoto: req.session.user.photo
    });
}

const saveConversion = (req, res) => {
    //Redirect user back to login page if not authenticated
    if(!req.session.user){
        return res.redirect('/auth/login')
    }

    const userId = req.body.userId
    const currencyFrom = req.body.currencyFrom
    const currencyTo = req.body.currencyTo
    const amount = req.body.amount
    const convertedAmount = req.body.convertedAmount
    const convertedDate = new Date()
    //save to database
    req.app.get('db').run(`
                INSERT INTO conversions (user_id, currency_from, currency_to, amount, converted_amount, conversion_date) VALUES (?, ?, ?, ?, ?, ?)
            `, [userId, currencyFrom, currencyTo, amount, convertedAmount, convertedDate.toDateString()]
    )
    return res.json({
        message: 'Conversion saved'
    });
}

const listConversions = async (req, res) => {
    //Redirect user back to login page if not authenticated
    if(!req.session.user){
        return res.redirect('/auth/login')
    }

    const userId = req.session.user.id

    //get user conversion history
    const dbQuery = new Promise((resolve, reject)=>{
        req.app.get('db').all(`
            SELECT currency_from,currency_to,amount,converted_amount,conversion_date, b.id FROM users a JOIN conversions b ON a.id = b.user_id WHERE b.user_id = ?
        `,[userId], (err, rows) => {
            //throw an error if there is a database error
            if(err){
                reject(err)
            }
            if(rows){
                //return the records from database
                resolve(rows)
            }
        })
    })
    const result = await dbQuery

    //display the conversion history view
    res.render('user/conversions', {
        pageTitle: 'My Conversions',
        conversions: result,
        currencies: countryList,
    });
}

const updateAccountFormSubmit = async (req, res) => {
    //Redirect user back to login page if not authenticated
    if(!req.session.user){
        return res.redirect('/auth/login')
    }
    //validate fields
    const validate = validationResult(req)
    const firstname = req.body.first_name
    const lastname = req.body.last_name
    let password = req?.body?.password
    const email = req.body.email
    const userId = req.session.user.id

    let errors =  validate.array().map(error => error.msg)//extract the error messages
    //check if there is a field that failed the validation
    if(!validate.isEmpty()){
        errors =  validate.array().map(error => error.msg)//extract the error messages
    }

    if(errors.length === 0){
        //find a user with submitted email
        const dbQuery = new Promise((resolve, reject)=>{
            req.app.get('db').all(`
            SELECT * FROM users WHERE email = ?
        `, [email], (err, rows) => {
                //throw an error if there is a database error
                if(err){
                    reject(err)
                }
                if(rows){
                    //return the records from database
                    resolve(rows)
                }
            })
        })
        const result = await dbQuery

        //check if we find a user with same submitted. if there is a record, add an error message
        if(result.length > 0 && result[0].id !== userId){
            errors.push('Email already exists')
        }else {
            if(!password){
                password = result[0].password
            }
            //save to database
            req.app.get('db').run(`
                UPDATE users SET first_name = ?, last_name = ?, email = ? , password = ? WHERE id = ?
            `, [firstname, lastname, email, password, userId])
        }
    }
    //redirect to the account update page
    return res.redirect('/users/update-account');
}

const updateAccount = async (req, res) => {
    if(!req.session.user){
        return res.redirect('/auth/login')
    }
    //fetch current logged-in user from database using the user data saved in the session
    const dbQuery = new Promise((resolve, reject)=>{
        req.app.get('db').all(`
            SELECT * FROM users WHERE id = ?
        `, [req.session.user.id], (err, rows) => {
            //throw an error if there is a database error
            if(err){
                reject(err)
            }
            if(rows){
                //return the records from database
                resolve(rows)
            }
        })
    })
    const result = await dbQuery
    //pick the first item returned from the database
    const user = result[0]

    res.render('user/update-account', {
        pageTitle: 'Update Account',
        userData: user,
    });
}

const uploadPhoto = async (req, res) => {
    const filename = req.file.filename
    //update user photo column with the file name
    req.app.get('db').run(`
                UPDATE users SET photo = ? WHERE id = ?
            `, [filename, req.session.user.id])

    //redirect to the account update page
    return res.redirect('/users/update-account');
}

const logout = async (req, res) => {

    //delete user session
    delete req.session.user

    //redirect to the account update page
    return res.redirect('/');
}

const liveExchange = async (req, res) => {
    const apiKey = 'c50ca59ab4a6fbf8a8525554'
    //make request to convert currency API
    const request = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/CAD`)
    //get data from currency converter API
    const data = await request.json()

    res.render('user/live-exchange', {
        pageTitle: 'Current Exchange Rate',
        rates: data.conversion_rates,
        currencies: countryList,
        updated_date: data.time_last_update_utc,
    });
}

module.exports = {
    dashboard,
    updateAccount,
    listConversions,
    saveConversion,
    updateAccountFormSubmit,
    uploadPhoto,
    logout,
    liveExchange
}