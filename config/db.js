// const mongoose = require("mongoose");
const mysql = require('mysql2/promise')
require('dotenv').config()

let pool;
const connect = async () => {
    try{
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        await pool.query('SELECT 1 + 1 AS solution');
        console.log('DB connected via MySQL Pool');
    }catch(error){
        console.error('MongoDB connection failed:', error.message)
        process.exit(1)
    }
}


module.exports = {
    connect,
    pool
}