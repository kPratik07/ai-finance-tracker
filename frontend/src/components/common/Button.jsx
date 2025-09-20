import React from "react";
import "../../styles/components.css";

export const Button = ({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  fullWidth = false,
}) => {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && "btn-full",
    loading && "btn-loading",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? <span className="btn-spinner"></span> : children}
    </button>
  );
};
