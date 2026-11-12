# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: journeys.spec.ts >> Journey 2: Private Seller Intake Wizard >> seller wizard step navigation works with Next/Previous buttons
- Location: e2e\journeys.spec.ts:70:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/step 2/i).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/step 2/i).first() with timeout 5000ms
  - waiting for getByText(/step 2/i).first()
    3 × waiting for "http://localhost:3000/seller/submit" navigation to finish...
      - navigated to "http://localhost:3000/seller/submit"
    - waiting for navigation to finish...
    - navigated to "http://localhost:3000/seller/submit"

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
  - heading "Confidential Vehicle Acquisition Intake" [level=1]
  - paragraph: Sell directly to Bharat Motor Club. Your submission and contact details remain strictly confidential. We evaluate vehicle condition, verify ownership, and buy the car directly through the company. No public P2P listings.
  - text: "Step 1 of 4: Vehicle Identification 25% Complete Make"
  - textbox "e.g. Maruti Suzuki, Hyundai, Tata": Maruti Suzuki
  - text: Model
  - textbox "e.g. Swift, Creta, Nexon": Swift
  - text: Variant
  - textbox "e.g. ZXi, SX(O), Creative": ZXi
  - text: Manufacturing Year
  - spinbutton: "2021"
  - text: Registration Number
  - textbox "e.g. TN09CC4521": TN09CC4521
  - text: Used exclusively for BMC RTO verification. Never published publicly.
  - button "Save Draft"
  - button "Continue"
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
> 82  |       await expect(page.getByText(/step 2/i).first()).toBeVisible({ timeout: 5000 });
      |                                                       ^ Error: expect(locator).toBeVisible() failed
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
```