const express = require('express');
const axios = require('axios');
const { getValidAccessToken } = require('../utils/zidAuth');
const router = express.Router();

const ZID_API_URL = 'https://api.zid.sa/v1';

// Middleware to inject access token into request
async function zidAuthMiddleware(req, res, next) {
    const storeId = req.headers['x-store-id'] || req.query.store_id;
    if (!storeId) {
        return res.status(400).json({ error: 'store_id is required' });
    }

    try {
        const combinedToken = await getValidAccessToken(storeId);
        
        // Split the combined token we saved in auth.js
        const tokenParts = combinedToken.split(':::');
        const authToken = tokenParts[0];
        const managerToken = tokenParts[1] || tokenParts[0];

        req.zidHeaders = {
            'Authorization': `Bearer ${authToken}`,
            'X-Manager-Token': managerToken,
            'STORE-ID': storeId,
            'Role': 'Manager',
            'Accept': 'application/json',
            'Accept-Language': 'en'
        };
        next();
    } catch (error) {
        console.error('Middleware Auth Error:', error.message);
        res.status(401).json({ error: 'Failed to authenticate with Zid. Please reinstall the app.' });
    }
}

// 1. Fetch Products
router.get('/products', zidAuthMiddleware, async (req, res) => {
    try {
        const response = await axios.get(`${ZID_API_URL}/products`, {
            headers: req.zidHeaders
        });
        res.json(response.data);
    } catch (error) {
        console.error('Fetch Products Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch products from Zid' });
    }
});

// 2. Fetch Active Bundles (Discount Rules with code=bundle_offer)
router.get('/', zidAuthMiddleware, async (req, res) => {
    try {
        const response = await axios.get(`${ZID_API_URL}/managers/store/discounts`, {
            headers: req.zidHeaders
        });
        
        // Filter out only the ones created as bundle offers by our app
        const bundles = (response.data.discount_rules || []).filter(rule => rule.code === 'bundle_offer');
        res.json({ data: bundles });
    } catch (error) {
        console.error('Fetch Bundles Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch bundles' });
    }
});

// 3. Create a New Bundle
router.post('/', zidAuthMiddleware, async (req, res) => {
    const { name, targetProductIds, triggerQuantity, discountPercentage, rewardProductIds, rewardQuantity } = req.body;

    if (!name || !targetProductIds || targetProductIds.length === 0) {
        return res.status(400).json({ error: 'Name and target products are required' });
    }

    const payload = {
        name: { en: name, ar: name },
        code: 'bundle_offer',
        conditions: [
            {
                field: 'products_quantity',
                value: triggerQuantity || 1,
                operator: '>=',
                product_ids: targetProductIds
            }
        ],
        actions: [
            {
                type: 'percentage',
                field: 'products',
                value: discountPercentage || 100, // Default to 100% off (Buy X get Y free)
                product_ids: rewardProductIds || targetProductIds,
                products_quantity: rewardQuantity || 1
            }
        ],
        conditions_criteria: 'all'
    };

    try {
        const response = await axios.post(`${ZID_API_URL}/managers/store/discounts`, payload, {
            headers: req.zidHeaders
        });
        res.json(response.data);
    } catch (error) {
        console.error('Create Bundle Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create bundle in Zid' });
    }
});

// 4. Delete a Bundle
router.delete('/:id', zidAuthMiddleware, async (req, res) => {
    try {
        const response = await axios.delete(`${ZID_API_URL}/managers/store/discounts/${req.params.id}`, {
            headers: req.zidHeaders
        });
        res.json({ success: true, message: 'Bundle deleted' });
    } catch (error) {
        console.error('Delete Bundle Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to delete bundle' });
    }
});

module.exports = router;
