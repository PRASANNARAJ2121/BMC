import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { generateTaxInvoiceHtml } from "@/lib/services/documents";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Sign in required to view invoice" }, { status: 401 });
    }

    const { id } = await params;
    const html = await generateTaxInvoiceHtml(id);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: unknown) {
    console.error("View invoice error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error generating invoice" },
      { status: 404 }
    );
  }
}

