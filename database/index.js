const sqlite3 = require('sqlite3').verbose()
const sqlStatements = require('./sqlTables')

const db = new sqlite3.Database('app_db.sqlite', (err)=>{
    //check if there was an error connecting to the database
    if(err){
        console.log('Error connecting to database', err.message)
        throw err
    }
})
//Everything looks good, we can then proceed with creating our database tables
for(let i = 0; i <  sqlStatements.length; i++){
    db.run(sqlStatements[i], (err)=>{
        if(err){
            console.log(err.message)
        }
    })
}

module.exports = db;