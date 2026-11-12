import { db } from "@/lib/db";
import { AuthUser } from "@/lib/auth";

export interface AgentContext {
  user: AuthUser | null;
  agentType: string;
  query: string;
  caseId?: string;
  vehicleStockNumber?: string;
}

export async function executeAgent(context: AgentContext) {
  const { user, agentType, query, caseId, vehicleStockNumber } = context;

  // 1. Load approved prompt template from Prompt Studio
  const template = await db.aIPromptTemplate.findFirst({
    where: { name: agentType, approvalStatus: "APPROVED" },
    orderBy: { versionNumber: "desc" },
  });

  if (!template) {
    throw new Error(`AI_AGENT_NOT_FOUND: No approved template for agent type '${agentType}'`);
  }

  // 2. Authorization and Security Boundary Enforcement
  const userRole = user?.roles[0] || "ANONYMOUS";

  // Strict rule: Public agents cannot access private cases
  if (["public_customer_assistant", "buyer_vehicle_discovery"].includes(agentType)) {
    if (caseId) {
      throw new Error("SECURITY_VIOLATION: Public agents are strictly forbidden from accessing private acquisition cases");
    }
  }

  // Strict rule: Seller assistant can ONLY access case belonging to that seller
  if (agentType === "private_seller_assistant") {
    if (!user) throw new Error("UNAUTHORIZED: Sign in required for seller advisor");
    if (caseId) {
      const sellerProfile = await db.sellerProfile.findUnique({ where: { userId: user.id } });
      const acqCase = await db.acquisitionCase.findUnique({ where: { id: caseId } });
      if (!acqCase || acqCase.sellerProfileId !== sellerProfile?.id) {
        throw new Error("FORBIDDEN: Cannot access another seller's private case");
      }
    }
  }

  // Strict rule: Internal agents require staff role
  if (
    [
      "acquisition_case_summarizer",
      "valuation_research_assistant",
      "inspection_report_drafting",
      "internal_management_copilot",
    ].includes(agentType)
  ) {
    const isStaff = user?.roles.some((r) =>
      ["SUPER_ADMIN", "BUSINESS_OWNER", "ACQUISITION_MANAGER", "ACQUISITION_EXECUTIVE", "INSPECTOR", "FINANCE_OFFICER", "WORKSHOP_MANAGER"].includes(r)
    );
    if (!isStaff) {
      throw new Error("FORBIDDEN: Internal staff privileges required");
    }
  }

  // 3. Execution via Live Gemini API or Deterministic Engine
  const geminiKey = process.env.GEMINI_API_KEY;
  let responseText = "";
  const toolsInvoked: string[] = [];
  const startTime = Date.now();

  // Retrieve contextual database knowledge for RAG injection
  const contextualKnowledge = await getContextualDomainData({
    agentType,
    query,
    caseId,
    vehicleStockNumber,
    toolsInvoked,
  });

  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: `${template.systemPrompt}\n\nContextual Bharat Motor Club verified data:\n${contextualKnowledge}` }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: query }],
              },
            ],
            generationConfig: {
              temperature: template.temperature || 0.3,
              maxOutputTokens: template.maxTokens || 1024,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generated) {
          responseText = generated;
        } else {
          throw new Error("Empty candidate from Gemini API");
        }
      } else {
        throw new Error(`Gemini API error status: ${res.status}`);
      }
    } catch (err) {
      console.warn("Gemini live API invocation error, falling back to BMC deterministic domain response:", err);
      responseText = contextualKnowledge;
    }
  } else {
    // Graceful verified deterministic domain intelligence
    responseText = contextualKnowledge;
  }

  const latencyMs = Date.now() - startTime;

  // 4. Record to AIAuditLog for compliance & governance
  await db.aIAuditLog.create({
    data: {
      agentType,
      userId: user?.id,
      userRole,
      promptUsed: template.systemPrompt.slice(0, 500),
      modelResponseRedacted: responseText.slice(0, 500),
      toolsInvokedJson: JSON.stringify(toolsInvoked),
      latencyMs: Math.max(latencyMs, 10),
    },
  });

  return {
    reply: responseText,
    agentType,
    toolsUsed: toolsInvoked,
    isAIAssisted: true,
  };
}

// Contextual RAG retriever providing real database knowledge to prompts
async function getContextualDomainData(params: {
  agentType: string;
  query: string;
  caseId?: string;
  vehicleStockNumber?: string;
  toolsInvoked: string[];
}): Promise<string> {
  const { agentType, query, caseId, vehicleStockNumber, toolsInvoked } = params;

  if (agentType === "public_customer_assistant") {
    toolsInvoked.push("search_public_divisions");
    return (
      "Bharat Motor Club — One Club. Every Automotive Need.\n\n" +
      "We operate a fully integrated, company-operated automotive business across 10 specialized divisions:\n" +
      "1. Automobiles: Certified used vehicle resale and confidential private vehicle acquisition.\n" +
      "2. Garage: Periodic maintenance, mechanical overhauls, engine & suspension.\n" +
      "3. Electricals: Battery diagnostics, wiring harnesses, starter motors & alternators.\n" +
      "4. Electronics: ECU diagnostics, infotainment systems, audio & reversing cameras.\n" +
      "5. AC: Cooling diagnostics, compressor overhauls, refrigerant evacuation & leak testing.\n" +
      "6. Parts: Genuine OEM and certified aftermarket spare parts.\n" +
      "7. Inspections: 120-point pre-purchase and condition certifications.\n" +
      "8. Fleet: Tailored multi-vehicle corporate contracts and scheduled maintenance.\n" +
      "9. Membership: Priority bay access, labour discounts, and 24/7 roadside assistance.\n\n" +
      "All services are backed by Bharat Motor Club warranty and centralized GST invoicing."
    );
  }

  if (agentType === "buyer_vehicle_discovery") {
    toolsInvoked.push("query_approved_resale_listings");
    const listings = await db.publicVehicleListing.findMany({
      where: { isPublished: true, reservationStatus: "AVAILABLE" },
      take: 4,
      select: { make: true, model: true, year: true, askingPrice: true, mileageKm: true, stockNumber: true, bodyType: true },
    });

    if (listings.length === 0) {
      return "Currently all certified company-owned vehicles are undergoing multi-point technical reconditioning or have active reservation holds. New certified vehicles are published daily as legal clearance and QC pass.";
    }

    const summary = listings
      .map(
        (l) =>
          `• ${l.year} ${l.make} ${l.model} (${l.stockNumber}) — ₹${l.askingPrice.toLocaleString("en-IN")} | ${l.mileageKm.toLocaleString("en-IN")} km | ${l.bodyType}`
      )
      .join("\n");

    return `Current Bharat Motor Club Certified Pre-Owned Resale Inventory:\n\n${summary}\n\nEach certified vehicle includes a 120-point technical inspection pass, 6-month powertrain warranty, and full material history disclosure.`;
  }

  if (agentType === "private_seller_assistant" && caseId) {
    toolsInvoked.push("query_confidential_seller_case");
    const acqCase = await db.acquisitionCase.findUnique({
      where: { id: caseId },
      include: {
        vehicleDetails: true,
        purchaseOffers: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!acqCase) return "Case record not found.";

    const offer = acqCase.purchaseOffers[0];
    return `Confidential Acquisition Case Status (${acqCase.caseNumber}):\n` +
      `Current Stage: ${acqCase.status.replace(/_/g, " ")}\n` +
      `Vehicle: ${acqCase.vehicleDetails?.year} ${acqCase.vehicleDetails?.make} ${acqCase.vehicleDetails?.model}\n` +
      `Offer Status: ${offer ? "₹" + offer.offeredPrice.toLocaleString("en-IN") + " (" + offer.status + ")" : "Under Technical Valuation"}\n` +
      `Privacy Guarantee: Your identity, contact details, and submission remain strictly isolated and confidential to Bharat Motor Club acquisition officers.`;
  }

  if (agentType === "diagnostic_advisor") {
    toolsInvoked.push("query_workshop_diagnostic_rules");
    return (
      "Bharat Motor Club Master Diagnostic Assistant:\n" +
      "• Mechanical: Engine misfire, timing belt, brake rotor wear, suspension bushing play.\n" +
      "• Electricals: Alternator voltage drop, parasitic battery drain, harness continuity.\n" +
      "• Electronics: OBD-II DTC trouble codes, CAN-bus communication faults, ABS sensor signals.\n" +
      "• Air-Conditioning: R134a/R1234yf pressure delta, condenser airflow, expansion valve blockage.\n\n" +
      "You can schedule a dedicated bay inspection at our Central Workshop via the /garage page."
    );
  }

  if (agentType === "parts_compatibility_specialist") {
    toolsInvoked.push("search_parts_inventory");
    const parts = await db.product.findMany({
      where: { active: true },
      take: 4,
      select: { sku: true, name: true, category: true, sellingPrice: true, stockQuantity: true },
    });

    const partsList = parts
      .map((p) => `• ${p.name} (SKU: ${p.sku}) — ₹${p.sellingPrice} [Stock: ${p.stockQuantity}]`)
      .join("\n");

    return `Bharat Motor Club Spare Parts Catalogue:\n\n${partsList}\n\nAll spare parts are certified genuine OEM/OES with manufacturer warranty.`;
  }

  if (agentType === "fleet_advisor") {
    toolsInvoked.push("get_fleet_accounts");
    const fleetAccounts = await db.fleetAccount.findMany({
      where: { status: "ACTIVE" },
      take: 5,
      include: {
        _count: { select: { vehicles: true } },
        contracts: { where: { active: true }, take: 1 },
      },
    });
    if (fleetAccounts.length === 0) {
      return "No active fleet accounts found. Register your company fleet at Bharat Motor Club for priority maintenance SLAs, consolidated GST billing, and dedicated bay allocation.";
    }
    const summary = fleetAccounts
      .map(
        (f) =>
          `• ${f.companyName} (${f.accountCode}): ${f._count.vehicles} vehicle${f._count.vehicles !== 1 ? "s" : ""}${
            f.contracts[0] ? " | Active contract: " + f.contracts[0].contractNumber : ""
          }`
      )
      .join("\n");
    return `Active BMC Fleet Accounts:\n\n${summary}\n\nAll fleet vehicles receive priority workshop scheduling, preventive maintenance alerts, and consolidated quarterly invoicing.`;
  }

  if (agentType === "parts_recommender") {
    toolsInvoked.push("search_parts_inventory");
    const parts = await db.product.findMany({
      where: { active: true, stockQuantity: { gt: 0 } },
      take: 6,
      select: { sku: true, name: true, category: true, sellingPrice: true, stockQuantity: true },
    });
    const partsList = parts
      .map((p) => `• [${p.category}] ${p.name} (SKU: ${p.sku}) — ₹${p.sellingPrice.toLocaleString("en-IN")} | In Stock: ${p.stockQuantity}`)
      .join("\n");
    return `Bharat Motor Club In-Stock Genuine Spare Parts:\n\n${partsList}\n\nAll parts carry manufacturer warranty. Share your vehicle make, model, year, and issue for a fitment-specific recommendation.`;
  }

  toolsInvoked.push("general_assistant_guidance");
  return `Thank you for consulting Bharat Motor Club. Our team of certified automotive specialists, technicians, and advisors are available across our workshop branches and digital concierge to serve your vehicle requirements.`;
}
