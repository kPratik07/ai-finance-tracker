import React, { useState } from "react";
import { api } from "../../api/api";
import { FileUploader } from "../upload/FileUploader";
import { ProgressBar } from "../upload/ProgressBar";

export const StatementUploader = ({
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (file) => {
    if (!file) return;

    try {
      onUploadStart?.();
      setUploadProgress(10);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const result = await api.statements.upload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      onUploadSuccess?.(result);
    } catch (error) {
      onUploadError?.(error);
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="uploader-container">
      <FileUploader
        onFileSelect={handleFileSelect}
        accept=".pdf,.csv,.txt"
        maxSize={5242880} // 5MB
      />
      {uploadProgress > 0 && <ProgressBar progress={uploadProgress} />}
    </div>
  );
};
