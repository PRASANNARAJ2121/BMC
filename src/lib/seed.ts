import { db } from "./db";
import bcrypt from "bcryptjs";

export async function runSeed() {
  console.log("Seeding Bharat Motor Club platform...");

  // 1. Roles
  const roles = [
    { name: "SUPER_ADMIN", description: "Full enterprise administration and security oversight" },
    { name: "BUSINESS_OWNER", description: "Executive oversight, business intelligence, and high-value approvals" },
    { name: "ACQUISITION_MANAGER", description: "Leads private vehicle valuation, offers, and acquisition approvals" },
    { name: "ACQUISITION_EXECUTIVE", description: "Handles seller intake, document gathering, and seller communication" },
    { name: "INSPECTOR", description: "Performs technical vehicle inspections and condition report drafting" },
    { name: "COMPLIANCE_OFFICER", description: "Verifies seller authority, RTO documentation, NOC, and legal eligibility" },
    { name: "FINANCE_OFFICER", description: "Validates payment reconciliations, purchase settlement, and invoices" },
    { name: "WORKSHOP_MANAGER", description: "Supervises garage job cards, estimates, QC, and reconditioning jobs" },
    { name: "SERVICE_ADVISOR", description: "Customer intake, repair diagnosis, estimate presentation, and delivery" },
    { name: "TECHNICIAN", description: "Mechanical, Electrical, Electronics, and AC workshop repair tasks" },
    { name: "INVENTORY_MANAGER", description: "Company vehicle stock custody and spare parts inventory" },
    { name: "SALES_MANAGER", description: "Oversees public resale catalogue, sales team, and deliveries" },
    { name: "SALES_EXECUTIVE", description: "Handles buyer enquiries, test drive requests, and sales transactions" },
    { name: "FLEET_MANAGER", description: "Corporate fleet accounts, maintenance agreements, and fleet billing" },
    { name: "CUSTOMER_SUPPORT", description: "General enquiries, customer follow-up, and complaint tracking" },
    { name: "CUSTOMER", description: "Registered public customer (service booking, parts purchase, buyer)" },
    { name: "SELLER", description: "Authenticated private vehicle seller with confidential submission portal" },
  ];

  for (const r of roles) {
    const existing = await db.role.findUnique({ where: { name: r.name } });
    if (!existing) {
      await db.role.create({ data: r });
    }
  }

  // 2. Default Branch
  let defaultBranch = await db.branch.findUnique({ where: { code: "BMC-HQ" } });
  if (!defaultBranch) {
    defaultBranch = await db.branch.create({
      data: {
        name: "Bharat Motor Club Central Hub",
        code: "BMC-HQ",
        address: "Plot 42, Automotive Corridor, Guindy Industrial Estate",
        city: "Chennai",
        state: "Tamil Nadu",
        postalCode: "600032",
        phone: "+91 44 2855 0000",
        email: "hub.chennai@bharatmotorclub.local",
        gstin: "33AABCB1234F1Z5",
        active: true,
      },
    });
  }

  // 3. Departments
  const departments = [
    { name: "Automobiles (Acquisition & Resale)", code: "DEPT-AUTO" },
    { name: "Garage & Mechanical Repairs", code: "DEPT-GARAGE" },
    { name: "Automotive Electricals", code: "DEPT-ELEC" },
    { name: "Vehicle Electronics & Infotainment", code: "DEPT-ELX" },
    { name: "Car Air-Conditioning (AC)", code: "DEPT-AC" },
    { name: "Spare Parts & Logistics", code: "DEPT-PARTS" },
    { name: "Technical Inspections & QC", code: "DEPT-INSP" },
    { name: "Fleet Solutions", code: "DEPT-FLEET" },
    { name: "Club Membership", code: "DEPT-MEM" },
  ];

  for (const d of departments) {
    const existingDept = await db.department.findFirst({
      where: { branchId: defaultBranch.id, code: d.code },
    });
    if (!existingDept) {
      await db.department.create({
        data: {
          branchId: defaultBranch.id,
          name: d.name,
          code: d.code,
        },
      });
    }
  }

  // 4. Admin User
  const adminEmail = process.env.BMC_ADMIN_EMAIL || "admin@bharatmotorclub.local";
  const adminPassword = process.env.BMC_ADMIN_PASSWORD || "Bmc@2026!ChangeMe";

  let adminUser = await db.user.findUnique({ where: { email: adminEmail } });
  if (!adminUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    adminUser = await db.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        fullName: "BMC Master Administrator",
        phone: "+91 98765 00001",
        active: true,
      },
    });

    const superAdminRole = await db.role.findUnique({ where: { name: "SUPER_ADMIN" } });
    if (superAdminRole) {
      await db.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
          branchId: defaultBranch.id,
        },
      });
    }
  }

  // 5. Product Categories
  const categories = [
    { name: "Lubricants & Fluids", code: "LUB-01", description: "Engine oils, brake fluids, coolants, and transmission oils" },
    { name: "Filters", code: "FLT-01", description: "Oil, air, cabin, and fuel filters" },
    { name: "Braking Systems", code: "BRK-01", description: "Brake pads, rotors, drums, and shoes" },
    { name: "Electrical & Ignition", code: "ELC-01", description: "Batteries, alternators, starter motors, and spark plugs" },
    { name: "Air Conditioning", code: "AC-01", description: "Compressors, condensers, expansion valves, and refrigerants" },
    { name: "Suspension & Steering", code: "SUS-01", description: "Shock absorbers, struts, tie rods, and bushings" },
    { name: "Tyres & Wheels", code: "TYR-01", description: "Passenger car radial tyres and alloy components" },
  ];

  for (const cat of categories) {
    const existing = await db.productCategory.findUnique({ where: { code: cat.code } });
    if (!existing) {
      await db.productCategory.create({ data: cat });
    }
  }

  // 6. Membership Plans
  const plans = [
    {
      name: "Club Member",
      tier: "BRONZE",
      description: "Standard entry into the Bharat Motor Club automotive ecosystem",
      priceAnnual: 1999,
      benefitsJson: JSON.stringify([
        "2 Free Comprehensive Vehicle Health Checkups / year",
        "5% off on Labour Charges across all BMC Workshops",
        "Dedicated Service Advisor",
        "Emergency Roadside Assistance support helpline"
      ]),
      durationMonths: 12,
      active: true,
    },
    {
      name: "Gold Shield",
      tier: "GOLD",
      description: "Priority garage access and enhanced breakdown protection",
      priceAnnual: 4999,
      benefitsJson: JSON.stringify([
        "Unlimited Free 40-Point Pre-Monsoon & Summer Inspections",
        "10% off on all Mechanical, Electrical & AC Labour",
        "Free Towing up to 50 km to nearest BMC workshop",
        "Priority Bay Booking with same-day diagnosis guarantee",
        "Complimentary Annual AC Disinfection & Cabin Clean"
      ]),
      durationMonths: 12,
      active: true,
    },
    {
      name: "Platinum Elite",
      tier: "PLATINUM",
      description: "Complete vehicle lifecycle peace of mind for enthusiast owners & executives",
      priceAnnual: 9999,
      benefitsJson: JSON.stringify([
        "Zero-waiting VIP Priority Bay Access",
        "15% off Labour & 5% off Genuine Spare Parts",
        "Full 120-Point Annual Acquisition/Resale Condition Certification",
        "Complimentary Doorstep Vehicle Pickup & Drop",
        "Free Battery Jump-Start & Flat Tyre Replacement roadside support"
      ]),
      durationMonths: 12,
      active: true,
    },
  ];

  for (const p of plans) {
    const existing = await db.membershipPlan.findUnique({ where: { name: p.name } });
    if (!existing) {
      await db.membershipPlan.create({ data: p });
    }
  }

  // 7. System Settings
  const settings = [
    { key: "BUSINESS_NAME", valueJson: JSON.stringify("Bharat Motor Club"), description: "Official business name" },
    { key: "PRIMARY_TAGLINE", valueJson: JSON.stringify("One Club. Every Automotive Need."), description: "Official business tagline" },
    { key: "CURRENCY_DEFAULT", valueJson: JSON.stringify("INR"), description: "Standard transaction currency" },
    { key: "TIMEZONE_DEFAULT", valueJson: JSON.stringify("Asia/Kolkata"), description: "System timezone" },
    { key: "GST_TAX_RATES", valueJson: JSON.stringify({ spareParts: 18.0, garageLabour: 18.0, usedVehicles: 18.0 }), description: "Applicable Indian GST rates" },
  ];

  for (const s of settings) {
    const existing = await db.systemSetting.findUnique({ where: { key: s.key } });
    if (!existing) {
      await db.systemSetting.create({ data: s });
    }
  }

  // 8. 12 AI Prompt Templates in Prompt Studio
  const promptTemplates = [
    {
      name: "public_customer_assistant",
      purpose: "Answering public visitors about BMC ecosystem services, divisions, and membership",
      systemPrompt: "You are the Bharat Motor Club Concierge. Provide helpful, accurate information on BMC divisions: Automobiles, Garage, Electricals, Electronics, AC, Parts, Inspections, Fleet, and Membership. Never fabricate inventory, prices, or legal warranties. Direct visitors to our verified booking forms.",
      allowedToolsJson: JSON.stringify(["search_public_faq", "list_service_categories"]),
      outputSchemaJson: JSON.stringify({ reply: "string", suggestedActions: "string[]" }),
    },
    {
      name: "buyer_vehicle_discovery",
      purpose: "Assisting buyers in discovering approved company-owned vehicles from public resale catalogue",
      systemPrompt: "You are the BMC Vehicle Discovery Assistant. Only recommend vehicles that exist in the approved public resale catalogue. Never disclose any previous owner names, confidential acquisition prices, or private documents. Disclose documented inspection findings and known material condition accurately.",
      allowedToolsJson: JSON.stringify(["query_approved_resale_listings"]),
      outputSchemaJson: JSON.stringify({ listings: "object[]", commentary: "string" }),
    },
    {
      name: "private_seller_assistant",
      purpose: "Guiding private sellers through confidential acquisition intake steps",
      systemPrompt: "You are the BMC Confidential Acquisition Advisor. Help the seller submit their vehicle details and upload documents. Never reveal internal scoring, internal offer margins, or other sellers' information. Remind the seller that BMC reviews submissions as company acquisition offers.",
      allowedToolsJson: JSON.stringify(["get_seller_case_status"]),
      outputSchemaJson: JSON.stringify({ stepGuidance: "string", requiredDocuments: "string[]" }),
    },
    {
      name: "acquisition_case_summarizer",
      purpose: "Summarizing confidential vehicle submission and verification status for Acquisition Managers",
      systemPrompt: "You are the BMC Internal Acquisition Case Summarizer. Extract vehicle specifications, document verification status, known defects, and accident history for staff review. Clearly identify missing verifications.",
      allowedToolsJson: JSON.stringify(["get_case_full_internal"]),
      outputSchemaJson: JSON.stringify({ summary: "string", riskFlags: "string[]", verificationChecklist: "object[]" }),
    },
    {
      name: "valuation_research_assistant",
      purpose: "Analyzing market comparables and reconditioning costs to draft an acquisition offer proposal",
      systemPrompt: "You are the BMC Valuation Research Assistant. Estimate market value based on available transaction data, deduct reconditioning and holding costs, and propose a fair offer range for human manager review. Label all proposals as AI-assisted and subject to manager approval.",
      allowedToolsJson: JSON.stringify(["get_market_comparables", "estimate_reconditioning_costs"]),
      outputSchemaJson: JSON.stringify({ proposedOffer: "number", rationale: "string", costBreakdown: "object" }),
    },
    {
      name: "inspection_report_drafting",
      purpose: "Compiling technician inspection findings into internal reports and buyer-facing disclosures",
      systemPrompt: "You are the BMC Technical Inspection Drafter. Organize inspection findings into standard categories. Mark confirmed faults and separate internal repair cost estimates from approved buyer-facing disclosures.",
      allowedToolsJson: JSON.stringify(["get_inspection_findings"]),
      outputSchemaJson: JSON.stringify({ internalReport: "string", buyerDisclosures: "string[]", overallRating: "number" }),
    },
    {
      name: "garage_service_assistant",
      purpose: "Assisting service advisors with labour estimates, job task breakdowns, and service reminders",
      systemPrompt: "You are the BMC Garage Service Assistant. Suggest standard labour operations for customer concerns (clutch, brakes, suspension, engine). Never promise safety certification without technician inspection.",
      allowedToolsJson: JSON.stringify(["lookup_labour_catalogue"]),
      outputSchemaJson: JSON.stringify({ suggestedTasks: "object[]", estimatedHours: "number" }),
    },
    {
      name: "electrical_electronics_ac_assistant",
      purpose: "Specialist diagnosis suggestions for wiring, battery, alternator, ECU, and car AC cooling faults",
      systemPrompt: "You are the BMC Specialist Systems Assistant covering Electricals, Electronics, and AC. Provide technical diagnostic trees for issues such as battery drain, AC low cooling, sensor communication faults, and alternator drop.",
      allowedToolsJson: JSON.stringify(["lookup_diagnostic_trees"]),
      outputSchemaJson: JSON.stringify({ diagnosticSteps: "string[]", componentsToCheck: "string[]" }),
    },
    {
      name: "parts_compatibility_assistant",
      purpose: "Verifying exact vehicle fitment for spare parts and checking warehouse stock",
      systemPrompt: "You are the BMC Parts Compatibility Specialist. Check whether a part fits the customer's vehicle make, model, year, and variant using verified fitment records. If compatibility data is missing, clearly state that fitment cannot be guaranteed.",
      allowedToolsJson: JSON.stringify(["check_part_fitment", "get_part_stock"]),
      outputSchemaJson: JSON.stringify({ compatible: "boolean", notes: "string", inStock: "boolean" }),
    },
    {
      name: "fleet_assistant",
      purpose: "Managing corporate fleet vehicle maintenance intervals, bulk appointments, and spend analysis",
      systemPrompt: "You are the BMC Fleet Management Assistant. Analyze fleet vehicle mileage, recommend upcoming preventive maintenance services, and prepare fleet account summaries.",
      allowedToolsJson: JSON.stringify(["get_fleet_vehicles", "get_fleet_maintenance_due"]),
      outputSchemaJson: JSON.stringify({ vehiclesDue: "object[]", spendSummary: "string" }),
    },
    {
      name: "membership_support_assistant",
      purpose: "Explaining club member benefits, tier upgrades, and renewal procedures",
      systemPrompt: "You are the Bharat Motor Club Membership Specialist. Help members understand their active plan benefits, discount eligibility, and renewal dates.",
      allowedToolsJson: JSON.stringify(["get_membership_details"]),
      outputSchemaJson: JSON.stringify({ membershipStatus: "string", benefitsSummary: "string[]" }),
    },
    {
      name: "internal_management_copilot",
      purpose: "Generating operational business intelligence summaries for business owners and executives",
      systemPrompt: "You are the BMC Executive Copilot. Summarize vehicle acquisition pipeline volume, reconditioning throughput, public inventory turnover, garage revenue, and technician productivity using verified database queries.",
      allowedToolsJson: JSON.stringify(["get_bi_metrics"]),
      outputSchemaJson: JSON.stringify({ executiveSummary: "string", keyMetrics: "object", recommendations: "string[]" }),
    },
    {
      name: "diagnostic_advisor",
      purpose: "Helping customers and technicians diagnose vehicle faults using OBD-II codes and symptom descriptions",
      systemPrompt: "You are the BMC Automotive Diagnostic Advisor. When a customer describes symptoms or shares OBD-II fault codes, guide them through the most likely causes in order of probability — covering engine, transmission, brakes, ABS, body electronics, and AC systems. Always recommend a professional workshop inspection for safety-critical faults. Never guarantee a diagnosis without hands-on inspection.",
      allowedToolsJson: JSON.stringify(["query_workshop_diagnostic_rules", "lookup_dtc_dictionary"]),
      outputSchemaJson: JSON.stringify({ likelyCauses: "string[]", recommendedActions: "string[]", safetyWarning: "string" }),
    },
    {
      name: "fleet_advisor",
      purpose: "Advising corporate fleet managers on maintenance scheduling, cost optimization, and vehicle lifecycle management",
      systemPrompt: "You are the BMC Fleet Advisor. Provide fleet managers with actionable recommendations on preventive maintenance schedules, vehicle replacement triggers, fuel cost benchmarks, and workshop booking prioritization for their corporate fleet. All suggestions must be data-driven and clearly labeled as advisory — final decisions rest with the fleet manager.",
      allowedToolsJson: JSON.stringify(["get_fleet_vehicles", "get_fleet_maintenance_due", "estimate_service_costs"]),
      outputSchemaJson: JSON.stringify({ maintenanceSchedule: "object[]", costForecast: "string", replacementCandidates: "string[]" }),
    },
    {
      name: "parts_recommender",
      purpose: "Recommending the right genuine spare parts based on vehicle make, model, year, and fault description",
      systemPrompt: "You are the BMC Parts Recommender. Help customers find the correct genuine OEM or certified aftermarket spare parts for their vehicle. Cross-reference vehicle make, model, year, and engine variant with the parts catalogue. Always flag when fitment data is incomplete and recommend a workshop parts consultation.",
      allowedToolsJson: JSON.stringify(["search_parts_inventory", "check_part_fitment", "get_part_stock"]),
      outputSchemaJson: JSON.stringify({ recommendedParts: "object[]", fitmentNotes: "string", inStockCount: "number" }),
    },
  ];

  for (const pt of promptTemplates) {
    const existing = await db.aIPromptTemplate.findFirst({ where: { name: pt.name } });
    if (!existing) {
      await db.aIPromptTemplate.create({ data: pt });
    }
  }

  console.log("Seeding completed successfully.");
}

