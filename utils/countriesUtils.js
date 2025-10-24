const computeEstimatedGDP = async (population, exchangeRates) => {
    if(!population || !exchangeRates)
        return 0

    const randomFactor = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000
    return (population * randomFactor) / exchangeRates
}