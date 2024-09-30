//declare variables to hold HTML elements
const button = document.getElementById("convert_button")
const currencyFrom = document.getElementById("currency_from")
const currencyTo = document.getElementById("currency_to")
const amount = document.getElementById("amount")
const userId = document.getElementById("userid")
const resultElement = document.getElementById("conversion_result")
const conversionRateElement = document.getElementById("conversion_rate")
const conversionTimeElement = document.getElementById("conversion_time")
//Set API key fom the currency converter provider (gotten from the currency converter API link)
const apiKey = 'c50ca59ab4a6fbf8a8525554'

//listen to button click event
button.addEventListener('click', async () => {
    //set the UI button text
    button.innerText = 'Converting...'
    const fromCurrency = currencyFrom.value
    const toCurrency = currencyTo.value
    const amountToConvert = amount.value

    //make request to convert currency API
    const request = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}/${amountToConvert}`)
    const data = await request.json()
    const convertedAmount = data.conversion_result

    //display the converted amount
    resultElement.innerText = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: toCurrency
    }).format(convertedAmount)
    conversionRateElement.innerText = `1 ${fromCurrency} = ${toCurrency} ${data.conversion_rate}`
    conversionTimeElement.innerText = `Converted at ${data.time_last_update_utc}`
    button.innerText = 'Convert'

    //save to database via backend API
    const userRequest = await fetch(`http://localhost:3000/users/save-conversion`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: Number(userId.innerText),
            currencyFrom: fromCurrency,
            currencyTo: toCurrency,
            amount: amountToConvert,
            convertedAmount
        })
    })
   await userRequest.json();
})