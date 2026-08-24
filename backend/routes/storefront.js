const express = require('express');
const supabase = require('../supabase');
const router = express.Router();
const cors = require('cors');

// Enable CORS for all storefront requests so the widget can hit this endpoint from any Zid store domain
router.use(cors());

// 1. Fetch Active Bundles for a specific product
// Example usage: GET /api/storefront/bundles?store_id=3222098&product_id=e704eb8a-c637-4d76-8800-47b2c019dae4
router.get('/bundles', async (req, res) => {
    const { store_id, product_id } = req.query;

    if (!store_id || !product_id) {
        return res.status(400).json({ error: 'store_id and product_id are required' });
    }

    try {
        // Query Supabase for any bundles where this product is the target
        const { data: bundles, error } = await supabase
            .from('bundles')
            .select('*')
            .eq('store_id', store_id)
            .contains('target_product_ids', [product_id]);

        if (error) {
            console.error('Supabase Query Error:', error);
            return res.status(500).json({ error: 'Failed to fetch bundles' });
        }

        res.json({ success: true, data: bundles });
    } catch (error) {
        console.error('Storefront API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
