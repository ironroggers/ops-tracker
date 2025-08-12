import React from "react";
import "./Sidebar.css";

export default function Sidebar() {
  // UI-only vertical icon list (collapsed), mirroring Angular styles
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [collapsed, setCollapsed] = React.useState(true);
  const moduleIcons = [
    "/side-menu-icons/dashboards/dashboard.svg",
    "/side-menu-icons/forms/forms.svg",
    "/side-menu-icons/workFlows/workflowUnselected.svg",
    "/side-menu-icons/integrationManager/Integration_manager.svg",
    "/side-menu-icons/masterConfiguration/master_configuration.svg",
    "/side-menu-icons/maintainanceControlCentre/maintainence_control_center.svg",
    "/side-menu-icons/permits/iPermits.svg",
    "/side-menu-icons/operatorRounds/operator_round.svg",
    // "/side-menu-icons/safety/safety.svg",
    // "/side-menu-icons/value360/value360Icon.svg",
    "/side-menu-icons/userManagement/user_management.svg",
    "/side-menu-icons/workInstructions/unselecteddwiicon.svg",
    // "/side-menu-icons/shiftHandover/shift_handover.svg",
    "/side-menu-icons/aiStudio/aiStudio.svg",
    // "/side-menu-icons/actions/actions.svg",
    // "/side-menu-icons/race/race.svg",
  ];

  React.useEffect(() => {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    document.body.classList.toggle("sidebar-expanded", !collapsed);
  }, [collapsed]);

  return (
    <div className="main-app">
      <nav className={`mat-drawer ${collapsed ? "menu-close" : ""}`}>
        <div className="logo-img">
          <svg
            id="icon-innova-small"
            className="innova-small-img"
            viewBox="0 0 45 32"
            preserveAspectRatio="xMinYMid meet"
            aria-label="Innova"
            role="img"
            focusable="false"
          >
            <path
              fill="#05366d"
              style={{ fill: "var(--color1, #05366d)" }}
              d="M4.571 9.546l17.729-9.576 17.42 9.406-4.232 2.298-13.192-7.299-17.725 9.406v-4.234z"
            ></path>
            <path
              fill="#05366d"
              style={{ fill: "var(--color1, #05366d)" }}
              d="M4.571 17.069l17.729-9.56 10.334 5.707-4.042 2.182-6.296-3.48-17.725 9.402v-4.251z"
            ></path>
            <path
              fill="#05366d"
              style={{ fill: "var(--color1, #05366d)" }}
              d="M39.721 22.619l-17.42 9.381-17.729-9.369 4.462-2.368 13.267 7.42 17.42-9.224v4.16z"
            ></path>
            <path
              fill="#5db6e6"
              style={{ fill: "var(--color2, #5db6e6)" }}
              d="M39.72 15.103l-17.438 9.522-10.493-5.823 4.073-2.161 6.432 3.579 17.424-9.406v4.288z"
            ></path>
          </svg>
        </div>

        <div className="sidebar-menu-items">
          {moduleIcons.map((src, i) => (
            <nav key={i} className="menu-item">
              <ul className="m-0">
                <li
                  className="dis-flex"
                  title=""
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActiveIndex(i);
                  }}
                >
                  <span
                    className={`menu-name ${i === activeIndex ? "active" : ""}`}
                  >
                    <div className="side-bar-images">
                      <img className="side-img-icons" src={src} alt="" />
                    </div>
                  </span>
                </li>
              </ul>
            </nav>
          ))}
        </div>

        <button
          className="collapse-btn"
          aria-label={collapsed ? "Expand" : "Collapse"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <img
            src={
              collapsed
                ? "/side-menu-icons/collapse-sidebar/chevron_right.svg"
                : "/side-menu-icons/collapse-sidebar/chevron_left.svg"
            }
            alt={collapsed ? "Expand" : "Collapse"}
            className="collapse-icon"
            title={collapsed ? "Expand" : "Collapse"}
          />
        </button>

        <div className="version hidden">Version 1.0.0</div>
      </nav>
    </div>
  );
}
