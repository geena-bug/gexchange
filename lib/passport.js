const passport  = require('passport');
const LocalStrategy  = require('passport-local').Strategy;
const db = require('../database');

passport.use(new LocalStrategy(
    async function(username, password, done) {
        console.log('Username:', username);
        const dbQuery = new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM users WHERE email = ? AND password = ?
            `, [username, password], (err, rows) => {
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
            const user = {
                id: userData.id,
                email: userData.email,
                photo: userData.photo
            };
           // Return the user data
            return done(null, user);
        }

        // Return false if the user is not found
        return done(null, false);
    }
))

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const dbQuery = new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM users WHERE id = ?
        `, [id], (err, rows) => {
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
        const user = {
            id: userData.id,
            email: userData.email,
            photo: userData.photo,
            firstName: userData.first_name,
            lastName: userData.last_name
        };
        // Return the user data
        return done(null, user);
    }
});
module.exports = passport;