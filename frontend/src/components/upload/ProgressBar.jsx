import React from "react";

export const ProgressBar = ({ progress }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <span className="progress-text">{Math.round(progress)}%</span>
    </div>
  );
};
