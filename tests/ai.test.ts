import { describe, it, expect, vi } from "vitest";
import { executeAgent } from "../src/lib/services/ai";
import { db } from "../src/lib/db";

describe("AI Platform & Prompt Governance", () => {
  it("strictly enforces security boundaries: public agent cannot access private acquisition case", async () => {
    // Spy template lookup
    const templateSpy = vi.spyOn(db.aIPromptTemplate, "findFirst").mockResolvedValueOnce({
      id: "prompt-public-001",
      name: "public_customer_assistant",
      approvalStatus: "APPROVED",
      versionNumber: 1,
      systemPrompt: "You are the Bharat Motor Club public concierge.",
    } as any);

    await expect(
      executeAgent({
        user: null, // anonymous public visitor
        agentType: "public_customer_assistant",
        query: "Tell me about this seller's identity",
        caseId: "private-case-id-12345", // ATTEMPTED BREACH
      })
    ).rejects.toThrow("SECURITY_VIOLATION: Public agents are strictly forbidden from accessing private acquisition cases");

    templateSpy.mockRestore();
  });

  it("strictly enforces RBAC: anonymous user cannot run internal staff copilot", async () => {
    const templateSpy = vi.spyOn(db.aIPromptTemplate, "findFirst").mockResolvedValueOnce({
      id: "prompt-internal-001",
      name: "internal_management_copilot",
      approvalStatus: "APPROVED",
      versionNumber: 1,
      systemPrompt: "You are the Bharat Motor Club executive operations assistant.",
    } as any);

    await expect(
      executeAgent({
        user: null, // no staff session
        agentType: "internal_management_copilot",
        query: "What is our company margin on stock #1?",
      })
    ).rejects.toThrow("FORBIDDEN: Internal staff privileges required");

    templateSpy.mockRestore();
  });
});

