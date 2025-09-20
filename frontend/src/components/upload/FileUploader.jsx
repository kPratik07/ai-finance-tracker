import React, { useRef } from "react";
import { Button } from "../common/Button";
import { validateFileUpload } from "../../utils/validation";

export const FileUploader = ({ onFileSelect, accept, maxSize, disabled }) => {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    validateAndProcessFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    validateAndProcessFile(file);
  };

  const validateAndProcessFile = (file) => {
    if (!file) return;

    if (maxSize && file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    const { isValid, errors } = validateFileUpload(file);
    if (!isValid) {
      alert(errors[0]);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div
      className="file-uploader"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept={accept}
        style={{ display: "none" }}
      />
      <div className="upload-prompt">
        <i className="upload-icon">📄</i>
        <p>Drop your statement here or click to browse</p>
        <span className="file-types">Supported formats: PDF, CSV, TXT</span>
      </div>
    </div>
  );
};
