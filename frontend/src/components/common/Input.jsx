import React, { forwardRef } from "react";
import "../../styles/components.css";

export const Input = forwardRef(
  ({ label, error, type = "text", ...props }, ref) => {
    return (
      <div className="form-control">
        {label && <label className="form-label">{label}</label>}
        <input
          ref={ref}
          type={type}
          className={`form-input ${error ? "input-error" : ""}`}
          {...props}
        />
        {error && <span className="error-text">{error}</span>}
      </div>
    );
  }
);
