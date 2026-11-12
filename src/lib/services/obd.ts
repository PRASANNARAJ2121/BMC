import { db } from "@/lib/db";
import { recordAuditEvent } from "@/lib/auth";

export interface DiagnosticFault {
  code: string;
  category: "POWERTRAIN" | "CHASSIS" | "BODY" | "NETWORK";
  description: string;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  symptom: string;
  recommendedAction: string;
  suggestedLabourHours: number;
  suggestedLabourCost: number;
  suggestedPartName?: string;
}

// Universal SAE J2012 / ISO 15031 Diagnostic Trouble Code Dictionary
export const DTC_DICTIONARY: Record<string, DiagnosticFault> = {
  P0300: {
    code: "P0300",
    category: "POWERTRAIN",
    description: "Random / Multiple Cylinder Misfire Detected",
    severity: "HIGH",
    symptom: "Engine hesitation, rough idling, flashing check engine light",
    recommendedAction: "Inspect spark plug electrode gap, ignition coils, and fuel injector flow rate.",
    suggestedLabourHours: 1.5,
    suggestedLabourCost: 950,
    suggestedPartName: "Iridium Spark Plug Set",
  },
  P0301: {
    code: "P0301",
    category: "POWERTRAIN",
    description: "Cylinder 1 Misfire Detected",
    severity: "MODERATE",
    symptom: "Cylinder 1 loss of power, engine shake under acceleration",
    recommendedAction: "Test Cylinder 1 ignition coil pack and swap with Cylinder 2 to isolate fault.",
    suggestedLabourHours: 1.0,
    suggestedLabourCost: 650,
    suggestedPartName: "Ignition Coil Pack",
  },
  P0171: {
    code: "P0171",
    category: "POWERTRAIN",
    description: "System Too Lean (Bank 1)",
    severity: "MODERATE",
    symptom: "Poor acceleration, increased fuel consumption, lean exhaust odor",
    recommendedAction: "Smoke test intake manifold for vacuum leaks, clean Mass Air Flow (MAF) sensor.",
    suggestedLabourHours: 1.25,
    suggestedLabourCost: 800,
    suggestedPartName: "MAF Sensor Cleaner & Intake Gasket",
  },
  P0420: {
    code: "P0420",
    category: "POWERTRAIN",
    description: "Catalyst System Efficiency Below Threshold (Bank 1)",
    severity: "HIGH",
    symptom: "Emissions test failure, sluggish exhaust response",
    recommendedAction: "Perform upstream and downstream oxygen (O2) sensor waveform analysis.",
    suggestedLabourHours: 1.5,
    suggestedLabourCost: 950,
    suggestedPartName: "Heated Oxygen Sensor (Upstream)",
  },
  P0118: {
    code: "P0118",
    category: "POWERTRAIN",
    description: "Engine Coolant Temperature Sensor 1 Circuit High",
    severity: "HIGH",
    symptom: "Radiator fan running continuously on high, hard cold starts",
    recommendedAction: "Test ECT sensor resistance curve with multimeter and inspect wiring harness.",
    suggestedLabourHours: 0.75,
    suggestedLabourCost: 500,
    suggestedPartName: "Engine Coolant Temperature Sensor",
  },
  C0035: {
    code: "C0035",
    category: "CHASSIS",
    description: "Left Front Wheel Speed Sensor Circuit Fault",
    severity: "HIGH",
    symptom: "ABS and Traction Control warning lights illuminated, loss of ABS braking",
    recommendedAction: "Inspect left front wheel speed sensor tone ring and test sensor harness resistance.",
    suggestedLabourHours: 1.0,
    suggestedLabourCost: 650,
    suggestedPartName: "Front Wheel ABS Speed Sensor",
  },
  C0040: {
    code: "C0040",
    category: "CHASSIS",
    description: "Right Front Wheel Speed Sensor Circuit Fault",
    severity: "HIGH",
    symptom: "ABS warning light, speedometer jitter",
    recommendedAction: "Inspect right front ABS sensor cable for wheel arch chafing.",
    suggestedLabourHours: 1.0,
    suggestedLabourCost: 650,
    suggestedPartName: "Front Wheel ABS Speed Sensor",
  },
  B0001: {
    code: "B0001",
    category: "BODY",
    description: "Driver Frontal Airbag Stage 1 Deployment Control Fault",
    severity: "CRITICAL",
    symptom: "SRS Airbag warning lamp continuously lit",
    recommendedAction: "SAFETY CRITICAL: Test steering column clockspring continuity. Do not apply battery power directly.",
    suggestedLabourHours: 2.0,
    suggestedLabourCost: 1400,
    suggestedPartName: "Steering Column Clockspring Assembly",
  },
  B1000: {
    code: "B1000",
    category: "BODY",
    description: "Electronic Climate Control / AC Evaporator Temperature Sensor Out of Range",
    severity: "MODERATE",
    symptom: "AC compressor cycling erratically, cabin icing up or lukewarm",
    recommendedAction: "Evacuate refrigerant, test evaporator thermistor resistance delta.",
    suggestedLabourHours: 2.0,
    suggestedLabourCost: 1300,
    suggestedPartName: "AC Evaporator Thermistor",
  },
  U0100: {
    code: "U0100",
    category: "NETWORK",
    description: "Lost Communication With ECM / PCM 'A'",
    severity: "CRITICAL",
    symptom: "Vehicle will not crank, multiple warning lamps, loss of instrument cluster telemetry",
    recommendedAction: "Test high-speed CAN-bus 120-ohm termination resistance across OBD pins 6 and 14.",
    suggestedLabourHours: 2.5,
    suggestedLabourCost: 1800,
    suggestedPartName: "Main Powertrain Wiring Harness Repair",
  },
  U0121: {
    code: "U0121",
    category: "NETWORK",
    description: "Lost Communication With Anti-Lock Brake System (ABS) Module",
    severity: "HIGH",
    symptom: "ABS lamp lit, brake warning indicator active",
    recommendedAction: "Verify 12V ignition power feed and ground integrity to ABS electronic control unit.",
    suggestedLabourHours: 1.5,
    suggestedLabourCost: 950,
  },
};

/**
 * Parses raw OBD-II scan data (text, comma-separated, or ELM327 hex strings)
 */
export function parseOBDScanData(rawInput: string): DiagnosticFault[] {
  if (!rawInput || typeof rawInput !== "string") return [];

  // Match standard DTC patterns (P, C, B, U followed by 4 hex digits)
  const dtcRegex = /\b([PCBU][0-9A-Fa-f]{4})\b/g;
  const matches = rawInput.toUpperCase().match(dtcRegex) || [];
  const uniqueCodes = Array.from(new Set(matches));

  return uniqueCodes.map((code) => {
    if (DTC_DICTIONARY[code]) {
      return DTC_DICTIONARY[code];
    }

    // Fallback for codes not in top dictionary
    const prefix = code[0];
    let category: "POWERTRAIN" | "CHASSIS" | "BODY" | "NETWORK" = "POWERTRAIN";
    if (prefix === "C") category = "CHASSIS";
    else if (prefix === "B") category = "BODY";
    else if (prefix === "U") category = "NETWORK";

    return {
      code,
      category,
      description: `Manufacturer-Specific / Standard DTC: ${code}`,
      severity: "MODERATE",
      symptom: "Check Engine or System Tell-Tale Warning Lamp Activated",
      recommendedAction: "Perform guided component test using Bharat Motor Club master diagnostic procedures.",
      suggestedLabourHours: 1.0,
      suggestedLabourCost: 650,
    };
  });
}

export interface IngestOBDResult {
  success: boolean;
  message?: string;
  faults: DiagnosticFault[];
  addedTasksCount: number;
  totalAddedLabour: number;
}

/**
 * Ingests diagnostic scan faults into an active Workshop Job Card.
 * Automatically adds labour tasks and updates diagnostic notes.
 */
export async function ingestOBDScanToJobCard(params: {
  jobCardId: string;
  rawInput: string;
  technicianId?: string;
}): Promise<IngestOBDResult> {
  const { jobCardId, rawInput, technicianId } = params;

  const job = await db.jobCard.findUnique({
    where: { id: jobCardId },
    include: { tasks: true },
  });

  if (!job) throw new Error("Job card not found");

  const faults = parseOBDScanData(rawInput);
  if (faults.length === 0) {
    return {
      success: true,
      message: "No diagnostic trouble codes detected in input.",
      faults: [],
      addedTasksCount: 0,
      totalAddedLabour: 0,
    };
  }

  let totalAddedLabour = 0;
  const addedTasks = [];

  for (const fault of faults) {
    const taskDescription = `OBD-II [${fault.code}]: ${fault.recommendedAction}`;
    
    // Check if task already exists
    const exists = job.tasks.some((t) => t.description.includes(fault.code));
    if (!exists) {
      const task = await db.jobTask.create({
        data: {
          jobCardId,
          description: taskDescription,
          category: fault.category === "BODY" ? "AIR_CONDITIONING" : fault.category === "NETWORK" ? "ELECTRONICS" : "MECHANICAL",
          technicianId: technicianId || job.primaryTechnicianId,
          estimatedHours: fault.suggestedLabourHours,
          labourRate: Math.round(fault.suggestedLabourCost / fault.suggestedLabourHours),
          totalLabourCost: fault.suggestedLabourCost,
          status: "IN_PROGRESS",
        },
      });

      totalAddedLabour += fault.suggestedLabourCost;
      addedTasks.push(task);
    }
  }

  // Update Job Card diagnostic notes and totals
  const faultSummary = faults.map((f) => `[${f.code}] ${f.description} (${f.severity})`).join("; ");
  const updatedNotes = job.diagnosticNotes
    ? `${job.diagnosticNotes}\n[OBD-II Scan]: ${faultSummary}`
    : `[OBD-II Scan]: ${faultSummary}`;

  await db.jobCard.update({
    where: { id: jobCardId },
    data: {
      diagnosticNotes: updatedNotes,
      labourTotal: { increment: totalAddedLabour },
      grandTotal: { increment: totalAddedLabour * 1.18 },
      taxTotal: { increment: totalAddedLabour * 0.18 },
      status: "IN_PROGRESS",
    },
  });

  await recordAuditEvent({
    actorId: technicianId,
    actorRole: "TECHNICIAN",
    action: "OBD_SCAN_INGESTED",
    entityName: "JobCard",
    entityId: jobCardId,
    after: { faultCount: faults.length, addedLabour: totalAddedLabour, codes: faults.map((f) => f.code) },
  });

  return {
    success: true,
    faults,
    addedTasksCount: addedTasks.length,
    totalAddedLabour,
  };
}

