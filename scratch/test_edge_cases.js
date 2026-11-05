const { performance } = require('perf_hooks');

const BASE_URL = "http://localhost:8080/api";

function logHeader(title) {
  console.log("\n" + "=".repeat(70));
  console.log(`  ${title}`);
  console.log("=".repeat(70));
}

function logResult(testNum, desc, pass, details = "") {
  const icon = pass ? "✅ PASS" : "❌ FAIL";
  console.log(`[${icon}] Test ${String(testNum).padStart(2, '0')}: ${desc}`);
  if (details) {
    console.log(`          Details: ${details}`);
  }
}

async function runEdgeCaseTests() {
  const testRunId = Date.now();
  const testResults = [];
  let ipCounter = 1;

  function getTestHeaders(token = null) {
    const headers = {
      "Content-Type": "application/json",
      "X-Forwarded-For": `192.168.10.${ipCounter++}`
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  function record(desc, passed, details) {
    const r = { test: desc, passed, details };
    testResults.push(r);
    logResult(testResults.length, desc, passed, details);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE 1: EMAIL VERIFICATION EDGE CASES
  // ─────────────────────────────────────────────────────────────
  logHeader("SUITE 1: EMAIL VERIFICATION & AUTHENTICATION EDGE CASES");

  const testEmail1 = `user_happy_${testRunId}@civicpulse.test`;
  const testEmail2 = `user_unverified_${testRunId}@civicpulse.test`;
  const testEmail3 = `user_resend_${testRunId}@civicpulse.test`;
  const testPassword = "securePassword123";

  // Test 1: Register Happy Path - Returns requiresVerification and 6-digit OTP
  let otp1 = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ name: "Happy Citizen", email: testEmail1, password: testPassword })
    });
    const data = await res.json();
    const passed = res.ok && data.success === true && data.requiresVerification === true && !!data.devVerificationCode;
    otp1 = data.devVerificationCode;
    record("Registration initiates verification flow with 6-digit OTP", passed, `Status: ${res.status}, OTP: ${otp1}, requiresVerification: ${data.requiresVerification}`);
  } catch (err) {
    record("Registration initiates verification flow with 6-digit OTP", false, err.message);
  }

  // Test 2: Unverified user cannot log in
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: testEmail1, password: testPassword })
    });
    const data = await res.json();
    const passed = data.success === false && data.requiresVerification === true && data.message.includes("verify your email");
    record("Unverified user login attempt is blocked with verification notice", passed, `Success: ${data.success}, Message: "${data.message}"`);
  } catch (err) {
    record("Unverified user login attempt is blocked with verification notice", false, err.message);
  }

  // Test 3: Verification with Wrong / Incorrect OTP Code
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: testEmail1, code: "000000" })
    });
    const data = await res.json();
    const passed = data.success === false && data.message.toLowerCase().includes("invalid");
    record("Verification with incorrect OTP is rejected with clear message", passed, `Message: "${data.message}"`);
  } catch (err) {
    record("Verification with incorrect OTP is rejected with clear message", false, err.message);
  }

  // Test 4: Verification with Malformed OTP (non-numeric / wrong length)
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: testEmail1, code: "ABC12" })
    });
    // Expected: 400 Bad Request because @Pattern(regexp = "^[0-9]{6}$")
    const passed = res.status === 400;
    record("Verification with malformed code (non-6-digit) rejected with HTTP 400", passed, `HTTP Status: ${res.status}`);
  } catch (err) {
    record("Verification with malformed code (non-6-digit) rejected with HTTP 400", false, err.message);
  }

  // Test 5: Verification with Correct OTP (Happy Path)
  let token1 = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: testEmail1, code: otp1 })
    });
    const data = await res.json();
    const passed = res.ok && data.success === true && !!data.token && data.emailVerified === true;
    token1 = data.token;
    record("Verification with valid OTP activates user & returns JWT token", passed, `Success: ${data.success}, Token present: ${!!token1}`);
  } catch (err) {
    record("Verification with valid OTP activates user & returns JWT token", false, err.message);
  }

  // Test 6: Re-verifying an already-verified user handles gracefully
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: testEmail1, code: otp1 })
    });
    const data = await res.json();
    const passed = data.success === true && (data.message.includes("already verified") || !!data.token);
    record("Verifying already-verified user returns existing active session gracefully", passed, `Message: "${data.message}"`);
  } catch (err) {
    record("Verifying already-verified user returns existing active session gracefully", false, err.message);
  }

  // Test 7: Login after email verification succeeds
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: testEmail1, password: testPassword })
    });
    const data = await res.json();
    const passed = data.success === true && !!data.token;
    record("Verified user logs in successfully with valid credentials", passed, `Token acquired: ${!!data.token}, Role: ${data.role}`);
  } catch (err) {
    record("Verified user logs in successfully with valid credentials", false, err.message);
  }

  // Test 8: Duplicate email registration is blocked
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ name: "Duplicate", email: testEmail1, password: "anotherPassword" })
    });
    const data = await res.json();
    const passed = data.success === false && data.message.includes("already exists");
    record("Duplicate email registration attempt is blocked with error", passed, `Message: "${data.message}"`);
  } catch (err) {
    record("Duplicate email registration attempt is blocked with error", false, err.message);
  }

  // Test 9: Resend Code for Unverified User generates fresh working OTP
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ name: "Resend Tester", email: testEmail3, password: testPassword })
    });
    const regData = await regRes.json();
    const initialOtp = regData.devVerificationCode;

    // Call resend-code
    const resendRes = await fetch(`${BASE_URL}/auth/resend-code`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: testEmail3 })
    });
    const resendData = await resendRes.json();
    const resendOtp = resendData.devVerificationCode;

    // Verify with the freshly resent code
    const verifyRes = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: testEmail3, code: resendOtp })
    });
    const verifyData = await verifyRes.json();

    const passed = resendRes.ok && resendData.success === true && verifyData.success === true;
    record("Resend OTP generates a new functioning verification code", passed, `Old OTP: ${initialOtp}, New OTP: ${resendOtp}`);
  } catch (err) {
    record("Resend OTP generates a new functioning verification code", false, err.message);
  }

  // Test 10: Verify Email for non-existent account
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: getTestHeaders(),
      body: JSON.stringify({ email: "ghost_nonexistent_9999@civicpulse.org", code: "123456" })
    });
    const data = await res.json();
    const passed = data.success === false && data.message.includes("not found");
    record("Verification for non-existent email safely rejected", passed, `Message: "${data.message}"`);
  } catch (err) {
    record("Verification for non-existent email safely rejected", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUITE 2: MAP & GEOLOCATION EDGE CASES
  // ─────────────────────────────────────────────────────────────
  logHeader("SUITE 2: MAP, COORDINATES & PERSISTENCE EDGE CASES");

  // Admin login for issue management
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getTestHeaders(),
    body: JSON.stringify({ email: "admin@civicpulse.com", password: "admin123" })
  });
  const adminToken = (await adminRes.json()).token;

  let createdIssueIds = [];

  // Test 11: Create Issue with Full GPS Coordinates (Latitude & Longitude)
  let issueWithCoordsId = null;
  try {
    const lat = 13.08268;
    const lon = 80.27072;
    const res = await fetch(`${BASE_URL}/issues`, {
      method: "POST",
      headers: getTestHeaders(token1),
      body: JSON.stringify({
        title: "Pothole near Central Station",
        description: "Large road cavity in middle lane",
        location: "Poonamallee High Road, Chennai",
        category: "Road",
        latitude: lat,
        longitude: lon
      })
    });
    const data = await res.json();
    issueWithCoordsId = data.id;
    if (issueWithCoordsId) createdIssueIds.push(issueWithCoordsId);

    // Verify retrieval from backend / DB
    const getRes = await fetch(`${BASE_URL}/issues/${issueWithCoordsId}`, {
      headers: getTestHeaders(token1)
    });
    const fetchedData = await getRes.json();

    const passed = res.ok && 
                   fetchedData.id === issueWithCoordsId &&
                   Math.abs(fetchedData.latitude - lat) < 0.0001 &&
                   Math.abs(fetchedData.longitude - lon) < 0.0001;

    record("Issue created with GPS coordinates persists and retrieves accurately", passed, 
      `Saved Lat: ${fetchedData.latitude}, Lon: ${fetchedData.longitude}`);
  } catch (err) {
    record("Issue created with GPS coordinates persists and retrieves accurately", false, err.message);
  }

  // Test 12: Backward Compatibility - Issue with null coordinates
  let issueWithoutCoordsId = null;
  try {
    const res = await fetch(`${BASE_URL}/issues`, {
      method: "POST",
      headers: getTestHeaders(token1),
      body: JSON.stringify({
        title: "Broken Streetlamp",
        description: "Lamp post #42 not illuminating",
        location: "T Nagar 2nd Street",
        category: "Street Light",
        latitude: null,
        longitude: null
      })
    });
    const data = await res.json();
    issueWithoutCoordsId = data.id;
    if (issueWithoutCoordsId) createdIssueIds.push(issueWithoutCoordsId);

    const getRes = await fetch(`${BASE_URL}/issues/${issueWithoutCoordsId}`, {
      headers: getTestHeaders(token1)
    });
    const fetchedData = await getRes.json();

    const passed = res.ok && fetchedData.latitude === null && fetchedData.longitude === null;
    record("Backward compatibility: Issue with null coordinates handled safely", passed, 
      `Lat: ${fetchedData.latitude}, Lon: ${fetchedData.longitude}`);
  } catch (err) {
    record("Backward compatibility: Issue with null coordinates handled safely", false, err.message);
  }

  // Test 13: Boundary & Global Coordinates (Southern Hemisphere / Negative Latitude)
  let boundaryIssueId = null;
  try {
    const southLat = -33.8688;
    const eastLon = 151.2093;
    const res = await fetch(`${BASE_URL}/issues`, {
      method: "POST",
      headers: getTestHeaders(token1),
      body: JSON.stringify({
        title: "Southern Hemisphere Boundary Test",
        description: "Verifying negative latitude coordinates",
        location: "Sydney Harbour",
        category: "Water Leakage",
        latitude: southLat,
        longitude: eastLon
      })
    });
    const data = await res.json();
    boundaryIssueId = data.id;
    if (boundaryIssueId) createdIssueIds.push(boundaryIssueId);

    const passed = res.ok && Math.abs(data.latitude - southLat) < 0.0001 && Math.abs(data.longitude - eastLon) < 0.0001;
    record("Boundary coordinates (negative latitude / southern hemisphere) preserved", passed, 
      `Stored Lat: ${data.latitude}, Lon: ${data.longitude}`);
  } catch (err) {
    record("Boundary coordinates (negative latitude / southern hemisphere) preserved", false, err.message);
  }

  // Test 14: Admin Updates Issue Location & Coordinates via PUT /api/issues/{id}
  try {
    const newLat = 13.0400;
    const newLon = 80.2500;
    const res = await fetch(`${BASE_URL}/issues/${issueWithCoordsId}`, {
      method: "PUT",
      headers: getTestHeaders(adminToken),
      body: JSON.stringify({
        title: "Pothole near Central Station (Relocated)",
        description: "Updated description after inspection",
        location: "Anna Flyover, Mount Road",
        category: "Road",
        latitude: newLat,
        longitude: newLon
      })
    });
    const data = await res.json();
    const passed = res.ok && Math.abs(data.latitude - newLat) < 0.0001 && data.location.includes("Anna Flyover");
    record("Admin update modifies coordinates and location accurately", passed, 
      `New Lat: ${data.latitude}, New Location: "${data.location}"`);
  } catch (err) {
    record("Admin update modifies coordinates and location accurately", false, err.message);
  }

  // Test 15: External Nominatim Reverse-Geocoding API Connectivity
  try {
    const lat = 13.0827;
    const lon = 80.2707;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "en", "User-Agent": "CivicPulse-App/1.0" } }
    );
    const data = await res.json();
    const passed = res.ok && (data.display_name || data.address);
    record("OpenStreetMap Nominatim reverse-geocoding API is reachable and returning address data", passed, 
      `Sample address: "${(data.display_name || '').slice(0, 50)}..."`);
  } catch (err) {
    record("OpenStreetMap Nominatim reverse-geocoding API is reachable and returning address data", false, err.message);
  }

  // ─────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────
  logHeader("TEST CLEANUP & DATA PURGE");
  console.log(`Cleaning up ${createdIssueIds.length} test issues...`);
  for (const id of createdIssueIds) {
    try {
      await fetch(`${BASE_URL}/issues/${id}`, {
        method: "DELETE",
        headers: getTestHeaders(adminToken)
      });
    } catch (e) {
      console.warn(`Could not delete issue ${id}:`, e.message);
    }
  }

  console.log("Purging test user accounts from MySQL...");
  try {
    const { execSync } = require('child_process');
    execSync(`& "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe" -u root -pAbdulAlienX20@ -e "USE civicpulse_project; DELETE FROM issues WHERE title LIKE '%Boundary Test%' OR title LIKE '%Central Station%' OR title LIKE '%Streetlamp%'; DELETE FROM users WHERE email LIKE '%@civicpulse.test';"`, { shell: 'powershell.exe' });
    console.log("Cleanup completed cleanly.");
  } catch (e) {
    console.warn("Cleanup error:", e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  logHeader("FINAL EDGE CASE VERIFICATION SUMMARY");
  const passedCount = testResults.filter(r => r.passed).length;
  const failedCount = testResults.filter(r => !r.passed).length;
  console.log(`Total Edge Cases Tested: ${testResults.length}`);
  console.log(`Passed: ${passedCount} (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failedCount}`);
  console.log("=".repeat(70));
}

runEdgeCaseTests().catch(console.error);
