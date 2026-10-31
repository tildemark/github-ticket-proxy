"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

export async function uploadFile(file: File): Promise<{
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeExt = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : "";
  const randomName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
  const filePath = join(uploadsDir, randomName);

  await writeFile(filePath, buffer);

  return {
    fileName: file.name,
    fileUrl: `/uploads/${randomName}`,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}
