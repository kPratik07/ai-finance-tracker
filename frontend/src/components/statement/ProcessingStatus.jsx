import React from "react";
import { Loading } from "../common/Loading";

export const ProcessingStatus = ({ progress }) => {
  return (
    <div className="processing-status">
      <Loading size="small" />
      <div className="status-message">
        <h3>Processing Your Statement</h3>
        <p>Using AI to analyze transactions...</p>
        {progress && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
            <span>{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
