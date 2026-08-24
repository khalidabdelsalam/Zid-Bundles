const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase credentials in environment variables.");
}

// Assign to global just in case
global.WebSocket = WebSocket;

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    realtime: {
        transport: WebSocket
    },
    global: { WebSocket }
});

module.exports = supabase;
