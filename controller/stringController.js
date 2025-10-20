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


getString = async (req, res) => {
    const { stringValue } = req.params
    console.log(stringValue)
    const result = await stringService.getString(stringValue)
    console.log("Controller: ", result)
    if(!result)
        return res.status(404).send({error: "Not Found"})
    res.status(200).json(result)
}


getAllStrings = async (req, res) => {
    try{
        const data = await stringService.searchString(req.query)
        if(!data)
            return res.status(404).json({error: "No Data yet"})
        console.log("Getting all strings: ", data)
        res.status(200).json(data)
    }catch(error){
        res.status(400).json({error: "Invalid query parameters"})
    }
}



deleteString = async (req, res) => {
    const { stringValue } = req.params
    const deleted = stringService.deleteString(stringValue)
    if(!deleted)
        return res.status(404).json({error: "String not found"})
    res.status(204).send()
}


filterByNLP = async (req, res) => {
    const {query} = req.query 
    if(!query)
        return res.status(400).json({error: "Missing query"})
    const result = await stringService.filter(query)
    if(!result)
        return res.status(400).json({error: "Unable to parse natural language query"})
    res.status(200).json(result)
}







module.exports = {
    createString,
    getString,
    filterByNLP,
    getAllStrings,
    deleteString
}