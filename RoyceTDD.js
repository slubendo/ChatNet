const axios = require("axios");
const apiUrl = "";

// Send test request to API

const validateApiConnection = (apiUrl) => {
  axios
    .get(apiUrl)
    .then((response) => {
      if (response.status === 200) {
        console.log("API connection successful");
        return true;
      } else {
        console.log("API connection failed");
        return false;
      }
    })
    .catch((error) => console.error(error));
};

validateApiConnection(apiUrl);

// Brett Comment: Since you have not setup your chatGPT account to get the api keys this code is good for now

// Stephane Comment: This is a good start for when we need to test that the api is connecting successfully

// Alice Comment: This will be useful once we need we integrate the chatGPT api
