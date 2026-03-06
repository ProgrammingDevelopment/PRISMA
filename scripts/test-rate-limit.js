const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/chat/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const makeRequest = (i) => {
    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve(`Request ${i}: Status ${res.statusCode} - ${data}`);
            });
        });

        req.on('error', (e) => {
            resolve(`Request ${i}: Error: ${e.message}`);
        });

        req.write(JSON.stringify({ message: 'hello' }));
        req.end();
    });
};

async function testRateLimit() {
    console.log('Sending 12 requests in parallel...');
    const promises = [];
    for (let i = 1; i <= 12; i++) {
        promises.push(makeRequest(i));
    }
    const results = await Promise.all(promises);
    results.forEach(r => console.log(r));
}

testRateLimit();
