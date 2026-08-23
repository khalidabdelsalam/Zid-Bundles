require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Import Routes
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Zid Bundles API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
