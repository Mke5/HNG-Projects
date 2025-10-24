import Country from '../models/Country.js';
import { fetchCountries, fetchExchangeRates } from '../services/externalService.js';
import { computeEstimatedGDP } from '../utils/helpers.js';
import { generateSummaryImage } from '../utils/imageGenerator.js';
import fs from 'fs';
import moment from 'moment';

let lastRefreshedAt = null;

export const refreshCountries = async (req, res) => {
    try {
        const [countriesData, rates] = await Promise.all([
        fetchCountries(),
        fetchExchangeRates()
        ]);

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
                estimated_gdp: estimatedGDP,
                flag_url: country.flag || null,
                last_refreshed_at: new Date()
            };

            await Country.findOneAndUpdate({ name: new RegExp(`^${country.name}$`, 'i') }, data, { upsert: true, new: true });
        });

        await Promise.all(ops);

        const allCountries = await Country.find();
        lastRefreshedAt = new Date();
        await generateSummaryImage(allCountries, lastRefreshedAt);

        res.json({ message: 'Countries refreshed successfully', total: allCountries.length, last_refreshed_at: lastRefreshedAt });
    } catch (err) {
        console.error(err.message);
        res.status(503).json({ error: 'External data source unavailable', details: err.message });
    }
};

export const getCountries = async (req, res) => {
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

export const getCountryByName = async (req, res) => {
    const name = req.params.name;
    const country = await Country.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json(country);
};

export const deleteCountry = async (req, res) => {
    const name = req.params.name;
    const country = await Country.findOneAndDelete({ name: new RegExp(`^${name}$`, 'i') });
    if (!country) return res.status(404).json({ error: 'Country not found' });
    res.json({ message: `${name} deleted successfully` });
};

export const getStatus = async (req, res) => {
    const total = await Country.countDocuments();
    res.json({
        total_countries: total,
        last_refreshed_at: lastRefreshedAt ? moment(lastRefreshedAt).utc().format() : null
    });
};

export const getSummaryImage = async (req, res) => {
    const file = 'cache/summary.png';
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Summary image not found' });
    res.sendFile(process.cwd() + '/' + file);
};
