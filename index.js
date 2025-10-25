// const { default: axios } = require("axios");
const express = require("express")
const bodyParser = require("body-parser")
// const router = require("./routes/stringRoutes")
const {connect} = require('./config/db')
const fs = require('fs')
const countryRoutes = require('./routes/countryRoutes')

// 


const startServer = async () => {
    try {
        await connect(); // ✅ Waits for the pool to be created
        
        const app = express()

        app.use(bodyParser.json())
        app.use(express.json())
        app.use('/', countryRoutes) // This is only loaded AFTER connect() is successful

        if (!fs.existsSync('cache')) fs.mkdirSync('cache')

        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Internal server error' });
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        })
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}


startServer()