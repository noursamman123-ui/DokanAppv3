const axios = require('axios');

async function testCart() {
  const api = axios.create({ 
    baseURL: 'https://staging.dokan.com.sy',
    validateStatus: () => true 
  });

  console.log("1. Fetching Cart to get Nonce & Token...");
  const cartRes = await api.get('/wp-json/wc/store/v1/cart');
  
  const nonce = cartRes.headers['nonce'] || cartRes.headers['x-wc-store-api-nonce'];
  const cartToken = cartRes.headers['cart-token'];
  
  console.log("Nonce:", nonce);
  console.log("Cart-Token:", cartToken);

  console.log("\n2. Trying to add product 201...");
  const addRes = await api.post(
    '/wp-json/wc/store/v1/cart/add-item',
    { id: 201, quantity: 1 },
    {
      headers: {
        'Nonce': nonce,
        'X-WC-Store-API-Nonce': nonce,
        'Cart-Token': cartToken
      }
    }
  );

  console.log("Status:", addRes.status);
  console.log("Response Body:", JSON.stringify(addRes.data, null, 2));
}

testCart();
