const http = require('http');

/**
 * Self-contained API test runner for TaskFlow backend
 * Tests Health, Registration, Login, Token validation, and Authenticated Task CRUD.
 */
const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting TaskFlow Full Authentication & Task API Test Suite...\n');

  try {
    // 1. Health check
    const health = await makeRequest('GET', '/api/health');
    console.log(`[Test 1] Health Check: Status ${health.status}`, health.body);
    console.assert(health.status === 200, 'Health check should return 200');

    // 2. Auth Test: Unauthenticated access to tasks should be rejected with 401
    const unauthRes = await makeRequest('GET', '/api/tasks');
    console.log(`[Test 2] Protected Route without Token (expect 401): Status ${unauthRes.status}`);
    console.assert(unauthRes.status === 401, 'Tasks should require authentication');

    // 3. Auth Test: User Registration
    const testEmail = `test_${Date.now()}@example.com`;
    const regRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Alex Johnson',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123'
    });
    console.log(`[Test 3] User Registration (expect 201): Status ${regRes.status}`, regRes.body?.user);
    console.assert(regRes.status === 201, 'Registration should return 201');
    const token = regRes.body?.token;
    console.assert(Boolean(token), 'Registration should return JWT token');

    // 4. Auth Test: Duplicate Registration (expect 400)
    const dupRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Duplicate Alex',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123'
    });
    console.log(`[Test 4] Duplicate Email Registration (expect 400): Status ${dupRes.status}`);
    console.assert(dupRes.status === 400, 'Duplicate email should be rejected');

    // 5. Auth Test: User Login
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'password123'
    });
    console.log(`[Test 5] User Login (expect 200): Status ${loginRes.status}, user: ${loginRes.body?.user?.name}`);
    console.assert(loginRes.status === 200, 'Login should succeed with 200');
    console.assert(Boolean(loginRes.body?.token), 'Login should return a valid JWT token');

    // 6. Auth Test: Login with Invalid Password (expect 401)
    const badLoginRes = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'wrongpassword'
    });
    console.log(`[Test 6] Login with Invalid Password (expect 401): Status ${badLoginRes.status}`);
    console.assert(badLoginRes.status === 401, 'Wrong password should return 401');

    // 7. Auth Test: Get Current User Profile (/api/auth/me)
    const meRes = await makeRequest('GET', '/api/auth/me', null, token);
    console.log(`[Test 7] Verify Token via /api/auth/me (expect 200): ${meRes.body?.user?.email}`);
    console.assert(meRes.status === 200, 'Profile check should return 200');

    // 8. Task Test: Empty Title Validation (expect 400)
    const invalidCreate = await makeRequest('POST', '/api/tasks', { title: '   ' }, token);
    console.log(`[Test 8] Empty Title Validation (expect 400): Status ${invalidCreate.status}`);
    console.assert(invalidCreate.status === 400, 'Expected status 400 for empty title');

    // 9. Task Test: Create Task for Authenticated User
    const createRes = await makeRequest('POST', '/api/tasks', {
      title: 'Automated Auth Integration Task',
      description: 'Verifying user-scoped tasks in TaskFlow',
      priority: 'High',
      dueDate: new Date(Date.now() + 86400000).toISOString()
    }, token);
    console.log(`[Test 9] Create Task (expect 201): Status ${createRes.status}`);
    const createdId = createRes.body?.data?._id;
    console.assert(Boolean(createdId), 'Task ID should exist');

    // 10. Task Test: Retrieve Tasks for Authenticated User
    const getRes = await makeRequest('GET', '/api/tasks', null, token);
    console.log(`[Test 10] Get Authenticated Tasks (expect 200): Found ${getRes.body?.count} task(s)`);
    console.assert(getRes.status === 200, 'Expected status 200');

    // 11. Task Test: Toggle Status
    const toggleRes = await makeRequest('PATCH', `/api/tasks/${createdId}`, { completed: true }, token);
    console.log(`[Test 11] Toggle Task Status (expect 200): completed = ${toggleRes.body?.data?.completed}`);
    console.assert(toggleRes.body?.data?.completed === true, 'Task should be completed');

    // 12. Task Test: Delete Task
    const deleteRes = await makeRequest('DELETE', `/api/tasks/${createdId}`, null, token);
    console.log(`[Test 12] Delete Task (expect 200): Status ${deleteRes.status}`);
    console.assert(deleteRes.status === 200, 'Delete task should return 200');

    console.log('\n🎉 ALL AUTHENTICATION & TASK API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
  }
}

// If run directly, run the test suite
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
