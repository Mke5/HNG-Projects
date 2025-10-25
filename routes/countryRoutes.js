const express = require("express")
const {
  refreshCountries,
  getCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
  getSummaryImage
} = require('../controller/countryController');

const router = express.Router();

router.post('/countries/refresh', refreshCountries);
router.get('/countries', getCountries);
router.get('/status', getStatus);
router.get('/countries/image', getSummaryImage);
router.get('/countries/:name', getCountryByName);
router.delete('/countries/:name', deleteCountry);


module.exports = router;
