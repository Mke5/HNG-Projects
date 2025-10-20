const stringService = require("../services/stringService")


createString = async (req, res) => {
    const {value} = req.body
    if(!value)
        return res.status(400).json({error: "Missing value"})

    if(typeof value !== "string")
        return res.status(422).json({error: "Value must be a string"})

    try{
        const result = await stringService.ananlyseAndStore(value)
        console.log("Controller: ", result)
        res.status(201).json(result)
    }catch(error){
        if(error.message === "String already exists")
            return res.status(409).json({error: "String already exists"})
        res.status(500).json({error: "Server error"})
    }
}












module.exports = {
    createString,

}