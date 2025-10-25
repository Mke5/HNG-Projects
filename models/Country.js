const mongoose = require("mongoose");


const countrySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    capital: String,
    region: String,
    population: { type: Number, required: true },
    currency_code: { type: String },
    exchange_rate: { type: Number },
    estimated_gdp: { type: Number },
    flag_url: String,
    last_refreshed_at: Date
});

module.exports = mongoose.model('Country', countrySchema)