const { validationResult } = require('express-validator'); // Import the validation result method from express-validator

// Export the signUp function
module.exports.signUp = (req, res) => {
    // Render the signup page with a pageTitle
    res.render('auth/signup', {
        pageTitle: 'Signup',
    });
};

module.exports.signUpSuccess = (req, res) => {
    // Render the signup page with a pageTitle
    res.render('auth/signup-success', {
        pageTitle: 'Signup',
    });
};

// Export the login function
module.exports.login = (req, res) => {
    // Redirect user back to dashboard if authenticated
    if (req.session.user) {
        return res.redirect('/users');
    }
    // Render the login page with a pageTitle
    res.render('auth/login', {
        pageTitle: 'Login',
    });
};

// Export the processLogin function
module.exports.processLogin = async (req, res) => {
    // Validate fields
    const validate = validationResult(req);
    const password = req.body.password;
    const email = req.body.email.toLowerCase();
    // Extract the error messages
    let errors = validate.array().map(error => error.msg);

    // Check if there is a field that failed the validation
    if (!validate.isEmpty()) {
        errors = validate.array().map(error => error.msg); // Extract the error messages
    }

    // Check that we don't have errors before making a database request
    if (errors.length === 0) {
        // Find a user with submitted email and password
        const dbQuery = new Promise((resolve, reject) => {
            req.app.get('db').all(`
            SELECT * FROM users WHERE email = ? AND password = ?
        `, [email, password], (err, rows) => {
                // Throw an error if there is a database error
                if (err) {
                    reject(err);
                }
                if (rows) {
                    // Return the records from the database
                    resolve(rows);
                }
            })
        });
        const result = await dbQuery;

        if (result.length > 0) {
            const userData = result[0];
            // Set session
            req.session.user = {
                id: userData.id,
                email: userData.email,
                photo: userData.photo
            };
            return res.redirect('/users');
        } else {
            errors.push('Invalid email or password');
        }
    }

    // Render the login page with errors
    res.render('auth/login', {
        pageTitle: 'Login',
        errors,
    });
};

// Export the processSignup function
module.exports.processSignup = async (req, res) => {
    // Validate fields
    const validate = validationResult(req);
    const firstname = req.body.first_name;
    const lastname = req.body.last_name;
    const password = req.body.password;
    const email = req.body.email.toLowerCase();

    // Extract the error messages
    let errors = validate.array().map(error => error.msg);

    // Check if there is a field that failed the validation
    if (!validate.isEmpty()) {
        errors = validate.array().map(error => error.msg); // Extract the error messages
    }

    // Check that we don't have errors before making a database request
    if (errors.length === 0) {
        // Find a user with submitted email
        const dbQuery = new Promise((resolve, reject) => {
            req.app.get('db').all(`
            SELECT * FROM users WHERE email = ?
        `, [email], (err, rows) => {
                // Throw an error if there is a database error
                if (err) {
                    reject(err);
                }
                if (rows) {
                    // Return the records from the database
                    resolve(rows);
                }
            })
        });
        const result = await dbQuery;

        // Check if we find a user with the submitted email
        if (result.length > 0) {
            errors.push('Email already exists');
        } else {
            // Save to database
            req.app.get('db').run(`
                INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)
            `, [firstname, lastname, email, password]);
        }
    }

    // Render the signup page with errors
    res.render('auth/signup', {
        pageTitle: 'Signup',
        errors
    });
};