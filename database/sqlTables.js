const userTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        photo VARCHAR(200) NOT NULL
    )
`

const conversionsTable = `
    CREATE TABLE IF NOT EXISTS conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER TEXT NOT NULL,
        currency_from TEXT NOT NULL,
        currency_to TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        converted_amount DECIMAL(10,2) NOT NULL,
        conversion_date TEXT NOT NULL,
        FOREIGN KEY (user_id)
            REFERENCES users (id)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
    )
`
const sqlStatements = [
    userTable,
    conversionsTable
]
module.exports = sqlStatements