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

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bundles', bundleRoutes);

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Zid Bundles API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
