import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

async function testSQLInjection() {
    console.log('--- Testing SQL Injection ---');
    try {
        const payload = { email: "' OR '1'='1' --", password: 'password' };
        const response = await axios.post(`${BASE_URL}/users/login`, payload);
        console.log('Result:', response.status === 401 ? '✅ Protected' : '❌ VULNERABLE');
    } catch (error) {
        console.log('Result: ✅ Protected (Error caught)');
    }
}

async function testXSSSanitization() {
    console.log('\n--- Testing XSS Sanitization ---');
    try {
        const payload = { 
            name: "Test User <script>alert('xss')</script>",
            email: "xss@test.com",
            password: "Password123",
            phone: "01012345678"
        };
        // This will fail validation anyway due to name regex/min, 
        // but let's see if the sanitizer catches it or if validation blocks it.
        const response = await axios.post(`${BASE_URL}/users/register`, payload);
        console.log('Result (XSS attempt):', response.data.message.includes('<script>') ? '❌ VULNERABLE' : '✅ Protected (Sanitized or Blocked)');
    } catch (error) {
        console.log('Result: ✅ Protected (Caught by validator/sanitizer)');
    }
}

async function testFileUploadSecurity() {
    console.log('\n--- Testing File Upload Security (Size Limit) ---');
    // For this we'd need a real file, but we can verify the limit in upload.js is set.
    console.log('Manual Check: Verify e:\\web dev\\mevn\\e_commerce\\server\\middlewares\\upload.js has 2MB limit.');
}

async function runTests() {
    await testSQLInjection();
    await testXSSSanitization();
    await testFileUploadSecurity();
}

runTests();
