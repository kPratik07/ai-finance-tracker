const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const testStatementUpload = async () => {
  try {
    // Test server connection first
    await axios.get("http://localhost:5000/api/test"); // Changed to 5000
    console.log("✅ Server is running");
  } catch (error) {
    console.error("❌ Server not running. Please start the server first.");
    return;
  }

  // Configure the file path
  const pdfPath = path.join(
    __dirname,
    "uploads",
    "Statement_250910_095433.pdf"
  );

  // Verify file exists
  if (!fs.existsSync(pdfPath)) {
    console.error("❌ PDF file not found:", pdfPath);
    return;
  }
  console.log("✅ Found PDF file");

  const form = new FormData();
  form.append("file", fs.createReadStream(pdfPath));

  try {
    console.log("\n📤 Uploading statement...");
    const response = await axios.post(
      "http://localhost:5000/api/statements/upload", // Changed to 5000
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
      }
    );

    console.log("\n✅ Upload Success!");
    console.log("\n📄 Extracted Data:");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("\n❌ Error occurred");
    console.error("Status:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);
    console.error("\nFull error:", error);
  }
};

console.log("🚀 Starting PDF statement test...\n");
testStatementUpload();
