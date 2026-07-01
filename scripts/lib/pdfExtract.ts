import { readFileSync, existsSync } from "fs";
import { extname } from "path";
import AdmZip from "adm-zip";

// pdf-parse v2: PDFParse class
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse") as {
  PDFParse: new (opts: { data: Buffer }) => {
    getInfo(): Promise<{ total?: number }>;
    getText(opts?: { partial?: number[] }): Promise<{ text: string }>;
    destroy(): Promise<void>;
  };
};

const LARGE_PDF_BYTES = 5 * 1024 * 1024;

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    if (buffer.length >= LARGE_PDF_BYTES) {
      const info = await parser.getInfo();
      const total = info.total ?? 0;
      if (total <= 0) {
        const result = await parser.getText();
        return result.text ?? "";
      }

      const parts: string[] = [];
      for (let page = 1; page <= total; page += 1) {
        const result = await parser.getText({ partial: [page] });
        const text = result.text?.trim();
        if (text) parts.push(text);
      }
      return parts.join("\n\n");
    }

    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy();
  }
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  if (!existsSync(filePath)) {
    throw new Error(`Fayl topilmadi: ${filePath}`);
  }

  const ext = extname(filePath).toLowerCase();
  if (ext === ".txt" || ext === ".md") {
    return readFileSync(filePath, "utf8");
  }

  if (ext === ".pdf") {
    const buffer = readFileSync(filePath);
    return extractPdfText(buffer);
  }

  if (ext === ".zip") {
    const zip = new AdmZip(filePath);
    const parts: string[] = [];
    for (const entry of zip.getEntries()) {
      if (entry.isDirectory) continue;
      const name = entry.entryName.toLowerCase();
      if (!name.endsWith(".pdf") && !name.endsWith(".txt")) continue;
      const buf = entry.getData();
      if (name.endsWith(".pdf")) {
        const text = await extractPdfText(buf);
        parts.push(`\n\n=== ${entry.entryName} ===\n\n${text}`);
      } else {
        parts.push(`\n\n=== ${entry.entryName} ===\n\n${buf.toString("utf8")}`);
      }
    }
    return parts.join("\n");
  }

  throw new Error(`Qo'llab-quvvatlanmaydigan format: ${ext}`);
}
