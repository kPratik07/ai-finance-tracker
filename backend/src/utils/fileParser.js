import { createRequire } from "module";
const require = createRequire(import.meta.url);
const PDF = require("pdfjs-dist/legacy/build/pdf.js");
import { parse } from "csv-parse";
import { promisify } from "util";

// Configure PDF.js
PDF.GlobalWorkerOptions.workerSrc = "";

const parseCSV = promisify(parse);

export const parseFile = async (file) => {
  try {
    const buffer = file.buffer;
    const fileType = file.mimetype;

    switch (fileType) {
      case "application/pdf":
        const data = new Uint8Array(buffer);
        const loadingTask = PDF.getDocument({
          data,
          useSystemFonts: true,
          disableFontFace: true,
        });
        const pdfDoc = await loadingTask.promise;
        let text = "";

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ");
        }
        return text;

      case "text/csv":
        const records = await parseCSV(buffer.toString(), {
          columns: true,
          skip_empty_lines: true,
        });
        return JSON.stringify(records);

      case "text/plain":
        return buffer.toString();

      default:
        throw new Error("Unsupported file format");
    }
  } catch (error) {
    console.error("File parsing error:", error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};
