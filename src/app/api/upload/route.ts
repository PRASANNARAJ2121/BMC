import { NextResponse } from "next/server";
import { getSessionUser, recordAuditEvent } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/services/storage";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Sign in required to upload files" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = (formData.get("documentType") as string) || "GENERAL_DOCUMENT";
    const caseId = (formData.get("caseId") as string) || null;
    const isPrivate = formData.get("isPrivate") !== "false"; // default true for safety

    if (!file) {
      return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
    }

    // If attached to a private seller case, verify ownership or staff permissions
    if (caseId) {
      const acqCase = await db.acquisitionCase.findUnique({
        where: { id: caseId },
        include: { sellerProfile: true },
      });

      if (!acqCase) {
        return NextResponse.json({ error: "Case not found" }, { status: 404 });
      }

      const isStaff = user.roles.some((r) =>
        ["SUPER_ADMIN", "BUSINESS_OWNER", "ACQUISITION_MANAGER", "INSPECTOR"].includes(r)
      );

      if (!isStaff && acqCase.sellerProfile.userId !== user.id) {
        return NextResponse.json({ error: "Forbidden: Cannot upload documents to another seller's case" }, { status: 403 });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const stored = await saveUploadedFile({
      buffer,
      originalName: file.name,
      mimeType: file.type,
      isPrivate,
      subFolder: caseId ? `cases/${caseId}` : "uploads",
    });

    let documentRecord = null;
    if (caseId) {
      documentRecord = await db.privateDocument.create({
        data: {
          caseId,
          documentType,
          fileName: file.name,
          fileKey: stored.fileKey,
          fileSize: stored.sizeBytes,
          mimeType: stored.mimeType,
          verificationStatus: "PENDING",
        },
      });

      await recordAuditEvent({
        actorId: user.id,
        actorRole: user.roles[0],
        action: "SELLER_DOCUMENT_UPLOADED",
        entityName: "PrivateDocument",
        entityId: documentRecord.id,
        after: { caseId, documentType, fileName: file.name },
      });
    }

    return NextResponse.json({
      success: true,
      fileKey: stored.fileKey,
      documentId: documentRecord?.id,
      publicUrl: stored.publicUrl,
      sizeBytes: stored.sizeBytes,
    });
  } catch (err: unknown) {
    console.error("File upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "File upload failed" },
      { status: 400 }
    );
  }
}

