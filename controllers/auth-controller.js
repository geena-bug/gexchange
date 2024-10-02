const { validationResult } = require('express-validator'); // Import the validationResult method from express-validator to handle form validation results

// Export the signUp function to render the signup page
module.exports.signUp = (req, res) => {
    // Render the signup page and pass the pageTitle variable
    res.render('auth/signup', {
        pageTitle: 'Signup', // Set the page title to "Signup"
    });
};

// Export the signUpSuccess function to render the signup success page
module.exports.signUpSuccess = (req, res) => {
    // Render the signup success page and pass the pageTitle variable
    res.render('auth/signup-success', {
        pageTitle: 'Signup', // Set the page title to "Signup Success"
    });
};

// Export the login function to render the login page
module.exports.login = (req, res) => {
    // Check if the user is already authenticated (logged in)
    if (req.session.user) {
        // If the user is authenticated, redirect them to the user's dashboard or profile
        return res.redirect('/users');
    }
    // Render the login page and pass the pageTitle variable
    res.render('auth/login', {
        pageTitle: 'Login', // Set the page title to "Login"
    });
};

// Export the processLogin function to handle login form submission
module.exports.processLogin = async (req, res) => {
    // Validate the form fields using express-validator
    const validate = validationResult(req);
    const password = req.body.password; // Get the submitted password
    const email = req.body.email.toLowerCase(); // Get the submitted email and convert it to lowercase

    // Extract error messages from the validation result
    let errors = validate.array().map(error => error.msg);

    // Check if there are validation errors
    if (!validate.isEmpty()) {
        errors = validate.array().map(error => error.msg); // Extract error messages if validation failed
    }

    // Check if there are no errors before proceeding with a database query
    if (errors.length === 0) {
        // Perform a database query to find a user with the submitted email and password
        const dbQuery = new Promise((resolve, reject) => {
            req.app.get('db').all(`
                SELECT * FROM users WHERE email = ? AND password = ?
            `, [email, password], (err, rows) => {
                // Handle database error
                if (err) {
                    reject(err);
                }
                // Resolve the promise with the database result (rows)
                if (rows) {
                    resolve(rows);
                }
            });
        });
        const result = await dbQuery; // Wait for the database query result

        // Check if the user is found in the database
        if (result.length > 0) {
            const userData = result[0]; // Get the first user from the result
            // Set the session data for the logged-in user
            req.session.user = {
                id: userData.id,
                email: userData.email,
                photo: userData.photo
            };
            // Redirect the user to the dashboard or profile page
            return res.redirect('/users');
        } else {
            // If the user is not found, add an error message
            errors.push('Invalid email or password');
        }
    }

    // Render the login page again with the error messages
    res.render('auth/login', {
        pageTitle: 'Login', // Set the page title to "Login"
        errors, // Pass the error messages to be displayed
    });
};

// Export the processSignup function to handle signup form submission
module.exports.processSignup = async (req, res) => {
    // Validate the form fields using express-validator
    const validate = validationResult(req);
    const firstname = req.body.first_name; // Get the submitted first name
    const lastname = req.body.last_name; // Get the submitted last name
    const password = req.body.password; // Get the submitted password
    const email = req.body.email.toLowerCase(); // Get the submitted email and convert it to lowercase

    // Extract error messages from the validation result
    let errors = validate.array().map(error => error.msg);

    // Check if there are validation errors
    if (!validate.isEmpty()) {
        errors = validate.array().map(error => error.msg); // Extract error messages if validation failed
    }

    // Check if there are no errors before proceeding with a database query
    if (errors.length === 0) {
        // Perform a database query to find if a user with the submitted email already exists
        const dbQuery = new Promise((resolve, reject) => {
            req.app.get('db').all(`
                SELECT * FROM users WHERE email = ?
            `, [email], (err, rows) => {
                // Handle database error
                if (err) {
                    reject(err);
                }
                // Resolve the promise with the database result (rows)
                if (rows) {
                    resolve(rows);
                }
            });
        });
        const result = await dbQuery; // Wait for the database query result

        // Check if a user with the submitted email already exists
        if (result.length > 0) {
            // Add an error message if the email already exists
            errors.push('Email already exists');
        } else {
            // If no user exists with the submitted email, save the new user to the database
            req.app.get('db').run(`
                INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)
            `, [firstname, lastname, email, password]);

            // Redirect the user to the signup success page after successful signup
            return res.redirect('/auth/signup-success');
        }
    }

    // Render the signup page again with the error messages
    res.render('auth/signup', {
        pageTitle: 'Signup', // Set the page title to "Signup"
        errors // Pass the error messages to be displayed
    });
};
