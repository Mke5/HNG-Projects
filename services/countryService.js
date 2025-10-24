import axios from "axios";

const fetchCountries = async () => {
    const url = ' https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'
    const res = await axios.get(url, { timeout: 10000})
    return res.data
}


const fetchCountrieExchangerates = async () => {
    const url = ' https://open.er-api.com/v6/latest/USD'
    const res = await axios.get(url, {timeout: 10000})
    return res.data.rates
}

module.exports = {
    fetchCountries,
    fetchCountrieExchangerates
}