const axios = require('axios');

async function debugRealProducts() {
  const api = axios.create({ 
    baseURL: 'https://staging.dokan.com.sy',
    validateStatus: () => true 
  });

  console.log("--- DEBUGGING REAL PRODUCTS SYNC (ARRAY FORMAT) ---");

  // 1. Get Session
  console.log("1. Fetching Cart to get Nonce & Token...");
  const cartRes = await api.get('/wp-json/wc/store/v1/cart');
  const nonce = cartRes.headers['nonce'] || cartRes.headers['x-wc-store-api-nonce'];
  const cartToken = cartRes.headers['cart-token'];
  console.log("Nonce:", nonce);
  console.log("Cart-Token:", cartToken);

  const testCases = [
    { id: 28504, variation: [{ "attribute": "size", "value": "M" }] }, 
    { id: 28502, variation: [{ "attribute": "color", "value": "Blue" }] }
  ];

  for (const test of testCases) {
    console.log(`\n2. Trying to add REAL product ${test.id}...`);
    const addRes = await api.post(
      '/wp-json/wc/store/v1/cart/add-item',
      { id: test.id, quantity: 1, variation: test.variation },
      {
        headers: {
          'Nonce': nonce,
          'X-WC-Store-API-Nonce': nonce,
          'Cart-Token': cartToken,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`Product ${test.id} Status:`, addRes.status);
    console.log(`Product ${test.id} Response:`, JSON.stringify(addRes.data, null, 2));
  }
}

debugRealProducts();
