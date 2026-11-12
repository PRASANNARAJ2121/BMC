import fs from "fs";
import path from "path";
import crypto from "crypto";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");
const PRIVATE_STORAGE_DIR = path.join(STORAGE_ROOT, "private");
const PUBLIC_STORAGE_DIR = path.join(STORAGE_ROOT, "public");

// Ensure directories exist
if (!fs.existsSync(PRIVATE_STORAGE_DIR)) {
  fs.mkdirSync(PRIVATE_STORAGE_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_STORAGE_DIR)) {
  fs.mkdirSync(PUBLIC_STORAGE_DIR, { recursive: true });
}

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface StoredFileRecord {
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isPrivate: boolean;
  publicUrl?: string;
  filePath: string;
}

/**
 * Saves an uploaded file to secure local disk storage.
 * Private files are placed in an isolated directory that is NEVER served statically.
 */
export async function saveUploadedFile(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  isPrivate: boolean;
  subFolder?: string;
}): Promise<StoredFileRecord> {
  const { buffer, originalName, mimeType, isPrivate, subFolder = "" } = params;

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(`UNSUPPORTED_MIME_TYPE: File type '${mimeType}' is not permitted.`);
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`FILE_TOO_LARGE: File size ${Math.round(buffer.length / 1024)}KB exceeds maximum 10MB limit.`);
  }

  // Generate tamper-resistant unique filename
  const extension = path.extname(originalName) || ".bin";
  const uniqueId = crypto.randomBytes(16).toString("hex");
  const fileName = `${Date.now()}-${uniqueId}${extension}`;

  const baseDir = isPrivate ? PRIVATE_STORAGE_DIR : PUBLIC_STORAGE_DIR;
  const targetDir = subFolder ? path.join(baseDir, subFolder) : baseDir;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, fileName);
  await fs.promises.writeFile(filePath, buffer);

  const fileKey = subFolder ? `${subFolder}/${fileName}` : fileName;

  return {
    fileKey,
    originalName,
    mimeType,
    sizeBytes: buffer.length,
    isPrivate,
    publicUrl: isPrivate ? undefined : `/uploads/${fileKey}`,
    filePath,
  };
}

/**
 * Reads a private file from secure storage with path traversal protection.
 */
export async function readPrivateFile(fileKey: string): Promise<{ buffer: Buffer; fileName: string }> {
  // Prevent path traversal attacks
  if (fileKey.includes("..") || path.isAbsolute(fileKey)) {
    throw new Error("SECURITY_VIOLATION: Path traversal attempt detected.");
  }

  const normalizedKey = path.normalize(fileKey);
  const filePath = path.join(PRIVATE_STORAGE_DIR, normalizedKey);

  if (!filePath.startsWith(PRIVATE_STORAGE_DIR)) {
    throw new Error("SECURITY_VIOLATION: Path traversal attempt detected.");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error("FILE_NOT_FOUND: The requested document does not exist.");
  }

  const buffer = await fs.promises.readFile(filePath);
  return { buffer, fileName: path.basename(filePath) };
}
