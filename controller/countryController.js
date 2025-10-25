const Country = require('../models/Country.js');
const { fetchCountries, fetchCountrieExchangerates } = require('../services/countryService.js');
const  computeEstimatedGDP  = require('../utils/countriesUtils.js');
// const { generateSummaryImage } = require('../utils/imageGenerator.js');
const fs = require('fs');
const generateSummaryImage = require('../utils/imageGenerator.js');
// import moment from 'moment';

let lastRefreshedAt = null;

const refreshCountries = async (req, res) => {
    try {
        const [countriesData, rates] = await Promise.all([
            fetchCountries(),
            fetchCountrieExchangerates()
        ]);

        if(!countriesData)
            return res.status(503).json({ "error": "External data source unavailable", "details": "Could not fetch data from https://restcountries.com/" })

        const ops = countriesData.map(async (country) => {
            const currency = country.currencies && country.currencies.length > 0 ? country.currencies[0].code : null;
            const exchangeRate = currency && rates[currency] ? rates[currency] : null;
            const estimatedGDP = exchangeRate ? computeEstimatedGDP(country.population, exchangeRate) : 0;

            const data = {
                name: country.name,
                capital: country.capital || null,
                region: country.region || null,
                population: country.population,
                currency_code: currency,
                exchange_rate: exchangeRate,
                estimated_gdp: Number(estimatedGDP),
                flag_url: country.flag || null,
                last_refreshed_at: new Date().toISOString()
            };

            await Country.findOneAndUpdate({ name: new RegExp(`^${country.name}$`, 'i') }, data, { upsert: true, new: true });
        });

        await Promise.all(ops);

        const allCountries = await Country.find();
        lastRefreshedAt = new Date().toISOString();
        await generateSummaryImage(allCountries, lastRefreshedAt);

        res.json({ message: 'Countries refreshed successfully', total: allCountries.length, last_refreshed_at: lastRefreshedAt });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error',});
    }
};

const getCountries = async (req, res) => {
    try {
        const { region, currency, sort } = req.query;
        const query = {};
        if (region) query.region = region;
        if (currency) query.currency_code = currency;

        let sortOpt = {};
        if (sort === 'gdp_desc') sortOpt.estimated_gdp = -1;

        const countries = await Country.find(query).sort(sortOpt);

        res.json(countries);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

 const getCountryByName = async (req, res) => {
    const name = req.params.name;
    const country = await Country.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json(country);
};

 const deleteCountry = async (req, res) => {
    const name = req.params.name;
    const country = await Country.findOneAndDelete({ name: new RegExp(`^${name}$`, 'i') });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json({ message: `${name} deleted successfully` });
};

 const getStatus = async (req, res) => {
    const total = await Country.countDocuments();
    res.json({
        total_countries: total,
        last_refreshed_at: lastRefreshedAt,
    });
};

 const getSummaryImage = async (req, res) => {
    const file = 'cache/summary.png';
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Summary image not found' });
    res.sendFile(process.cwd() + '/' + file);
};


module.exports = {
    refreshCountries,
    getCountries,
    getCountryByName,
    deleteCountry,
    getStatus,
    getSummaryImage
}