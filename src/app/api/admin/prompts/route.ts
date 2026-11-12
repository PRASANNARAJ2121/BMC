import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRoles, recordAuditEvent } from "@/lib/auth";

export async function GET() {
  try {
    await requireRoles(["SUPER_ADMIN", "BUSINESS_OWNER"]);

    const prompts = await db.aIPromptTemplate.findMany({
      orderBy: { name: "asc" },
    });

    const parsed = prompts.map((p) => ({
      ...p,
      allowedTools: JSON.parse(p.allowedToolsJson || "[]"),
      outputSchema: JSON.parse(p.outputSchemaJson || "{}"),
    }));

    return NextResponse.json({ prompts: parsed });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden: Administrator privileges required" }, { status: 403 });
    }
    console.error("Get prompt templates error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireRoles(["SUPER_ADMIN"]);
    const body = await req.json();
    const { id, systemPrompt, temperature, maxTokens, approvalStatus } = body;

    const existing = await db.aIPromptTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Prompt template not found" }, { status: 404 });
    }

    const updated = await db.aIPromptTemplate.update({
      where: { id },
      data: {
        systemPrompt: systemPrompt || existing.systemPrompt,
        temperature: temperature !== undefined ? Number(temperature) : existing.temperature,
        maxTokens: maxTokens !== undefined ? Number(maxTokens) : existing.maxTokens,
        approvalStatus: approvalStatus || existing.approvalStatus,
        versionNumber: { increment: 1 },
        approvedById: user.id,
      },
    });

    await recordAuditEvent({
      actorId: user.id,
      actorRole: user.roles[0],
      action: "AI_PROMPT_TEMPLATE_UPDATED",
      entityName: "AIPromptTemplate",
      entityId: id,
      before: { version: existing.versionNumber, systemPrompt: existing.systemPrompt },
      after: { version: updated.versionNumber, systemPrompt: updated.systemPrompt },
    });

    return NextResponse.json({ success: true, prompt: updated });
  } catch (err: unknown) {
    console.error("Update prompt template error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

