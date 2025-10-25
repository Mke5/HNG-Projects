// const mongoose = require("mongoose");
const mysql = require('mysql2/promise')
require('dotenv').config()

let pool;
const connect = async () => {
    try{
        const connectionConfig = {}
        if (process.env.MYSQL_URI) {
            console.log('Attempting connection using MYSQL_URI...');
            connectionConfig.uri = process.env.MYSQL_URI;
        } else {
            console.log('MYSQL_URI not found. Falling back to individual parameters...');
            connectionConfig.host = process.env.MYSQL_HOST || 'localhost';
            connectionConfig.user = process.env.MYSQL_USER;
            connectionConfig.password = process.env.MYSQL_PASSWORD;
            connectionConfig.database = process.env.MYSQL_DATABASE;
        }
        // pool = mysql.createPool({
        //     host: process.env.MYSQL_HOST || 'localhost',
        //     user: process.env.MYSQL_USER,
        //     password: process.env.MYSQL_PASSWORD,
        //     database: process.env.MYSQL_DATABASE,
        //     waitForConnections: true,
        //     connectionLimit: 10,
        //     queueLimit: 0
        // });

        connectionConfig.waitForConnections = true;
        connectionConfig.connectionLimit = 10;
        connectionConfig.queueLimit = 0;

        pool = mysql.createPool(connectionConfig)
        const createTable = `
            CREATE TABLE IF NOT EXISTS countries (
                -- The country name, used as the primary identifier for updates/lookups
                name VARCHAR(255) NOT NULL PRIMARY KEY,
                
                -- Basic geographic data, nullable
                capital VARCHAR(255) NULL,
                region VARCHAR(255) NULL,
                
                -- Numeric data
                population BIGINT NOT NULL,
                currency_code VARCHAR(10) NULL,
                
                -- Floating-point numbers for financial metrics
                exchange_rate DOUBLE NULL, 
                estimated_gdp DOUBLE NULL, 
                
                -- URL for the flag image
                flag_url TEXT NULL,
                
                -- Timestamp of the last successful refresh
                last_refreshed_at VARCHAR(255) NOT NULL
            );
        `
        await pool.query(createTable)
        // await pool.query(`DROP TABLE IF EXISTS countries`)
        // await pool.query('SELECT 1 + 1 AS solution');
        console.log('DB connected via MySQL Pool');
        return pool
    }catch(error){
        console.error('Database connection failed:', error.message)
        process.exit(1)
    }
}

const getPool = () => {
    if (!pool) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return pool;
};


module.exports = {
    connect,
    getPool 
}