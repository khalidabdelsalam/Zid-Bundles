const { spawn } = require('child_process');

const mcpProcess = spawn('npx.cmd', ['-y', 'zid-open-apis-mcp'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
});

let messageId = 1;

function sendMessage(message) {
    const json = JSON.stringify(message);
    mcpProcess.stdin.write(json + '\n');
}

let buffer = '';

mcpProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    const parts = buffer.split('\n');
    buffer = parts.pop(); // Keep the last incomplete part

    for (const part of parts) {
        if (!part.trim()) continue;
        try {
            const response = JSON.parse(part);
            if (response.id === 1) { // Initialization response
                sendMessage({
                    jsonrpc: '2.0',
                    id: 2,
                    method: 'tools/call',
                    params: {
                        name: 'fetch_api_documentation',
                        arguments: {}
                    }
                });
            } else if (response.id === 2) {
                const fs = require('fs');
                if (response.result && response.result.content && response.result.content.length > 0) {
                    fs.writeFileSync('docs.json', response.result.content[0].text);
                } else {
                    fs.writeFileSync('docs.json', JSON.stringify(response, null, 2));
                }
                console.log("Saved to docs.json");
                process.exit(0);
            }
        } catch (e) {
            console.error('Error parsing:', part);
        }
    }
});

sendMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
            name: 'test-client',
            version: '1.0.0'
        }
    }
});
