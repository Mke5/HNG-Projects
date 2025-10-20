const { createString, filterByNLP, getString, getAllStrings, deleteString } = require("../controller/stringController")

const router = require("express").Router()


router.post('/', createString)
router.get('/', getAllStrings)
router.get('/filter-by-natural-language', filterByNLP)
router.get('/:stringValue', getString)
router.delete('/:stringValue', deleteString)


module.exports = router