import React from "react";
import "../../styles/components.css";

export const Loading = ({ size = "medium", fullScreen = false }) => {
  const classes = [
    "loading-spinner",
    `spinner-${size}`,
    fullScreen && "spinner-fullscreen",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <div className="spinner"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
