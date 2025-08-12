import React from "react";
import "./Header.css";

export default function Header() {
  return (
    <header className="header-toolbar">
      {/* Top row: Title/Breadcrumbs + Brand */}
      <div className="header-top">
        <div className="header-left">
          <h1 className="header-title">Dashboard</h1>
          <div className="breadcrumbs">
            <span className="crumb active">Dashboard</span>
            <span className="crumb-sep">&gt;</span>
            <span className="crumb" style={{ color: "black" }}>
              Maintenance
            </span>
          </div>
        </div>
        <div className="header-right">
          <button className="profile-container" aria-label="User options">
            <div className="profile-badge" aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                role="img"
                aria-label="User profile"
              >
                <path
                  fill="currentColor"
                  d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.418 0-8 2.686-8 6v1h16v-1c0-3.314-3.582-6-8-6z"
                />
              </svg>
            </div>
            <img src="/inn_logo.svg" alt="INNOVAPPTIVE" className="inn-logo" />
          </button>
        </div>
      </div>

      {/* Filters/Actions row moved to Dashboard */}
    </header>
  );
}
