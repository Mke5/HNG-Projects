const { default: axios } = require("axios");
const express = require("express")
const app = express()



app.get('/me', async (req, res) => {
    try{
        const resp = await axios.get("https://catfact.ninja/fact", {
            timeout: 3000
        })
        console.log(resp)
        res.status(200).json({
            "status": "success",
            "user": {
              "email": "emma08062602618@gmail.com",
              "name": "Michael Emmanuel",
              "stack": "Node.js/Express"
            },
            "timestamp": new Date().toISOString(),
            "fact": resp.data.fact,
        })
    }catch(error){
        console.error('Error fetching cat fact:', error.message);
        res.status(504).json({
            "status": "success",
            "user": {
                "email": "emma08062602618@gmail.com",
                "name": "Michael Emmanuel",
                "stack": "Node.js/Express"
            },
            "timestamp":  new Date().toISOString(),
            "fact": "No Cat Facts"
        })
    }
});



app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
})