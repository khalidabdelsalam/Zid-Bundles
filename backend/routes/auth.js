const express = require('express');
const axios = require('axios');
const supabase = require('../supabase');
const router = express.Router();

const ZID_CLIENT_ID = process.env.ZID_CLIENT_ID;
const ZID_CLIENT_SECRET = process.env.ZID_CLIENT_SECRET;
const ZID_REDIRECT_URI = process.env.ZID_REDIRECT_URI;
const ZID_OAUTH_URL = 'https://oauth.zid.sa';
const ZID_API_URL = 'https://api.zid.sa/v1';

// 1. Redirect to Zid OAuth
router.get('/install', (req, res) => {
    const authUrl = `${ZID_OAUTH_URL}/oauth/authorize?client_id=${ZID_CLIENT_ID}&redirect_uri=${ZID_REDIRECT_URI}&response_type=code`;
    res.redirect(authUrl);
});

// 2. Handle Callback
router.get('/callback', async (req, res) => {
    console.log("--- ZID CALLBACK HIT ---");
    console.log("URL:", req.originalUrl);
    console.log("QUERY:", req.query);
    console.log("BODY:", req.body);

    // Try to get code from query or body just in case
    const code = req.query.code || (req.body && req.body.code);
    
    if (!code) {
        return res.status(400).send(`Missing authorization code.<br><br>Debug Info:<br>URL: ${req.originalUrl}<br>Query: ${JSON.stringify(req.query)}<br>Body: ${JSON.stringify(req.body)}`);
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await axios.post(`${ZID_OAUTH_URL}/oauth/token`, {
            grant_type: 'authorization_code',
            client_id: ZID_CLIENT_ID,
            client_secret: ZID_CLIENT_SECRET,
            redirect_uri: ZID_REDIRECT_URI,
            code: code
        });

        console.log("--- FULL TOKEN RESPONSE ---");
        console.log(JSON.stringify(tokenResponse.data, null, 2));

        const { access_token, authorization, refresh_token, expires_in } = tokenResponse.data;

        // Decode the Zid JWT token to get the store_id (it's in the 'sub' claim)
        const jwtPayload = JSON.parse(Buffer.from(authorization.split('.')[1], 'base64').toString());
        const store_id = jwtPayload.sub;

        if (!store_id) {
            throw new Error("Could not extract store_id from Zid authorization token.");
        }

        const token_expires_at = new Date(Date.now() + (expires_in * 1000)).toISOString();

        // Combine both tokens because Zid APIs require both the JWT and the opaque access token
        const combined_token = `${authorization}:::${access_token}`;

        // 3. Save to Supabase
        const { error } = await supabase
            .from('merchants')
            .upsert({ 
                store_id: store_id.toString(), 
                access_token: combined_token, 
                refresh_token,
                token_expires_at,
                updated_at: new Date().toISOString()
            }, { onConflict: 'store_id' });

        if (error) {
            console.error('Supabase Error:', error);
            throw new Error('Failed to save merchant data');
        }

        // Redirect to Frontend Dashboard with the store_id so the UI knows who authenticated
        // Using a relative redirect so it works on both localhost (if proxying) and production domain
        res.redirect(`/?store_id=${store_id}&status=installed`);
    } catch (error) {
        console.error('OAuth Error:', error.response?.data || error.message);
        res.status(500).send('Authentication failed. Please try again.');
    }
});

module.exports = router;
