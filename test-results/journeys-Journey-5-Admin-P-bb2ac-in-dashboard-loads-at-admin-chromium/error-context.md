# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: journeys.spec.ts >> Journey 5: Admin Portals >> admin dashboard loads at /admin
- Location: e2e\journeys.spec.ts:142:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/dashboard|overview|admin/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/dashboard|overview|admin/i).first() with timeout 10000ms
  - waiting for getByText(/dashboard|overview|admin/i).first()
    5 × waiting for "http://localhost:3000/admin" navigation to finish...
      - navigated to "http://localhost:3000/admin"
    2 × waiting for navigation to finish...
      - navigated to "http://localhost:3000/admin"

```

```yaml
- banner:
  - link "Bharat Motor Club One Club. Every Automotive Need.":
    - /url: /
    - img
    - text: Bharat Motor Club One Club. Every Automotive Need.
  - navigation:
    - link "Certified Resale":
      - /url: /automobiles
    - link "Sell to BMC":
      - /url: /seller/submit
    - button "Services & Divisions"
    - link "Garage & Mechanical Periodic service, engine & clutch overhauls":
      - /url: /garage
    - link "Electricals Wiring, battery, alternator & starter diagnosis":
      - /url: /electricals
    - link "Electronics & ECU Infotainment, cameras & electronic control systems":
      - /url: /electronics
    - link "Car Air-Conditioning Leak checks, compressor work & refrigerant refill":
      - /url: /ac
    - link "120-Point Inspections Pre-purchase & condition certifications":
      - /url: /inspections
    - link "Spare Parts":
      - /url: /parts
    - link "Fleet":
      - /url: /fleet
    - link "Club Membership":
      - /url: /membership
  - link "My Garage":
    - /url: /customer/garage
  - link "Book Service":
    - /url: /garage#book
  - link "Sign In":
    - /url: /auth/signin
- main:
  - text: BMC Ops Portal
  - navigation:
    - link "Executive BI":
      - /url: /admin
    - link "Acquisition Queue":
      - /url: /admin/acquisition
    - link "120-Pt Inspector":
      - /url: /inspector
    - link "Inventory & QC Gates":
      - /url: /admin/vehicles
    - link "Workshop Job Cards":
      - /url: /admin/jobs
    - link "AI Prompt Studio":
      - /url: /admin/prompts
  - text: RBAC Enforced • BMC-HQ
  - link "Public Store":
    - /url: /
  - paragraph: Loading operational metrics...
- contentinfo:
  - link "Bharat Motor Club One Club. Every Automotive Need.":
    - /url: /
    - img
    - text: Bharat Motor Club One Club. Every Automotive Need.
  - paragraph: One Club. Every Automotive Need. A unified, company-operated automotive destination integrating private vehicle acquisition, certified company-owned resale, workshop mechanics, automotive electricals, electronics, air-conditioning, genuine spare parts, and fleet support.
  - text: "Central Hub: Automotive Corridor, Guindy, Chennai, TN 600032 Customer Care: +91 44 2855 0000 Official Enquiries: contact@bharatmotorclub.local"
  - heading "Automobiles" [level=4]
  - list:
    - listitem:
      - link "Certified Resale Catalogue":
        - /url: /automobiles
    - listitem:
      - link "Sell your Vehicle to BMC":
        - /url: /seller/submit
    - listitem:
      - link "120-Point Inspection Scope":
        - /url: /inspections
    - listitem:
      - link "Company Resale Model":
        - /url: /automobiles#how-it-works
  - heading "Workshop & Parts" [level=4]
  - list:
    - listitem:
      - link "Garage & Mechanical Repairs":
        - /url: /garage
    - listitem:
      - link "Automotive Electricals":
        - /url: /electricals
    - listitem:
      - link "Electronics, Audio & ECU":
        - /url: /electronics
    - listitem:
      - link "Car Air-Conditioning (AC)":
        - /url: /ac
    - listitem:
      - link "Spare Parts & Compatibility":
        - /url: /parts
  - heading "Club & Corporate" [level=4]
  - list:
    - listitem:
      - link "Club Membership Plans":
        - /url: /membership
    - listitem:
      - link "Corporate Fleet Solutions":
        - /url: /fleet
    - listitem:
      - link "Digital Vehicle Health Records":
        - /url: /technologies
    - listitem:
      - link "Staff & Operations Portal":
        - /url: /admin
  - paragraph: © 2026 BHARAT MOTOR CLUB. All rights reserved. Company-operated automotive ecosystem.
  - paragraph: "Non-negotiable Privacy Policy: Private seller identity, private submission records, and documentation are strictly confidential and visible only to authorized BMC acquisition personnel. No public peer-to-peer listings."
  - link "Privacy Policy":
    - /url: /privacy
  - link "Terms of Business":
    - /url: /terms
  - link "Seller Acquisition Agreement":
    - /url: /seller-agreement
  - link "Team Login":
    - /url: /admin
```

# Test source

```ts
  44  |     const searchInput = page.locator('input[type="text"], input[type="search"]').first();
  45  |     await expect(searchInput).toBeVisible();
  46  |   });
  47  | 
  48  |   test("homepage hero link to /automobiles navigates correctly", async ({ page }) => {
  49  |     await page.goto("/");
  50  |     await page.getByRole("link", { name: /browse certified resale/i }).click();
  51  |     await expect(page).toHaveURL(/\/automobiles/);
  52  |   });
  53  | });
  54  | 
  55  | // ─────────────────────────────────────────────────────────
  56  | // JOURNEY 2: Private Seller Submits Confidential Intake Wizard
  57  | // ─────────────────────────────────────────────────────────
  58  | test.describe("Journey 2: Private Seller Intake Wizard", () => {
  59  |   test("seller wizard loads at /seller/submit with multi-step form", async ({ page }) => {
  60  |     await page.goto("/seller/submit");
  61  | 
  62  |     // Step 1 visible — Seller Contact
  63  |     await expect(page.getByText(/confidential/i).first()).toBeVisible();
  64  |     await expect(page.getByText(/step 1/i).first()).toBeVisible({ timeout: 10000 });
  65  | 
  66  |     // Privacy notice is displayed
  67  |     await expect(page.getByText(/privacy|private/i).first()).toBeVisible();
  68  |   });
  69  | 
  70  |   test("seller wizard step navigation works with Next/Previous buttons", async ({ page }) => {
  71  |     await page.goto("/seller/submit");
  72  | 
  73  |     // We should be on Step 1
  74  |     await expect(page.getByText(/step 1/i).first()).toBeVisible();
  75  | 
  76  |     // Fill the minimum required seller info and click Next
  77  |     const nextButton = page.getByRole("button", { name: /next|continue/i }).first();
  78  | 
  79  |     if (await nextButton.isVisible()) {
  80  |       await nextButton.click();
  81  |       // Should advance to Step 2
  82  |       await expect(page.getByText(/step 2/i).first()).toBeVisible({ timeout: 5000 });
  83  | 
  84  |       // Go back
  85  |       const prevButton = page.getByRole("button", { name: /previous|back/i }).first();
  86  |       if (await prevButton.isVisible()) {
  87  |         await prevButton.click();
  88  |         await expect(page.getByText(/step 1/i).first()).toBeVisible({ timeout: 5000 });
  89  |       }
  90  |     }
  91  |   });
  92  | });
  93  | 
  94  | // ─────────────────────────────────────────────────────────
  95  | // JOURNEY 3: Workshop Service Appointment Booking
  96  | // ─────────────────────────────────────────────────────────
  97  | test.describe("Journey 3: Workshop Service Booking", () => {
  98  |   test("garage page loads with service categories and booking form", async ({ page }) => {
  99  |     await page.goto("/garage");
  100 | 
  101 |     // Multi-bay garage page should have service info and booking section
  102 |     await expect(page.getByText(/garage|workshop|service/i).first()).toBeVisible();
  103 | 
  104 |     // Booking form inputs present
  105 |     const nameInput = page.locator('input[type="text"]').first();
  106 |     await expect(nameInput).toBeVisible();
  107 |   });
  108 | 
  109 |   test("specialist division pages load — electricals, electronics, AC", async ({ page }) => {
  110 |     // Electricals
  111 |     await page.goto("/electricals");
  112 |     await expect(page.getByText(/electrical/i).first()).toBeVisible();
  113 | 
  114 |     // Electronics
  115 |     await page.goto("/electronics");
  116 |     await expect(page.getByText(/electronic/i).first()).toBeVisible();
  117 | 
  118 |     // Air Conditioning
  119 |     await page.goto("/ac");
  120 |     await expect(page.getByText(/air.*conditioning|ac|climate/i).first()).toBeVisible();
  121 |   });
  122 | });
  123 | 
  124 | // ─────────────────────────────────────────────────────────
  125 | // JOURNEY 4: Field Inspector 120-Point Mobile Checklist
  126 | // ─────────────────────────────────────────────────────────
  127 | test.describe("Journey 4: Mobile Inspector Tool", () => {
  128 |   test("inspector page requires authentication and redirects to sign-in", async ({ page }) => {
  129 |     await page.goto("/inspector");
  130 | 
  131 |     // Inspector is auth-protected — should redirect to sign-in with callback
  132 |     await page.waitForURL(/\/auth\/signin/i, { timeout: 10000 });
  133 |     await expect(page).toHaveURL(/callbackUrl.*inspector/i);
  134 |     await expect(page.getByText(/sign.*in|login|email/i).first()).toBeVisible();
  135 |   });
  136 | });
  137 | 
  138 | // ─────────────────────────────────────────────────────────
  139 | // JOURNEY 5: Admin Acquisition Queue
  140 | // ─────────────────────────────────────────────────────────
  141 | test.describe("Journey 5: Admin Portals", () => {
  142 |   test("admin dashboard loads at /admin", async ({ page }) => {
  143 |     await page.goto("/admin");
> 144 |     await expect(page.getByText(/dashboard|overview|admin/i).first()).toBeVisible({ timeout: 10000 });
      |                                                                       ^ Error: expect(locator).toBeVisible() failed
  145 |   });
  146 | 
  147 |   test("admin acquisition queue loads at /admin/acquisition", async ({ page }) => {
  148 |     await page.goto("/admin/acquisition");
  149 |     await expect(page.getByText(/acquisition|pipeline|intake/i).first()).toBeVisible({ timeout: 10000 });
  150 |   });
  151 | 
  152 |   test("admin vehicle inventory loads at /admin/vehicles", async ({ page }) => {
  153 |     await page.goto("/admin/vehicles");
  154 |     await expect(page.getByText(/vehicle|inventory|stock/i).first()).toBeVisible({ timeout: 10000 });
  155 |   });
  156 | 
  157 |   test("admin job card management loads at /admin/jobs", async ({ page }) => {
  158 |     await page.goto("/admin/jobs");
  159 |     await expect(page.getByText(/job.*card|work.*order|workshop/i).first()).toBeVisible({ timeout: 10000 });
  160 |   });
  161 | 
  162 |   test("admin AI prompt studio loads at /admin/prompts", async ({ page }) => {
  163 |     await page.goto("/admin/prompts");
  164 |     await expect(page.getByText(/prompt|ai.*studio|assistant/i).first()).toBeVisible({ timeout: 10000 });
  165 |   });
  166 | });
  167 | 
  168 | // ─────────────────────────────────────────────────────────
  169 | // JOURNEY 6: Platform Structural & Division Pages
  170 | // ─────────────────────────────────────────────────────────
  171 | test.describe("Journey 6: Platform Structure & Division Portals", () => {
  172 |   test("membership page loads at /membership", async ({ page }) => {
  173 |     await page.goto("/membership");
  174 |     await expect(page.getByText(/membership|club|member/i).first()).toBeVisible({ timeout: 10000 });
  175 |   });
  176 | 
  177 |   test("fleet management page loads at /fleet", async ({ page }) => {
  178 |     await page.goto("/fleet");
  179 |     await expect(page.getByText(/fleet|enterprise|corporate/i).first()).toBeVisible({ timeout: 10000 });
  180 |   });
  181 | 
  182 |   test("genuine parts page loads at /parts", async ({ page }) => {
  183 |     await page.goto("/parts");
  184 |     await expect(page.getByText(/parts|spare|genuine/i).first()).toBeVisible({ timeout: 10000 });
  185 |   });
  186 | 
  187 |   test("AI technologies page loads at /technologies", async ({ page }) => {
  188 |     await page.goto("/technologies");
  189 |     await expect(page.getByText(/technologies|ai|intelligence/i).first()).toBeVisible({ timeout: 10000 });
  190 |   });
  191 | 
  192 |   test("customer digital glovebox loads at /customer/garage", async ({ page }) => {
  193 |     await page.goto("/customer/garage");
  194 |     await expect(page.getByText(/garage|glovebox|vehicle/i).first()).toBeVisible({ timeout: 10000 });
  195 |   });
  196 | 
  197 |   test("seller dashboard loads at /seller/dashboard", async ({ page }) => {
  198 |     await page.goto("/seller/dashboard");
  199 |     await expect(page.getByText(/seller|dashboard|case/i).first()).toBeVisible({ timeout: 10000 });
  200 |   });
  201 | 
  202 |   test("authentication page loads at /auth/signin", async ({ page }) => {
  203 |     await page.goto("/auth/signin");
  204 |     await expect(page.getByText(/sign.*in|login|email/i).first()).toBeVisible({ timeout: 10000 });
  205 |   });
  206 | });
  207 | 
  208 | // ─────────────────────────────────────────────────────────
  209 | // JOURNEY 7: API Health Checks
  210 | // ─────────────────────────────────────────────────────────
  211 | test.describe("Journey 7: API Endpoint Health", () => {
  212 |   test("GET /api/vehicles returns valid JSON", async ({ request }) => {
  213 |     const res = await request.get("/api/vehicles");
  214 |     expect(res.status()).toBe(200);
  215 |     const body = await res.json();
  216 |     expect(body).toHaveProperty("listings");
  217 |     expect(Array.isArray(body.listings)).toBe(true);
  218 |   });
  219 | 
  220 |   test("GET /api/products returns valid JSON", async ({ request }) => {
  221 |     const res = await request.get("/api/products");
  222 |     expect(res.status()).toBe(200);
  223 |     const body = await res.json();
  224 |     expect(body).toHaveProperty("products");
  225 |   });
  226 | 
  227 |   test("GET /api/membership-plans returns valid JSON", async ({ request }) => {
  228 |     const res = await request.get("/api/membership-plans");
  229 |     expect(res.status()).toBe(200);
  230 |     const body = await res.json();
  231 |     expect(Array.isArray(body.plans || body)).toBe(true);
  232 |   });
  233 | 
  234 |   test("GET /api/auth/me returns auth state", async ({ request }) => {
  235 |     const res = await request.get("/api/auth/me");
  236 |     // Should return 200 with null user or 401 — either is valid
  237 |     expect([200, 401]).toContain(res.status());
  238 |   });
  239 | 
  240 |   test("POST /api/telematics/obd/scan parses DTC codes", async ({ request }) => {
  241 |     const res = await request.post("/api/telematics/obd/scan", {
  242 |       data: { rawInput: "P0300 P0420" },
  243 |     });
  244 |     expect(res.status()).toBe(200);
```