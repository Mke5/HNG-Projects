const crypto = require("crypto")


async function computeProperties(value){
    const length = value.length
    const normalise = value.toLowerCase().replace(/\s+/g, "")
    const is_palindrome = normalise === normalise.split("").reverse().join("")
    const unique_characters = new Set(value).size
    const word_count = value.trim().split(/\s+/).length
    const  sha256_hash = await crypto.createHash('sha256').update(value).digest('hex')


    const character_frequency_map = {}
    for(const char of value){
        character_frequency_map[char] = (character_frequency_map[char] || 0) + 1
    }

    return {
        length,
        is_palindrome,
        unique_characters,
        word_count,
        sha256_hash,
        character_frequency_map
    }
}


module.exports = {
    computeProperties
}