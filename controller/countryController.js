// const Country = require('../models/Country.js');
const { fetchCountries, fetchCountrieExchangerates } = require('../services/countryService.js');
const  computeEstimatedGDP  = require('../utils/countriesUtils.js');
const fs = require('fs');
const generateSummaryImage = require('../utils/imageGenerator.js');
const { getPool } = require('../config/db.js');

// let pool;
// pool = getPool()
let lastRefreshedAt = null;

const refreshCountries = async (req, res) => {
    let pool;
    try {
        pool = getPool(); 
    } catch (e) {
        // If the pool isn't ready, return a 500 error gracefully
        return res.status(500).json({ error: 'Database not initialized' });
    }
    console.log(pool)
    if (!pool) return res.status(500).json({ error: 'Database not initialized' })
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

            // await Country.findOneAndUpdate({ name: new RegExp(`^${country.name}$`, 'i') }, data, { upsert: true, new: true });

            const sql = `
                INSERT INTO countries (
                    name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    capital=VALUES(capital), region=VALUES(region), population=VALUES(population), 
                    currency_code=VALUES(currency_code), exchange_rate=VALUES(exchange_rate), 
                    estimated_gdp=VALUES(estimated_gdp), flag_url=VALUES(flag_url), last_refreshed_at=VALUES(last_refreshed_at);
            `;

            const values = Object.values(data);
            await pool.query(sql, values);
        });

        await Promise.all(ops);

        // const allCountries = await Country.find();
        const [allCountriesRows]  = await pool.query('SELECT * FROM countries');
        const allCountries = allCountriesRows
        lastRefreshedAt = new Date().toISOString()
        await generateSummaryImage(allCountries, lastRefreshedAt);

        res.json({ message: 'Countries refreshed successfully', total: allCountries.length, last_refreshed_at: lastRefreshedAt });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error',});
    }
};

const getCountries = async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not initialized' })
    try {
        const { region, currency, sort } = req.query;
        const params = [];
        const conditions = [];
        // const query = {};
        // if (region) query.region = region;
        // if (currency) query.currency_code = currency;

        // let sortOpt = {};
        // if (sort === 'gdp_desc') sortOpt.estimated_gdp = -1;

        // const countries = await Country.find(query).sort(sortOpt);
        if (region) {
            conditions.push('region = ?');
            params.push(region);
        }
        if (currency) {
            conditions.push('currency_code = ?');
            params.push(currency);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        if (sort === 'gdp_desc') {
            sql += ' ORDER BY estimated_gdp DESC';
        } else {
            sql += ' ORDER BY name ASC';
        }

        const [countries] = await pool.query(sql, params);

        res.json(countries);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

 const getCountryByName = async (req, res) => {
    try{   
        if (!pool) return res.status(500).json({ error: 'Database not initialized' })
        const name = req.params.name;
        // const country = await Country.findOne({ name: new RegExp(`^${name}$`, 'i') });
        const [row] = await await pool.query('SELECT * FROM countries WHERE name LIKE ? LIMIT 1', [name]);
        const country = row[0]
        if (!country) return res.status(404).json({ error: 'Country not found' });
        res.json(country);
    }catch(error){
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

 const deleteCountry = async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not initialized' });
    try{
        const name = req.params.name;
        // const country = await Country.findOneAndDelete({ name: new RegExp(`^${name}$`, 'i') });
        const [result] = await pool.query('DELETE FROM countries WHERE name = ?', [name]);

        // if (!country) return res.status(404).json({ error: 'Country not found' });
        if (result.affectedRows === 0) 
            return res.status(404).json({ error: 'Country not found' })

        res.json({ message: `${name} deleted successfully` });
    }catch(error){
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

 const getStatus = async (req, res) => {
    if (!pool) return res.status(500).json({ error: 'Database not initialized' });
    try{
        // const total = await Country.countDocuments();
        const [rows] = await pool.query('SELECT COUNT(*) AS total FROM countries');
        const total = rows[0].total;
        res.json({
            total_countries: total,
            last_refreshed_at: lastRefreshedAt,
        });

    }catch(error){
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
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