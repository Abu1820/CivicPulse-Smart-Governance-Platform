/**
 * CivicPulse - Smart Governance Platform
 * Comprehensive End-to-End System & Functionality Verification Suite
 */

const BASE_URL = 'http://localhost:8080/api';

async function req(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };
    const config = {
        ...options,
        headers
    };
    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }
    const res = await fetch(url, config);
    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        data = await res.json();
    } else {
        data = await res.text();
    }
    return { status: res.status, ok: res.ok, data };
}

async function runAudit() {
    console.log('===============================================================');
    console.log('🏛️  CivicPulse - Smart Governance Platform: End-to-End Audit');
    console.log('===============================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, testName, details = '') {
        if (condition) {
            console.log(`  ✅ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`  ❌ FAIL: ${testName} - ${details}`);
            failed++;
        }
    }

    // ── 1. AUTHENTICATION & SEED VERIFICATION ──────────────────────────
    console.log('1️⃣  Testing Pre-Seeded Accounts...');

    // 1.1 Admin Login
    const adminLogin = await req('/auth/login', {
        method: 'POST',
        body: { email: 'admin@civicpulse.com', password: 'admin123' }
    });
    assert(adminLogin.status === 200 && adminLogin.data.role === 'ADMIN' && !!adminLogin.data.token,
        'Admin Login (admin@civicpulse.com)', `Status: ${adminLogin.status}, Role: ${adminLogin.data?.role}`);
    const adminToken = adminLogin.data?.token;

    // 1.2 Citizen Demo Login
    const citizenLogin = await req('/auth/login', {
        method: 'POST',
        body: { email: 'citizen@civicpulse.com', password: 'citizen123' }
    });
    assert(citizenLogin.status === 200 && (citizenLogin.data.role === 'USER' || citizenLogin.data.role === 'CITIZEN') && !!citizenLogin.data.token,
        'Citizen Demo Login (citizen@civicpulse.com)', `Status: ${citizenLogin.status}, Role: ${citizenLogin.data?.role}`);
    const citizenToken = citizenLogin.data?.token;

    // 1.3 Invalid Password Rejection
    const invalidLogin = await req('/auth/login', {
        method: 'POST',
        body: { email: 'admin@civicpulse.com', password: 'wrongpassword' }
    });
    assert(invalidLogin.data.success === false,
        'Reject Invalid Password (success=false)', `Response: ${JSON.stringify(invalidLogin.data)}`);

    // ── 2. NEW USER REGISTRATION & EMAIL OTP LIFECYCLE ─────────────────
    console.log('\n2️⃣  Testing User Registration & Email OTP Flow...');
    const testId = Date.now();
    const newCitizenEmail = `audit_citizen_${testId}@testpulse.org`;

    const registerRes = await req('/auth/register', {
        method: 'POST',
        body: {
            name: 'Audit Citizen',
            email: newCitizenEmail,
            password: 'password123'
        }
    });
    assert(registerRes.status === 200 && registerRes.data.requiresVerification === true,
        'Register New Citizen (requires email verification)', `Status: ${registerRes.status}`);

    // Attempting login before verification must flag requiresVerification
    const unverifiedLogin = await req('/auth/login', {
        method: 'POST',
        body: { email: newCitizenEmail, password: 'password123' }
    });
    assert(unverifiedLogin.data.requiresVerification === true || unverifiedLogin.data.emailVerified === false,
        'Unverified Citizen login requires email verification flag', `Verification state: ${JSON.stringify(unverifiedLogin.data)}`);

    // Resend verification code
    const resendRes = await req('/auth/resend-code', {
        method: 'POST',
        body: { email: newCitizenEmail }
    });
    assert(resendRes.status === 200 && resendRes.data.success === true,
        'Resend Verification Code API', `Status: ${resendRes.status}`);

    // ── 3. ISSUE REPORTING & CREATION (CITIZEN) ────────────────────────
    console.log('\n3️⃣  Testing Issue Creation (Citizen)...');

    const issuePayload = {
        title: `Audit Water Leakage ${testId}`,
        description: 'Underground pipeline ruptured causing street flooding.',
        location: '124 Cross Street, Sector 4',
        latitude: 12.9716,
        longitude: 77.5946,
        category: 'Water Leakage'
    };

    const createIssueRes = await req('/issues', {
        method: 'POST',
        headers: { Authorization: `Bearer ${citizenToken}` },
        body: issuePayload
    });

    assert(createIssueRes.status === 200 && createIssueRes.data.id && createIssueRes.data.status === 'Pending',
        'Citizen Reports Geotagged Issue (Status: Pending)', `Status: ${createIssueRes.status}, ID: ${createIssueRes.data?.id}`);
    const createdIssueId = createIssueRes.data?.id;

    // ── 4. VIEW ISSUES & SEARCH / FILTERING ────────────────────────────
    console.log('\n4️⃣  Testing View Issues & Filtering...');

    // Citizen views their own issues
    const citizenIssues = await req('/issues', {
        method: 'GET',
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert(citizenIssues.status === 200 && Array.isArray(citizenIssues.data) && citizenIssues.data.some(i => i.id === createdIssueId),
        'Citizen retrieves their submitted issues list', `Count: ${citizenIssues.data?.length}`);

    // Filter by category
    const filterCategory = await req('/issues?category=Water Leakage', {
        method: 'GET',
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert(filterCategory.status === 200 && filterCategory.data.every(i => i.category === 'Water Leakage'),
        'Filter issues by category "Water Leakage"', `Count: ${filterCategory.data?.length}`);

    // Filter by keyword
    const filterKeyword = await req(`/issues?search=${encodeURIComponent('Audit Water')}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert(filterKeyword.status === 200 && filterKeyword.data.some(i => i.id === createdIssueId),
        'Filter issues by search keyword', `Count: ${filterKeyword.data?.length}`);

    // Get specific issue details
    const issueDetails = await req(`/issues/${createdIssueId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert(issueDetails.status === 200 && issueDetails.data.id === createdIssueId,
        'Retrieve Single Issue Details by ID', `Issue Title: ${issueDetails.data?.title}`);

    // ── 5. ADMIN DASHBOARD & WORKFLOWS ─────────────────────────────────
    console.log('\n5️⃣  Testing Admin Dashboard & Workflows...');

    // Admin dashboard stats
    const dashboardStats = await req('/dashboard/stats', {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(dashboardStats.status === 200 && dashboardStats.data.totalIssues >= 1 && typeof dashboardStats.data.categoryStats === 'object',
        'Admin retrieves aggregated Dashboard Statistics & Charts',
        `Total: ${dashboardStats.data?.totalIssues}, Categories: ${JSON.stringify(dashboardStats.data?.categoryStats)}`);

    // Citizen forbidden from admin stats
    const citizenAdminCheck = await req('/dashboard/stats', {
        method: 'GET',
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert(citizenAdminCheck.status === 403,
        'Security: Citizen Forbidden (403) from accessing Admin Dashboard Stats', `Status: ${citizenAdminCheck.status}`);

    // Status transition: Pending -> In Progress (using @RequestParam)
    const statusInProgress = await req(`/issues/${createdIssueId}/status?status=In%20Progress`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(statusInProgress.status === 200 && statusInProgress.data.status === 'In Progress',
        'Admin transitions status to "In Progress"', `Status: ${statusInProgress.data?.status}`);

    // Status transition: In Progress -> Resolved
    const statusResolved = await req(`/issues/${createdIssueId}/status?status=Resolved`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(statusResolved.status === 200 && statusResolved.data.status === 'Resolved',
        'Admin transitions status to "Resolved"', `Status: ${statusResolved.data?.status}`);

    // Citizen forbidden from transitioning status
    const citizenStatusAttempt = await req(`/issues/${createdIssueId}/status?status=Pending`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert(citizenStatusAttempt.status === 403,
        'Security: Citizen Forbidden (403) from altering Issue Status', `Status: ${citizenStatusAttempt.status}`);

    // Citizen forbidden from deleting issue
    const citizenDeleteAttempt = await req(`/issues/${createdIssueId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert(citizenDeleteAttempt.status === 403,
        'Security: Citizen Forbidden (403) from Deleting Issue', `Status: ${citizenDeleteAttempt.status}`);

    // Admin deletes issue (cleanup)
    const adminDelete = await req(`/issues/${createdIssueId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminDelete.status === 200,
        'Admin Deletes Issue successfully', `Status: ${adminDelete.status}`);

    // Verify deletion
    const verifyDelete = await req(`/issues/${createdIssueId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(verifyDelete.status === 404,
        'Deleted issue returns 404 Not Found', `Status: ${verifyDelete.status}`);

    // ── 6. RATE LIMITING & ROUTE GUARDS ────────────────────────────────
    console.log('\n6️⃣  Testing API Security & Boundary Controls...');
    const unauthAccess = await req('/issues', { method: 'GET' });
    assert(unauthAccess.status === 401 || unauthAccess.status === 403,
        'Unauthenticated access safely rejected with 401/403', `Status: ${unauthAccess.status}`);

    console.log('\n===============================================================');
    console.log(`📊 Audit Completed: ${passed} Passed, ${failed} Failed`);
    console.log('===============================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runAudit().catch(err => {
    console.error('Audit execution error:', err);
    process.exit(1);
});
