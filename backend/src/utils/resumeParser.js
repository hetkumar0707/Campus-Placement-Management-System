// Extracts plain text from an uploaded resume (PDF or DOCX).
// Legacy .doc files cannot be read reliably, so they return an empty string and the UI asks for PDF/DOCX.
const fs = require("fs");
const path = require("path");

const MAX_CHARS = 20000;

function clean(text) {
  return String(text || "")
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_CHARS);
}

async function extractResumeText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === ".pdf") {
      const pdfParse = require("pdf-parse/lib/pdf-parse.js"); // the package index runs a debug routine on import; load the parser directly
      const data = await pdfParse(fs.readFileSync(filePath));
      return clean(data.text);
    }
    if (ext === ".docx") {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return clean(result.value);
    }
  } catch (err) {
    console.error("Resume text extraction failed:", err.message);
  }
  return "";
}

module.exports = { extractResumeText };
