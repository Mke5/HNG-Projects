const { createString } = require("../controller/stringController")

const router = require("express").Router()


router.post('/', createString)


module.exports = router