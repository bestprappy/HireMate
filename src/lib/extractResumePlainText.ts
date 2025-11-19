import mammoth from "mammoth";
import { Buffer } from "node:buffer";

type ExtractOptions = {
  buffer: Buffer;
  mimeType: string;
};

export async function extractResumePlainText({
  buffer,
  mimeType,
}: ExtractOptions): Promise<string | null> {
  try {
    // Skip PDF parsing - just store the file as base64
    if (mimeType === "application/pdf") {
      return null;
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return sanitize(result.value);
    }

    if (mimeType === "text/plain") {
      return sanitize(buffer.toString("utf-8"));
    }

    return null;
  } catch (error) {
    console.error("Failed to extract resume plain text:", error);
    return null;
  }
}

function sanitize(value?: string | null) {
  if (!value) return null;
  const cleaned = value.replace(/\u0000/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}
