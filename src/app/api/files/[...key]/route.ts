import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { readPrivateFile } from "@/lib/services/storage";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Sign in required to access private documents" }, { status: 401 });
    }

    const { key } = await params;
    const fileKey = key.join("/");

    // Verify access permission for this file key
    const documentRecord = await db.privateDocument.findFirst({
      where: { fileKey },
      include: {
        acquisitionCase: {
          include: { sellerProfile: true },
        },
      },
    });

    if (documentRecord) {
      const isStaff = user.roles.some((r) =>
        ["SUPER_ADMIN", "BUSINESS_OWNER", "ACQUISITION_MANAGER", "INSPECTOR", "COMPLIANCE_OFFICER"].includes(r)
      );

      const isOwner = documentRecord.acquisitionCase.sellerProfile.userId === user.id;

      if (!isStaff && !isOwner) {
        return NextResponse.json({ error: "Forbidden: You do not have permission to view this document" }, { status: 403 });
      }
    }

    const { buffer, fileName } = await readPrivateFile(fileKey);

    // Determine content type
    let contentType = "application/octet-stream";
    if (fileName.endsWith(".pdf")) contentType = "application/pdf";
    else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (fileName.endsWith(".png")) contentType = "image/png";
    else if (fileName.endsWith(".webp")) contentType = "image/webp";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: unknown) {
    console.error("Private file download error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error reading file" },
      { status: 404 }
    );
  }
}

