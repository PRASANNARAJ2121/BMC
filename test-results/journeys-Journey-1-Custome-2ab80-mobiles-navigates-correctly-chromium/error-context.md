# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: journeys.spec.ts >> Journey 1: Customer browses Certified Resale >> homepage hero link to /automobiles navigates correctly
- Location: e2e\journeys.spec.ts:48:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /browse certified resale/i })
    - locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    2 × locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
    - attempting click action
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
      - locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    3 × locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for "http://localhost:3000/" navigation to finish...
    - navigated to "http://localhost:3000/"
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying
    2 × locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  3 × attempting click action
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
  - element was detached from the DOM, retrying
    - locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for "http://localhost:3000/" navigation to finish...
    - navigated to "http://localhost:3000/"
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying
    - locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - waiting for "http://localhost:3000/" navigation to finish...
    - navigated to "http://localhost:3000/"
    - locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    2 × locator resolved to <a href="/automobiles" class="px-7 py-3.5 text-base font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all">Browse Certified Resale</a>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed

```

# Page snapshot

```yaml
- generic [active] [ref=f67e1]:
  - banner [ref=f67e2]:
    - generic [ref=f67e4]:
      - link "Bharat Motor Club One Club. Every Automotive Need." [ref=f67e5] [cursor=pointer]:
        - /url: /
        - generic [ref=f67e12]:
          - generic [ref=f67e13]: Bharat Motor Club
          - generic [ref=f67e14]: One Club. Every Automotive Need.
      - navigation [ref=f67e15]:
        - link "Certified Resale" [ref=f67e16] [cursor=pointer]:
          - /url: /automobiles
        - link "Sell to BMC" [ref=f67e17] [cursor=pointer]:
          - /url: /seller/submit
        - generic [ref=f67e18]:
          - button "Services & Divisions" [ref=f67e19]
          - generic:
            - link "Garage & Mechanical Periodic service, engine & clutch overhauls":
              - /url: /garage
              - generic:
                - generic: Garage & Mechanical
                - generic: Periodic service, engine & clutch overhauls
            - link "Electricals Wiring, battery, alternator & starter diagnosis":
              - /url: /electricals
              - generic:
                - generic: Electricals
                - generic: Wiring, battery, alternator & starter diagnosis
            - link "Electronics & ECU Infotainment, cameras & electronic control systems":
              - /url: /electronics
              - generic:
                - generic: Electronics & ECU
                - generic: Infotainment, cameras & electronic control systems
            - link "Car Air-Conditioning Leak checks, compressor work & refrigerant refill":
              - /url: /ac
              - generic:
                - generic: Car Air-Conditioning
                - generic: Leak checks, compressor work & refrigerant refill
            - link "120-Point Inspections Pre-purchase & condition certifications":
              - /url: /inspections
              - generic:
                - generic: 120-Point Inspections
                - generic: Pre-purchase & condition certifications
        - link "Spare Parts" [ref=f67e22] [cursor=pointer]:
          - /url: /parts
        - link "Fleet" [ref=f67e23] [cursor=pointer]:
          - /url: /fleet
        - link "Club Membership" [ref=f67e24] [cursor=pointer]:
          - /url: /membership
      - generic [ref=f67e25]:
        - link "My Garage" [ref=f67e26] [cursor=pointer]:
          - /url: /customer/garage
        - link "Book Service" [ref=f67e27] [cursor=pointer]:
          - /url: /garage#book
        - link "Sign In" [ref=f67e28] [cursor=pointer]:
          - /url: /auth/signin
  - main [ref=f67e29]:
    - generic [ref=f67e30]:
      - generic [ref=f67e34]:
        - generic [ref=f67e35]: Company-Operated Automotive Ecosystem
        - heading "ONE CLUB. EVERY AUTOMOTIVE NEED." [level=1] [ref=f67e38]
        - paragraph [ref=f67e39]: Bharat Motor Club unifies private vehicle acquisition, certified company-owned resale, multi-bay garage repairs, specialist electricals, vehicle electronics, car air-conditioning, and genuine spare parts into one trusted Indian destination.
        - generic [ref=f67e40]:
          - link "Sell Your Vehicle to BMC" [ref=f67e41] [cursor=pointer]:
            - /url: /seller/submit
          - link "Browse Certified Resale" [ref=f67e45] [cursor=pointer]:
            - /url: /automobiles
          - link "Book Workshop Service →" [ref=f67e46] [cursor=pointer]:
            - /url: /garage#book
        - generic [ref=f67e47]:
          - generic [ref=f67e48]: Strict Seller Privacy (No Public P2P)
          - generic [ref=f67e53]: Company-Owned & RTO Transferred
          - generic [ref=f67e58]: 120-Point Technical Inspection
      - generic [ref=f67e64]:
        - generic [ref=f67e65]:
          - heading "Integrated Operations" [level=2] [ref=f67e66]
          - paragraph [ref=f67e67]: 10 Specialized Divisions. Zero Compromise.
          - paragraph [ref=f67e68]: Every division operates under centralized BMC governance, shared vehicle history ledgers, and professional workshop standards.
        - generic [ref=f67e69]:
          - generic [ref=f67e70]:
            - generic [ref=f67e71]:
              - heading "BMC Automobiles" [level=3] [ref=f67e77]
              - paragraph [ref=f67e78]: Confidential private vehicle acquisition and company-owned used vehicle retail. Every resale car is company-owned, reconditioned, and backed by verifiable vehicle history.
            - generic [ref=f67e79]:
              - link "View Resale Stock →" [ref=f67e80] [cursor=pointer]:
                - /url: /automobiles
              - link "Submit Vehicle" [ref=f67e81] [cursor=pointer]:
                - /url: /seller/submit
          - generic [ref=f67e82]:
            - generic [ref=f67e83]:
              - heading "BMC Garage" [level=3] [ref=f67e87]
              - paragraph [ref=f67e88]: Multi-bay mechanical servicing, engine diagnostics, transmission overhauls, clutch replacement, braking systems, suspension geometry, and wheel alignment.
            - generic [ref=f67e89]:
              - link "Garage Services →" [ref=f67e90] [cursor=pointer]:
                - /url: /garage
              - link "Book Service Bay" [ref=f67e91] [cursor=pointer]:
                - /url: /garage#book
          - generic [ref=f67e92]:
            - generic [ref=f67e93]:
              - heading "BMC Electricals" [level=3] [ref=f67e97]
              - paragraph [ref=f67e98]: Specialist automotive wiring, parasitic battery drain tests, high-output alternators, starter motors, relay boards, lighting assemblies, and charging system health checks.
            - generic [ref=f67e99]:
              - link "Electrical Diagnosis →" [ref=f67e100] [cursor=pointer]:
                - /url: /electricals
              - generic [ref=f67e101]: Battery & Harness
          - generic [ref=f67e102]:
            - generic [ref=f67e103]:
              - heading "BMC Electronics" [level=3] [ref=f67e108]
              - paragraph [ref=f67e109]: Electronic control units (ECU), sensor calibration, touch infotainment, Android Auto / Apple CarPlay upgrades, reversing cameras, 360-degree systems, and GPS tracking.
            - generic [ref=f67e110]:
              - link "Electronics Suite →" [ref=f67e111] [cursor=pointer]:
                - /url: /electronics
              - generic [ref=f67e112]: ECU & Audio
          - generic [ref=f67e113]:
            - generic [ref=f67e114]:
              - heading "BMC Car AC" [level=3] [ref=f67e120]
              - paragraph [ref=f67e121]: "Dedicated climate control workshop: electronic nitrogen leak detection, compressor rebuilding, condenser replacement, R134a/R1234yf evacuation, and antibacterial cabin sanitation."
            - generic [ref=f67e122]:
              - link "AC Diagnostic Bay →" [ref=f67e123] [cursor=pointer]:
                - /url: /ac
              - generic [ref=f67e124]: Zero Leakage
          - generic [ref=f67e125]:
            - generic [ref=f67e126]:
              - heading "BMC Parts" [level=3] [ref=f67e132]
              - paragraph [ref=f67e133]: Genuine OEM & verified aftermarket replacement parts. Lubricants, brake pads, shock absorbers, air filters, and clutches with exact vehicle fitment verification.
            - generic [ref=f67e134]:
              - link "Search Catalogue →" [ref=f67e135] [cursor=pointer]:
                - /url: /parts
              - generic [ref=f67e136]: SKU Fitment
          - generic [ref=f67e137]:
            - generic [ref=f67e138]:
              - heading "BMC Inspections" [level=3] [ref=f67e144]
              - paragraph [ref=f67e145]: 120-point digital vehicle certifications covering chassis, flood damage, paint depth, engine compression, OBD-II error codes, and verified odometer readouts.
            - generic [ref=f67e146]:
              - link "Inspection Scope →" [ref=f67e147] [cursor=pointer]:
                - /url: /inspections
              - generic [ref=f67e148]: 120-Point QC
          - generic [ref=f67e149]:
            - generic [ref=f67e150]:
              - heading "BMC Fleet Solutions" [level=3] [ref=f67e156]
              - paragraph [ref=f67e157]: Corporate fleet preventive maintenance schedules, volume labour discounts, dedicated service bay allocations, centralized GST billing, and fleet vehicle health reports.
            - generic [ref=f67e158]:
              - link "Fleet Onboarding →" [ref=f67e159] [cursor=pointer]:
                - /url: /fleet
              - generic [ref=f67e160]: Corporate SLA
          - generic [ref=f67e161]:
            - generic [ref=f67e162]:
              - heading "BMC Membership" [level=3] [ref=f67e167]
              - paragraph [ref=f67e168]: Club member plans with prioritized bay booking, labour discounts, complimentary seasonal checkups, roadside breakdown support, and vehicle health digital records.
            - generic [ref=f67e169]:
              - link "Explore Plans →" [ref=f67e170] [cursor=pointer]:
                - /url: /membership
              - generic [ref=f67e171]: Annual Shield
      - generic [ref=f67e173]:
        - generic [ref=f67e174]:
          - heading "The Core Differentiator" [level=2] [ref=f67e175]
          - paragraph [ref=f67e176]: Why We Are NOT a Peer-to-Peer Classifieds Site
          - paragraph [ref=f67e177]: We never post private cars for buyers to contact strangers. BMC purchases, reconditions, owns, and warrants every vehicle we offer for resale.
        - generic [ref=f67e178]:
          - generic [ref=f67e179]:
            - generic [ref=f67e180]: "01"
            - heading "Confidential Submission" [level=4] [ref=f67e181]
            - paragraph [ref=f67e182]: You submit your car securely to BMC. Your identity, contact, address, and RC details remain strictly confidential and are never exposed publicly.
          - generic [ref=f67e183]:
            - generic [ref=f67e184]: "02"
            - heading "Direct Company Purchase" [level=4] [ref=f67e185]
            - paragraph [ref=f67e186]: BMC inspects, values, and buys your vehicle directly with instant verified settlement. We complete the official RTO transfer of ownership.
          - generic [ref=f67e187]:
            - generic [ref=f67e188]: "03"
            - heading "Workshop Reconditioning" [level=4] [ref=f67e189]
            - paragraph [ref=f67e190]: Our in-house garage, electrical, electronics, and AC specialists recondition the vehicle, replace worn parts, and certify it through strict QC.
          - generic [ref=f67e191]:
            - generic [ref=f67e192]: "04"
            - heading "Certified Company Resale" [level=4] [ref=f67e193]
            - paragraph [ref=f67e194]: Buyers purchase directly from BMC with full condition disclosures, warranty coverage, and lifelong service continuity under one club.
      - generic [ref=f67e196]:
        - heading "Ready to Experience Transparent Automotive Services?" [level=2] [ref=f67e197]
        - paragraph [ref=f67e198]: Whether you are selling your car, searching for certified company stock, or servicing your existing vehicle, Bharat Motor Club is at your service.
        - generic [ref=f67e199]:
          - link "Sell Your Car to BMC" [ref=f67e200] [cursor=pointer]:
            - /url: /seller/submit
          - link "Book Service Appointment" [ref=f67e201] [cursor=pointer]:
            - /url: /garage#book
  - contentinfo [ref=f67e202]:
    - generic [ref=f67e203]:
      - generic [ref=f67e204]:
        - generic [ref=f67e205]:
          - link "Bharat Motor Club One Club. Every Automotive Need." [ref=f67e206] [cursor=pointer]:
            - /url: /
            - generic [ref=f67e213]:
              - generic [ref=f67e214]: Bharat Motor Club
              - generic [ref=f67e215]: One Club. Every Automotive Need.
          - paragraph [ref=f67e216]: One Club. Every Automotive Need. A unified, company-operated automotive destination integrating private vehicle acquisition, certified company-owned resale, workshop mechanics, automotive electricals, electronics, air-conditioning, genuine spare parts, and fleet support.
          - generic [ref=f67e217]:
            - generic [ref=f67e218]: "Central Hub: Automotive Corridor, Guindy, Chennai, TN 600032"
            - generic [ref=f67e223]: "Customer Care: +91 44 2855 0000"
            - generic [ref=f67e227]: "Official Enquiries: contact@bharatmotorclub.local"
        - generic [ref=f67e232]:
          - heading "Automobiles" [level=4] [ref=f67e233]
          - list [ref=f67e234]:
            - listitem [ref=f67e235]:
              - link "Certified Resale Catalogue" [ref=f67e236] [cursor=pointer]:
                - /url: /automobiles
            - listitem [ref=f67e237]:
              - link "Sell your Vehicle to BMC" [ref=f67e238] [cursor=pointer]:
                - /url: /seller/submit
            - listitem [ref=f67e239]:
              - link "120-Point Inspection Scope" [ref=f67e240] [cursor=pointer]:
                - /url: /inspections
            - listitem [ref=f67e241]:
              - link "Company Resale Model" [ref=f67e242] [cursor=pointer]:
                - /url: /automobiles#how-it-works
        - generic [ref=f67e243]:
          - heading "Workshop & Parts" [level=4] [ref=f67e244]
          - list [ref=f67e245]:
            - listitem [ref=f67e246]:
              - link "Garage & Mechanical Repairs" [ref=f67e247] [cursor=pointer]:
                - /url: /garage
            - listitem [ref=f67e248]:
              - link "Automotive Electricals" [ref=f67e249] [cursor=pointer]:
                - /url: /electricals
            - listitem [ref=f67e250]:
              - link "Electronics, Audio & ECU" [ref=f67e251] [cursor=pointer]:
                - /url: /electronics
            - listitem [ref=f67e252]:
              - link "Car Air-Conditioning (AC)" [ref=f67e253] [cursor=pointer]:
                - /url: /ac
            - listitem [ref=f67e254]:
              - link "Spare Parts & Compatibility" [ref=f67e255] [cursor=pointer]:
                - /url: /parts
        - generic [ref=f67e256]:
          - heading "Club & Corporate" [level=4] [ref=f67e257]
          - list [ref=f67e258]:
            - listitem [ref=f67e259]:
              - link "Club Membership Plans" [ref=f67e260] [cursor=pointer]:
                - /url: /membership
            - listitem [ref=f67e261]:
              - link "Corporate Fleet Solutions" [ref=f67e262] [cursor=pointer]:
                - /url: /fleet
            - listitem [ref=f67e263]:
              - link "Digital Vehicle Health Records" [ref=f67e264] [cursor=pointer]:
                - /url: /technologies
            - listitem [ref=f67e265]:
              - link "Staff & Operations Portal" [ref=f67e266] [cursor=pointer]:
                - /url: /admin
      - generic [ref=f67e267]:
        - generic [ref=f67e268]:
          - paragraph [ref=f67e269]: © 2026 BHARAT MOTOR CLUB. All rights reserved. Company-operated automotive ecosystem.
          - paragraph [ref=f67e270]: "Non-negotiable Privacy Policy: Private seller identity, private submission records, and documentation are strictly confidential and visible only to authorized BMC acquisition personnel. No public peer-to-peer listings."
        - generic [ref=f67e271]:
          - link "Privacy Policy" [ref=f67e272] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Business" [ref=f67e273] [cursor=pointer]:
            - /url: /terms
          - link "Seller Acquisition Agreement" [ref=f67e274] [cursor=pointer]:
            - /url: /seller-agreement
          - link "Team Login" [ref=f67e275] [cursor=pointer]:
            - /url: /admin
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | /**
  4   |  * BHARAT MOTOR CLUB — End-to-End Browser Automation Suite
  5   |  *
  6   |  * Journey 1: Customer browses certified company-owned resale cars
  7   |  * Journey 2: Private seller submits confidential vehicle intake wizard
  8   |  * Journey 3: Workshop service appointment booking
  9   |  * Journey 4: Inspector uses mobile 120-point checklist
  10  |  * Journey 5: Admin acquisition queue review
  11  |  * Journey 6: Platform structural & SEO verification
  12  |  */
  13  | 
  14  | // ─────────────────────────────────────────────────────────
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
> 50  |     await page.getByRole("link", { name: /browse certified resale/i }).click();
      |                                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  144 |     await expect(page.getByText(/dashboard|overview|admin/i).first()).toBeVisible({ timeout: 10000 });
  145 |   });
  146 | 
  147 |   test("admin acquisition queue loads at /admin/acquisition", async ({ page }) => {
  148 |     await page.goto("/admin/acquisition");
  149 |     await expect(page.getByText(/acquisition|pipeline|intake/i).first()).toBeVisible({ timeout: 10000 });
  150 |   });
```