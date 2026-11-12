# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: journeys.spec.ts >> Journey 3: Workshop Service Booking >> specialist division pages load — electricals, electronics, AC
- Location: e2e\journeys.spec.ts:109:3

# Error details

```
Error: page.goto: net::ERR_ABORTED at http://localhost:3000/electronics
Call log:
  - navigating to "http://localhost:3000/electronics", waiting until "load"

```

# Test source

```ts
  15  | // JOURNEY 1: Customer browses Certified Company-Owned Resale
  16  | // ─────────────────────────────────────────────────────────
  17  | test.describe("Journey 1: Customer browses Certified Resale", () => {
  18  |   test("homepage loads with hero, brand tagline, and three primary CTAs", async ({ page }) => {
  19  |     await page.goto("/");
  20  |     await expect(page).toHaveTitle(/Bharat Motor Club/i);
  21  | 
  22  |     // Hero tagline — target the h1 specifically to avoid strict-mode multi-match
  23  |     const heroHeading = page.getByRole("heading", { name: /ONE CLUB/i }).first();
  24  |     await expect(heroHeading).toBeVisible();
  25  |     await expect(heroHeading).toContainText("EVERY AUTOMOTIVE NEED");
  26  | 
  27  |     // Three primary CTAs (use .first() since nav/footer may duplicate links)
  28  |     await expect(page.getByRole("link", { name: /sell your vehicle/i }).first()).toBeVisible();
  29  |     await expect(page.getByRole("link", { name: /browse certified resale/i }).first()).toBeVisible();
  30  |     await expect(page.getByRole("link", { name: /book workshop service/i }).first()).toBeVisible();
  31  | 
  32  |     // Privacy assurance badge
  33  |     await expect(page.getByText(/strict seller privacy/i)).toBeVisible();
  34  |     await expect(page.getByText(/120-point technical inspection/i)).toBeVisible();
  35  |   });
  36  | 
  37  |   test("navigates to /automobiles and displays certified resale inventory page", async ({ page }) => {
  38  |     await page.goto("/automobiles");
  39  | 
  40  |     // Page structure loads — heading and search bar present
  41  |     await expect(page.getByText(/certified.*resale/i).first()).toBeVisible({ timeout: 10000 });
  42  | 
  43  |     // Search input is present for filtering
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
> 115 |     await page.goto("/electronics");
      |                ^ Error: page.goto: net::ERR_ABORTED at http://localhost:3000/electronics
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
  144 |     await expect(page.getByText(/dashboard|overview|admin/i).first()).toBeVisible({ timeout: 10000 });
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
```