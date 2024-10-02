// Declare variables to hold HTML elements
const button = document.getElementById("convert_button") // Button element for converting currency
const currencyFrom = document.getElementById("currency_from") // Dropdown or input for selecting the currency to convert from
const currencyTo = document.getElementById("currency_to") // Dropdown or input for selecting the currency to convert to
const amount = document.getElementById("amount") // Input field for the amount to convert
const userId = document.getElementById("userid") // Hidden or displayed element containing the user's ID
const resultElement = document.getElementById("conversion_result") // Element to display the converted amount
const conversionRateElement = document.getElementById("conversion_rate") // Element to display the conversion rate
const conversionTimeElement = document.getElementById("conversion_time") // Element to display the time the conversion was last updated

// Set API key from the currency converter provider (gotten from the currency converter API link)
const apiKey = 'c50ca59ab4a6fbf8a8525554' // API key for accessing the currency conversion API

// Listen to button click event
button.addEventListener('click', async () => {
    // Set the UI button text to indicate the conversion is in progress
    button.innerText = 'Converting...'

    // Get the selected currencies and amount from the input fields
    const fromCurrency = currencyFrom.value
    const toCurrency = currencyTo.value
    const amountToConvert = amount.value

    // Make a request to the currency conversion API with selected values
    const request = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}/${amountToConvert}`)
    const data = await request.json() // Parse the JSON response from the API
    const convertedAmount = data.conversion_result // Extract the converted amount from the response

    // Display the converted amount in a formatted currency style
    resultElement.innerText = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: toCurrency // Use the target currency for formatting
    }).format(convertedAmount)

    // Display the conversion rate
    conversionRateElement.innerText = `1 ${fromCurrency} = ${toCurrency} ${data.conversion_rate}`

    // Display the time when the conversion rate was last updated
    conversionTimeElement.innerText = `Converted at ${data.time_last_update_utc}`

    // Reset the button text after conversion is complete
    button.innerText = 'Convert'

    // Save the conversion details to the database via the backend API
    const userRequest = await fetch(`http://localhost:3000/users/save-conversion`, {
        method: 'POST', // Use POST method to send data
        headers: {
            'Content-Type': 'application/json' // Specify that the data being sent is in JSON format
        },
        body: JSON.stringify({
            userId: Number(userId.innerText), // Convert userId to a number and include in the request body
            currencyFrom: fromCurrency, // Include the currency from which the amount is being converted
            currencyTo: toCurrency, // Include the target currency
            amount: amountToConvert, // Include the amount to be converted
            convertedAmount // Include the converted amount
        })
    })

    // Wait for the backend response after saving the conversion data
    await userRequest.json(); // Parse the backend response
})
