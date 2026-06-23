const https = require('https');

function test(options, postData = null) {
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data.slice(0, 1000)
        });
      });
    });
    req.on('error', (e) => {
      resolve({ error: e.message });
    });
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function run() {
  // Test 1: GET with apikey query param
  console.log("--- TEST 1: GET with query param ---");
  const r1 = await test({
    hostname: 'api.neoxr.eu',
    path: '/run/Q2hhdCBHUFQtNA==?q=hello&apikey=3ch2qm',
    method: 'GET'
  });
  console.log("Status:", r1.status);
  console.log("Headers:", r1.headers['content-type']);
  console.log("Data snippet:", r1.data ? r1.data.slice(0, 300) : "null");

  // Test 2: POST with apikey and q in body JSON
  console.log("--- TEST 2: POST with JSON body ---");
  const postBody = JSON.stringify({ q: 'hello', apikey: '3ch2qm' });
  const r2 = await test({
    hostname: 'api.neoxr.eu',
    path: '/run/Q2hhdCBHUFQtNA==',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postBody)
    }
  }, postBody);
  console.log("Status:", r2.status);
  console.log("Headers:", r2.headers['content-type']);
  console.log("Data snippet:", r2.data ? r2.data.slice(0, 300) : "null");

  // Test 3: GET with key header
  console.log("--- TEST 3: GET with header ---");
  const r3 = await test({
    hostname: 'api.neoxr.eu',
    path: '/run/Q2hhdCBHUFQtNA==?q=hello',
    method: 'GET',
    headers: {
      'apikey': '3ch2qm'
    }
  });
  console.log("Status:", r3.status);
  console.log("Headers:", r3.headers['content-type']);
  console.log("Data snippet:", r3.data ? r3.data.slice(0, 300) : "null");
}

run();