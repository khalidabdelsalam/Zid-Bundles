const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Import Routes
const authRoutes = require('./routes/auth');
const bundleRoutes = require('./routes/bundles');
const storefrontRoutes = require('./routes/storefront');

app.use(cors());
app.use(express.json());

// Serve the Storefront Widget statically
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/storefront', storefrontRoutes);

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Zid Bundles API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
