# BHARAT MOTOR CLUB — DIGITAL PLATFORM
> **"One Club. Every Automotive Need."**  
> Unified company-operated automotive business, confidential vehicle acquisition, certified company-owned resale, multi-disciplinary workshop operations, genuine spare parts, enterprise fleet, membership club, production integrations, and AI platform.

---

## 1. Executive Summary & Business Architecture

Bharat Motor Club (BMC) operates a unified, vertically integrated automotive ecosystem. Unlike decentralized peer-to-peer marketplaces, **BMC is the company-operated counterparty, owner, certifier, and service provider across the entire vehicle lifecycle**.

### Core Non-Negotiable Rules Enforced by System Design:
1. **No Public Peer-to-Peer Listings**: Private seller submissions are confidential acquisition leads for BMC. A private individual never sells directly to a public customer through the platform. Only vehicles purchased by BMC, reconditioned, quality-certified, and legally endorsed enter the public resale catalogue.
2. **Strict Seller Privacy Isolation**: A seller's private intake file, identity proof, contact phone/email, address, and BMC purchase price are visible **only** to the seller and authorized internal BMC staff. They are physically omitted from public database queries, serializers, and AI prompts.
3. **Mandatory Material Disclosure**: While seller identity remains confidential, all material vehicle facts—including ownership count, verified odometer, 120-point technical inspection findings, completed repairs, and known imperfections—must be openly disclosed to buyers. Privacy is never used to conceal vehicle condition.
4. **Resale Prerequisite Gates**: A vehicle cannot be published to the public resale catalogue without passing two hard checkpoints:
   - **Gate 1: Legal Ownership Transfer Approval** (verified RC NOC, no police/challan blacklists, no hypothecation).
   - **Gate 2: Technical QC Inspection Sign-Off** (120-point mechanical, electrical, and structural safety pass).
5. **Operational Financial Integrity**: 
   - Concurrency-safe vehicle reservations preventing double-booking.
   - Live database metrics computed directly from transaction tables (no fake static numbers).
   - Strict spare parts consumption logic preventing negative warehouse inventory.
   - Decimal-safe service invoicing with 18% GST (9% CGST + 9% SGST).
6. **12 Role-Governed AI Assistants**: Built with dedicated tool boundaries, versioned system prompt templates in Prompt Studio, and automated fallback to deterministic domain intelligence when external LLM API keys are unconfigured.

---

## 2. Platform Divisions & Coverage

| # | Division | URL Route | Core Capabilities |
|---|----------|-----------|-------------------|
| 1 | **Private Vehicle Acquisition** | `/seller/submit`<br>`/seller/dashboard`<br>`/admin/acquisition` | Confidential 12-step intake wizard, automated Parivahan/Vahan registry validation, versioned purchase offers, digital purchase agreements, payment settlement, and RTO Form 29/30 tracking. |
| 2 | **Company-Owned Resale** | `/automobiles`<br>`/automobiles/[id]`<br>`/admin/vehicles` | Certified Pre-Owned catalogue, sanitized public vehicle view, 120-point inspection disclosures, 48-hour concurrency-safe reservation holds, and test drive bookings. |
| 3 | **Mechanical Workshop** | `/garage`<br>`/admin/jobs` | Engine diagnostics, transmission overhaul, suspension tuning, brake service, and digital job cards. |
| 4 | **Automotive Electricals** | `/electricals`<br>`/admin/jobs` | Wiring harness repairs, alternator & starter motor diagnostics, battery load testing, and lighting circuits. |
| 5 | **Vehicle Electronics** | `/electronics`<br>`/admin/jobs` | ECU programming, CAN-bus network scanning, ABS/SRS sensor calibration, and key fob programming. |
| 6 | **Car Air-Conditioning** | `/ac`<br>`/admin/jobs` | R134a/R1234yf refrigerant recovery, dual evaporator service, condenser flush, and cabin decontamination. |
| 7 | **Genuine Spare Parts** | `/parts` | SKU inventory management, vehicle fitment compatibility filters, and warehouse stock movement ledgers. |
| 8 | **Vehicle Inspections** | `/inspections` | 120-point technical assessment scope covering powertrain, structural chassis, electrical systems, and road test. |
| 9 | **Enterprise Fleet** | `/fleet` | Fleet onboarding, corporate preventative maintenance, priority workshop SLA, and consolidated billing. |
| 10 | **Membership Club** | `/membership` | Silver, Gold, and Platinum Club tiers, 24/7 roadside assistance, complimentary inspections, and service discounts. |
| 11 | **Technologies & AI Platform** | `/technologies`<br>`/admin/prompts` | 12 persona assistants, AI Prompt Studio with versioning, security sentinel, and full audit logging. |
| 12 | **Executive Operations Command** | `/admin` | Real-time BI analytics computed from live database records across all business divisions. |

---

## 3. Production Integrations

### 1. Document Storage & Secure File Upload
- **Service**: `src/lib/services/storage.ts`
- **Endpoints**:
  - `POST /api/upload`: Handles multipart form uploads with MIME validation (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) and 10MB limits.
  - `GET /api/files/[...key]`: Secure stream endpoint with RBAC checks and path-traversal protection.
- **Storage Isolation**: Private files (seller RC, Aadhaar, PAN) are stored in an isolated directory and never served statically.

### 2. Payment Gateway & Webhook Reconciliation
- **Service**: `src/lib/services/payments.ts`
- **Endpoints**:
  - `POST /api/payments/create-order`: Initiates orders for vehicle reservations (₹10,000), club memberships, or workshop invoices.
  - `POST /api/payments/verify`: Verifies cryptographic HMAC SHA256 signatures and reconciles database ledgers.
  - `POST /api/payments/webhook`: External webhook handler for captured payment events.
- **Gateways**: Official Razorpay integration with automated fallback to cryptographically verified sandbox mode for local development.

### 3. Government Vehicle Registry (Parivahan / Vahan)
- **Service**: `src/lib/services/registry.ts`
- **Endpoint**: `POST /api/admin/verify/vahan`
- **Capabilities**: Validates registration format, extracts state & RTO, verifies vehicle age, checks active hypothecation/financier, checks pending challans, and logs `VerificationTask` entries.

### 4. Multi-Channel Notifications (Email, SMS, WhatsApp)
- **Service**: `src/lib/services/notifications.ts`
- **Triggers**: Automated dispatches for case intake, inspection schedule, purchase offer issuance, payment settlement, workshop appointment confirmation, and invoice readiness.
- **Providers**: Resend/SMTP for Email; Twilio for SMS & WhatsApp.

### 5. Legal Documents & GST Tax Invoices
- **Service**: `src/lib/services/documents.ts`
- **Endpoints**:
  - `GET /api/documents/invoice/[id]`: Official printable GST Tax Invoice with 9% CGST + 9% SGST itemization.
  - `GET /api/documents/agreement/[id]`: Formal Legal Purchase and Transfer Agreement with seller title warranty covenants.

### 6. Live AI LLM (Google Gemini 1.5 Flash)
- **Service**: `src/lib/services/ai.ts`
- **Endpoint**: `POST /api/ai/chat`
- **Features**: Live Google Gemini API with RAG database context injection, 12 persona prompts, tool execution logging, and deterministic fallback when API keys are unconfigured.

---

## 4. Technology Stack

- **Framework**: Next.js 15+ App Router (`react@19`, TypeScript, Turbopack).
- **Database & ORM**: Prisma 7 with `@prisma/adapter-libsql` and SQLite local database (`dev.db`). Compatible with PostgreSQL / MySQL for production deployments.
- **Styling**: Tailwind CSS with custom Bharat Motor Club executive identity (Deep Slate `#0A0F1D`, Saffron `#E05A1B`, and Emerald `#10B981`).
- **Security & RBAC**: HTTP-only session cookies, bcrypt password hashing, and role checks across 17 granular organization roles.
- **Testing**: Vitest with unit, integration, and security test suites.

---

## 5. Getting Started & Local Setup

### Prerequisites
- Node.js 20+ or 22+
- npm 10+

### Installation & Initialization

1. **Install Dependencies**:
   ```bash
   cd bmc-platform
   npm install
   ```

2. **Database Push & Client Generation**:
   ```bash
   npx prisma db push
   ```

3. **Seed Database with Roles, Branch, Catalogues & AI Templates**:
   ```bash
   npx tsx src/lib/run-seed.ts
   ```

4. **Run Automated Test Suite (23 Tests)**:
   ```bash
   npm test
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Production Build & Verification**:
   ```bash
   npm run build
   npm start
   ```

---

## 6. Seeded Credentials & Initial Accounts

The seed script initializes the central headquarters (`BMC-HQ`) and the default business administrator:

- **Admin Email**: `admin@bharatmotorclub.local`
- **Admin Password**: `BharatMotorClub@2026!`
- **Assigned Roles**: `SUPER_ADMIN`, `BUSINESS_OWNER`

---

## 7. Verification & Test Suite Summary

```
 RUN  v5.1.0 P:/pras/bharat motor club/bmc-platform

 ✓ tests/workshop.test.ts (2 tests)
 ✓ tests/ai.test.ts (2 tests)
 ✓ tests/lifecycle.test.ts (2 tests)
 ✓ tests/resale.test.ts (3 tests)
 ✓ tests/security.test.ts (2 tests)
 ✓ tests/integrations.test.ts (10 tests)
 ✓ tests/acquisition.test.ts (2 tests)

 Test Files  7 passed (7)
      Tests  23 passed (23)
```

## Phase D – Telematics & Hardware Integration

- **OBD‑II Diagnostic Service** – `/api/telematics/obd/scan` parses SAE J2012 DTC codes, auto‑creates labour tasks, and updates job card totals with GST (18 %).
- **FASTag Automated Gate** – `/api/telematics/fastag` validates entry appointments, logs walk‑ins, and enforces payment‑guarded exit barriers.
- **Comprehensive Unit Tests** – `tests/telematics.test.ts` covers parsing, ingestion, and gate logic.
- **Playwright E2E Suite** – `e2e/journeys.spec.ts` validates end‑to‑end user journeys across all phases (customer browse, seller intake, workshop booking, inspector auth flow, admin portals, API health checks, and security guards).

## Development & CI
- Run unit tests: `npm test`
- Run full build: `npm run build`
- Run Playwright E2E tests: `npx playwright test`
- CI pipeline runs both unit and E2E suites ensuring full coverage.
