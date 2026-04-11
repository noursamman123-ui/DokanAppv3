const axios = require('axios');

async function run() {
  const BASE_URL = 'https://staging.dokan.com.sy';
  const api = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

  console.log("1. Logging in...");
  const loginRes = await api.post('/wp-json/dokan-mobile/v1/login', {
    username: 'testuser', // I will use random email or credentials, wait I dont know the user's login. 
    password: 'password'
  });
}
run();
