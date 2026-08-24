require('dotenv').config({ path: '.env', override: true });
const supabase = require('./supabase');
const axios = require('axios');

async function testZidApiDiscounts() {
    const realStoreId = '3222098'; // The one we found from the profile!

    const { data: merchant } = await supabase
        .from('merchants')
        .select('*')
        .eq('store_id', '3289340') // It's still stored under the old user_id in DB currently
        .single();
        
    const combinedToken = merchant.access_token;
    const [jwt, opaque] = combinedToken.split(':::');
    
    console.log("Testing discounts with REAL Store ID...");
    
    const ep = 'https://api.zid.sa/v1/managers/store/discounts';
    
    const h = { 'Authorization': `Bearer ${jwt}`, 'X-MANAGER-TOKEN': opaque, 'STORE-ID': realStoreId, 'Role': 'Manager', 'Accept': 'application/json' };
    
    console.log(`\n--- Testing ${ep} ---`);
    try {
        const res = await axios.get(ep, { headers: h });
        console.log("SUCCESS!", Object.keys(res.data));
        if (res.data.data) console.log("Items:", res.data.data.length);
        if (res.data.results) console.log("Items:", res.data.results.length);
    } catch (e) {
        console.log("FAILED:", e.response?.status, e.response?.data);
    }
}

testZidApiDiscounts();
