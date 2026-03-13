/**
 * smoke-test.js — Full-Stack API Smoke Test
 * Run: node smoke-test.js       (requires Node >= 18 for native fetch)
 * Make sure the server is running on http://localhost:5000 before running.
 */

const BASE = "http://localhost:5000/api";

let passed = 0;
let failed = 0;

// ── Helpers ────────────────────────────────────────────────────────

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

async function request(method, path, body, token, isFormData = false) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const options = { method, headers };
  if (body) options.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, options);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { status: res.status, data };
}

// ── Test Suite ─────────────────────────────────────────────────────

// Unique email for this test run to avoid conflicts
const TEST_EMAIL = `test_${Date.now()}@smoke.com`;
const TEST_PHONE = `010${Math.floor(10000000 + Math.random() * 89999999)}`;
let userToken = "";
let userId = "";

async function runTests() {
  console.log("\n═══════════════════════════════════════════════");
  console.log("  E-Commerce API Smoke Test");
  console.log("═══════════════════════════════════════════════\n");

  // ── 1. Register a new user ─────────────────────────────────────
  console.log("1️⃣  Registration");

  // 1a. Valid registration
  const r1 = await request("POST", "/users/register", {
    name: "Smoke Tester",
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    password: "Test@1234",
  });
  assert(r1.status === 201, `Register new user → 201 (got ${r1.status})`);

  // 1b. Role escalation attempt — body should ignore role
  const r1b = await request("POST", "/users/register", {
    name: "Evil Admin",
    email: `evil_${Date.now()}@smoke.com`,
    phone: `011${Math.floor(10000000 + Math.random() * 89999999)}`,
    password: "Test@1234",
    role: "admin",
  });
  // Must succeed (201) but role in DB will be 'user'
  assert(
    r1b.status === 201,
    `Register with role escalation attempt → 201 (got ${r1b.status})`,
  );

  // ── 2. Login ───────────────────────────────────────────────────
  console.log("\n2️⃣  Login");

  // 2a. Valid login
  const r2 = await request("POST", "/users/login", {
    email: TEST_EMAIL,
    password: "Test@1234",
  });
  assert(
    r2.status === 200,
    `Login with correct credentials → 200 (got ${r2.status})`,
  );
  assert(!!r2.data.token, "Login response contains token");
  assert(!!r2.data.user, "Login response contains user object");
  assert(
    r2.data.user?.role === "user",
    `Registered user has role='user' (got '${r2.data.user?.role}')`,
  );
  userToken = r2.data.token;
  userId = r2.data.user?.id;

  // 2b. Wrong password
  const r2b = await request("POST", "/users/login", {
    email: TEST_EMAIL,
    password: "WrongPassword",
  });
  assert(
    r2b.status === 401,
    `Login with wrong password → 401 (got ${r2b.status})`,
  );

  // ── 3. User profile (RBAC) ─────────────────────────────────────
  console.log("\n3️⃣  Profile & RBAC");

  // 3a. List all users WITHOUT token → 401
  const r3a = await request("GET", "/users/");
  assert(
    r3a.status === 401,
    `GET /users without token → 401 (got ${r3a.status})`,
  );

  // 3b. List all users WITH user token (not admin) → 403
  const r3b = await request("GET", "/users/", null, userToken);
  assert(
    r3b.status === 403,
    `GET /users with user token → 403 (got ${r3b.status})`,
  );

  // 3c. Get own profile WITH token → 200
  if (userId) {
    const r3c = await request("GET", `/users/${userId}`, null, userToken);
    assert(
      r3c.status === 200,
      `GET /users/:id (own profile) → 200 (got ${r3c.status})`,
    );
  }

  // ── 4. Role escalation via update ─────────────────────────────
  console.log("\n4️⃣  Role Escalation Prevention");

  if (userId && userToken) {
    const r4 = await request(
      "PATCH",
      `/users/${userId}`,
      {
        name: "Smoke Tester Updated",
        role: "owner",
      },
      userToken,
    );
    // Should return 403 since user is not admin/owner
    assert(
      r4.status === 403,
      `PATCH own profile with role=owner (escalation) → 403 (got ${r4.status})`,
    );
  }

  // ── 5. Update own name (no role change) ───────────────────────
  console.log("\n5️⃣  Profile Update");

  if (userId && userToken) {
    const r5 = await request(
      "PATCH",
      `/users/${userId}`,
      {
        name: "Smoke Tester v2",
      },
      userToken,
    );
    assert(
      r5.status === 200,
      `PATCH own profile name → 200 (got ${r5.status})`,
    );
    assert(
      r5.data.user?.name === "Smoke Tester v2",
      `Updated name is correct (got '${r5.data.user?.name}')`,
    );
    assert(
      r5.data.user?.role === "user",
      `Role unchanged after update (got '${r5.data.user?.role}')`,
    );
  }

  // ── 6. Products (public read, protected write) ─────────────────
  console.log("\n6️⃣  Products");

  const r6a = await request("GET", "/products/");
  assert(
    r6a.status === 200 || r6a.status === 400,
    `GET /products (public) → 200 or 400 if empty (got ${r6a.status})`,
  );

  const r6b = await request("POST", "/products/", {
    name: "Hacked Product",
    category_id: 1,
    price: 0,
    description: "...",
    stock: 1,
  });
  assert(
    r6b.status === 401,
    `POST /products without token → 401 (got ${r6b.status})`,
  );

  const r6c = await request(
    "POST",
    "/products/",
    {
      name: "Hacked Product",
      category_id: 1,
      price: 0,
      description: "...",
      stock: 1,
    },
    userToken,
  );
  assert(
    r6c.status === 403,
    `POST /products with user token (not admin) → 403 (got ${r6c.status})`,
  );

  // ── 7. Categories (public read) ────────────────────────────────
  console.log("\n7️⃣  Categories");

  const r7 = await request("GET", "/categories/");
  assert(
    r7.status === 200 || r7.status === 400,
    `GET /categories (public) → 200 or 400 if empty (got ${r7.status})`,
  );

  const r7b = await request("POST", "/categories/", {
    name: "Hacked Cat",
    name_ar: "هكر",
  });
  assert(
    r7b.status === 401,
    `POST /categories without token → 401 (got ${r7b.status})`,
  );

  // ── Summary ────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("═══════════════════════════════════════════════\n");
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error("Unexpected error:", e.message);
  process.exit(1);
});
