const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    (err) => {
        console.log(err)
    },
    console.log('Server is up and listening!')
);

module.exports = db