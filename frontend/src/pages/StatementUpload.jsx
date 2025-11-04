import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatementUploader } from "../components/statement/StatementUploader";
import { ProcessingStatus } from "../components/statement/ProcessingStatus";
import "../styles/upload.css";

export const StatementUpload = () => {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    setStatus("Statement processed successfully!");
    setTimeout(() => {
      navigate("/transactions");
    }, 2000);
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
    setError(error.message || "Failed to process statement");
    setProcessing(false);
    setStatus("");
  };

  const handleRetry = () => {
    setError("");
    setStatus("");
    setProcessing(false);
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>Upload Bank Statement</h1>
        <p className="upload-info">
          📄 Supported formats: PDF, CSV, TXT
          <br />
          🏦 Supported banks: Kotak, HDFC, ICICI, SBI, Axis, and more
        </p>
        <StatementUploader
          onUploadStart={() => {
            setProcessing(true);
            setError("");
            setStatus("");
          }}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
        {processing && <ProcessingStatus />}
        {error && (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <div className="error-help">
              <p>💡 <strong>Please ensure:</strong></p>
              <ul>
                <li>The file is a valid bank statement (PDF, CSV, or TXT)</li>
                <li>It contains transaction details with dates and amounts</li>
                <li>The file is from a recognized bank (Kotak, HDFC, ICICI, SBI, Axis, etc.)</li>
              </ul>
            </div>
            <button onClick={handleRetry} className="btn btn-retry">
              📤 Upload Another Statement
            </button>
          </div>
        )}
        {status && <div className="success-message">{status}</div>}
      </div>
    </div>
  );
};
