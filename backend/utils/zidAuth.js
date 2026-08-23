const axios = require('axios');
const supabase = require('../supabase');

const ZID_CLIENT_ID = process.env.ZID_CLIENT_ID;
const ZID_CLIENT_SECRET = process.env.ZID_CLIENT_SECRET;
const ZID_REDIRECT_URI = process.env.ZID_REDIRECT_URI;
const ZID_OAUTH_URL = 'https://oauth.zid.sa';

/**
 * Gets a valid access token for the store. Refreshes if necessary.
 */
async function getValidAccessToken(storeId) {
    // Get current token from DB
    const { data: merchant, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('store_id', storeId)
        .single();

    if (error || !merchant) {
        throw new Error('Merchant not found in database');
    }

    const { access_token, refresh_token, token_expires_at } = merchant;

    // Check if token is expired (add a 5 min buffer)
    const expiresAt = new Date(token_expires_at);
    const now = new Date();
    
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        // Token is expired or about to expire, refresh it
        try {
            const tokenResponse = await axios.post(`${ZID_OAUTH_URL}/oauth/token`, {
                grant_type: 'refresh_token',
                client_id: ZID_CLIENT_ID,
                client_secret: ZID_CLIENT_SECRET,
                redirect_uri: ZID_REDIRECT_URI,
                refresh_token: refresh_token
            });

            const newTokens = tokenResponse.data;
            const new_expires_at = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();

            await supabase
                .from('merchants')
                .update({
                    access_token: newTokens.access_token,
                    refresh_token: newTokens.refresh_token,
                    token_expires_at: new_expires_at,
                    updated_at: new Date().toISOString()
                })
                .eq('store_id', storeId);

            return newTokens.access_token;
        } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError.response?.data || refreshError.message);
            throw new Error('Failed to refresh authentication token. Merchant may need to reconnect.');
        }
    }

    return access_token;
}

module.exports = {
    getValidAccessToken
};
