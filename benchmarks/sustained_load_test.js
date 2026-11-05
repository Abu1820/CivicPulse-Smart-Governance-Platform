const http = require('http');
const { performance } = require('perf_hooks');

const BASE_HOST = 'localhost';
const BASE_PORT = 8080;

// Reusable HTTP Keep-Alive Agent to avoid TCP ephemeral port exhaustion
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 1000,
  maxFreeSockets: 200,
  timeout: 10000
});

async function loginAdmin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email: 'admin@civicpulse.com', password: 'admin123' });
    const req = http.request({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      agent
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.token);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function makeGetRequest(token, path) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const req = http.request({
      hostname: BASE_HOST,
      port: BASE_PORT,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      agent,
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const t1 = performance.now();
        resolve({
          status: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          latency: t1 - t0
        });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 408, ok: false, latency: performance.now() - t0, error: 'TIMEOUT' });
    });
    req.on('error', (err) => {
      resolve({ status: 500, ok: false, latency: performance.now() - t0, error: err.code || err.message });
    });
    req.end();
  });
}

async function runSustainedLoad(concurrency, durationSec, token, endpoint = '/api/issues') {
  console.log(`\n===============================================================`);
  console.log(`Starting Sustained Test: ${concurrency} VUs for ${durationSec}s on ${endpoint}`);
  console.log(`===============================================================`);

  const latencies = [];
  const errorCounts = {};
  let totalRequests = 0;
  let successRequests = 0;
  let failedRequests = 0;

  const startTime = performance.now();
  const endTime = startTime + (durationSec * 1000);

  // Virtual User worker function
  async function virtualUser(id) {
    while (performance.now() < endTime) {
      totalRequests++;
      const result = await makeGetRequest(token, endpoint);
      if (result.ok) {
        successRequests++;
        latencies.push(result.latency);
      } else {
        failedRequests++;
        const errKey = result.error || `HTTP_${result.status}`;
        errorCounts[errKey] = (errorCounts[errKey] || 0) + 1;
      }
      // Small 10ms think-time between loops
      await new Promise(r => setTimeout(r, 10));
    }
  }

  // Launch virtual users concurrently
  const vuPromises = [];
  for (let i = 0; i < concurrency; i++) {
    vuPromises.push(virtualUser(i));
  }

  await Promise.all(vuPromises);
  const totalDurationMs = performance.now() - startTime;
  const durationSecActual = totalDurationMs / 1000;

  latencies.sort((a, b) => a - b);
  const avg = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const min = latencies.length ? latencies[0] : 0;
  const max = latencies.length ? latencies[latencies.length - 1] : 0;
  const p50 = latencies.length ? latencies[Math.floor(latencies.length * 0.50)] : 0;
  const p95 = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] : 0;
  const p99 = latencies.length ? latencies[Math.floor(latencies.length * 0.99)] : 0;
  const rps = (totalRequests / durationSecActual).toFixed(1);
  const failPct = ((failedRequests / (totalRequests || 1)) * 100).toFixed(2);

  const summary = {
    concurrency,
    targetDurationSec: durationSec,
    actualDurationSec: durationSecActual.toFixed(1),
    totalRequests,
    successRequests,
    failedRequests,
    failureRate: `${failPct}%`,
    throughputRps: rps,
    latenciesMs: {
      min: min.toFixed(1),
      avg: avg.toFixed(1),
      p50: p50.toFixed(1),
      p95: p95.toFixed(1),
      p99: p99.toFixed(1),
      max: max.toFixed(1)
    },
    errorBreakdown: errorCounts
  };

  console.log(`Results: ${totalRequests} reqs in ${durationSecActual.toFixed(1)}s (${rps} req/s)`);
  console.log(`Success: ${successRequests} | Failed: ${failedRequests} (${failPct}%)`);
  console.log(`Latency -> Min: ${summary.latenciesMs.min}ms | Avg: ${summary.latenciesMs.avg}ms | p95: ${summary.latenciesMs.p95}ms | p99: ${summary.latenciesMs.p99}ms | Max: ${summary.latenciesMs.max}ms`);
  if (failedRequests > 0) {
    console.log(`Errors:`, errorCounts);
  }

  return summary;
}

async function main() {
  const token = await loginAdmin();
  console.log("[SETUP] Token acquired.");

  // Run preliminary test at 100 VUs for 30s to gauge health and stability
  const res100_30s = await runSustainedLoad(100, 30, token);
  
  // Run 200 VUs for 30s
  const res200_30s = await runSustainedLoad(200, 30, token);
  
  // Run 500 VUs for 30s to determine saturation / failure boundary
  const res500_30s = await runSustainedLoad(500, 30, token);

  console.log("\n===============================================================");
  console.log("FINAL SUSTAINED TEST DATA:");
  console.log(JSON.stringify({ res100_30s, res200_30s, res500_30s }, null, 2));
}

main().catch(console.error);
