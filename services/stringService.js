const { computeProperties } = require("../utils/stringUtils")


const db = new Map()

async function ananlyseAndStore(value){
    const properties = await computeProperties(value)
    console.log("Services: ", properties)
    const id = properties.sha256_hash

    if(db.has(id))
        throw new Error("String already exists")

    const data = {
        id,
        value,
        properties: properties,
        create_at: new Date().toISOString()
    }

    db.set(id, data)

    return data
}

async function getString(value){
    const {sha256_hash} = await computeProperties(value)
    return db.get(sha256_hash)
}

async function deleteString(value){
    const { sha256_hash } = await computeProperties(value)
    return db.delete(sha256_hash)
}

async function searchString(query){
    const {
        is_palindrome,
        min_length,
        max_length,
        word_count,
        contains_character
    } = query

    let results = Array.from(db.values())

    if(is_palindrome !== undefined)
        results = results.filter(str => str.properties.is_palindrome === (is_palindrome === true))
    if(min_length)
        results = results.filter(str => str.properties.length >= parseInt(min_length))
    if(max_length)
        results = results.filter(str => str.properties.length <= parseInt(max_length))
    if(word_count)
        results = results.filter(str => str.properties.word_count === parseInt(word_count))
    if(contains_character)
        results = results.filter(str => str.value.includes(contains_character))

    return {
        data: results,
        count: results.length,
        filters_applied: query
    }
}

async function filter(query) {
    const parsed_filters= {}
    const q = query.toLowerCase

    if(q.includes('palindromic'))
        parsed_filters.is_palindrome = true
    if(q.includes('single word'))
        parsed_filters.word_count = 1
    if (q.includes('containing the letter')) {
        const match = q.match(/letter (\w)/);
        if (match) 
            parsed_filters.contains_character = match[1];
    }
    if (q.includes('longer than')) {
        const match = q.match(/longer than (\d+)/);
        if (match) 
            parsed_filters.min_length = parseInt(match[1]) + 1;
    }

    if (Object.keys(parsed_filters).length === 0) return null;

    const filtered = searchString(parsed_filters)

    return {
        ...filtered,
        interpreted_query: {
            original: query,
            parsed_filters
        }
    }
}


module.exports = {
    ananlyseAndStore,
    getString,
    deleteString,
    searchString,
    filter
}