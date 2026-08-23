import axios from 'axios';

// Get store_id from URL if present
const urlParams = new URLSearchParams(window.location.search);
const urlStoreId = urlParams.get('store_id');
if (urlStoreId) {
    localStorage.setItem('zid_store_id', urlStoreId);
}

// Ensure subsequent API calls have the store ID
const storeId = localStorage.getItem('zid_store_id');

const api = axios.create({
    baseURL: '/api',
    headers: {
        'x-store-id': storeId
    }
});

// Intercept to dynamically inject storeId if it changes
api.interceptors.request.use((config) => {
    const latestStoreId = localStorage.getItem('zid_store_id');
    if (latestStoreId) {
        config.headers['x-store-id'] = latestStoreId;
    }
    return config;
});

export default api;
