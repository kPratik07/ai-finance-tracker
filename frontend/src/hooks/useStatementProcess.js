import { useState } from "react";
import { api } from "../api/api";
import { validateFileUpload } from "../utils/validation";

export const useStatementProcess = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const processStatement = async (file) => {
    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0]);
    }

    try {
      setProcessing(true);
      setError(null);
      setProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const result = await api.statements.upload(file);

      clearInterval(progressInterval);
      setProgress(100);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    processing,
    progress,
    error,
    processStatement,
  };
};
