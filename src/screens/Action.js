import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./Action.css";
import { useLocation, useNavigate } from "react-router-dom";
import { sendActionPrompt } from "../services/chatApi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function IconBack() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 12H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M11 8l-4 4 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMic() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 14a4 4 0 004-4V7a4 4 0 10-8 0v3a4 4 0 004 4z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19 11a7 7 0 01-14 0M12 18v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSend() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 2L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 16l4-4 4 4 6-6 4 4"
        stroke="#ef4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconInnovaSmall() {
  return (
    <svg
      className="innova-small-img"
      viewBox="0 0 45 32"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#05366d"
        style={{ fill: "var(--color1, #05366d)" }}
        d="M4.571 9.546l17.729-9.576 17.42 9.406-4.232 2.298-13.192-7.299-17.725 9.406v-4.234z"
      />
      <path
        fill="#05366d"
        style={{ fill: "var(--color1, #05366d)" }}
        d="M4.571 17.069l17.729-9.56 10.334 5.707-4.042 2.182-6.296-3.48-17.725 9.402v-4.251z"
      />
      <path
        fill="#05366d"
        style={{ fill: "var(--color1, #05366d)" }}
        d="M39.721 22.619l-17.42 9.381-17.729-9.369 4.462-2.368 13.267 7.42 17.42-9.224v4.16z"
      />
      <path
        fill="#5db6e6"
        style={{ fill: "var(--color2, #5db6e6)" }}
        d="M39.72 15.103l-17.438 9.522-10.493-5.823 4.073-2.161 6.432 3.579 17.424-9.406v4.288z"
      />
    </svg>
  );
}

function IconPdf() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.00078 4.19999C6.656 4.19999 6.32534 4.33695 6.08154 4.58075C5.83775 4.82455 5.70078 5.15521 5.70078 5.49999V19.5C5.70078 19.8448 5.83774 20.1754 6.08154 20.4192C6.32534 20.663 6.656 20.8 7.00078 20.8H17.0008C17.3456 20.8 17.6762 20.663 17.92 20.4192C18.1638 20.1754 18.3008 19.8448 18.3008 19.5V9.19999H15.0008C14.5499 9.19999 14.1175 9.02088 13.7987 8.70207C13.4799 8.38326 13.3008 7.95086 13.3008 7.49999V4.19999H7.00078ZM14.7008 5.18994L17.3108 7.79999H15.0008C14.9212 7.79999 14.8449 7.76838 14.7886 7.71212C14.7324 7.65586 14.7008 7.57955 14.7008 7.49999V5.18994ZM5.09159 3.5908C5.59794 3.08445 6.2847 2.79999 7.00078 2.79999H14.0008C14.1864 2.79999 14.3645 2.87374 14.4958 3.00501L19.4958 8.00501C19.627 8.13629 19.7008 8.31434 19.7008 8.49999V19.5C19.7008 20.2161 19.4163 20.9028 18.91 21.4092C18.4036 21.9155 17.7169 22.2 17.0008 22.2H7.00078C6.2847 22.2 5.59794 21.9155 5.09159 21.4092C4.58524 20.9028 4.30078 20.2161 4.30078 19.5V5.49999C4.30078 4.7839 4.58524 4.09715 5.09159 3.5908ZM8.30078 9.49999C8.30078 9.11339 8.61418 8.79999 9.00078 8.79999H10.0008C10.3874 8.79999 10.7008 9.11339 10.7008 9.49999C10.7008 9.88659 10.3874 10.2 10.0008 10.2H9.00078C8.61418 10.2 8.30078 9.88659 8.30078 9.49999ZM8.30078 13.5C8.30078 13.1134 8.61418 12.8 9.00078 12.8H15.0008C15.3874 12.8 15.7008 13.1134 15.7008 13.5C15.7008 13.8866 15.3874 14.2 15.0008 14.2H9.00078C8.61418 14.2 8.30078 13.8866 8.30078 13.5ZM8.30078 17.5C8.30078 17.1134 8.61418 16.8 9.00078 16.8H15.0008C15.3874 16.8 15.7008 17.1134 15.7008 17.5C15.7008 17.8866 15.3874 18.2 15.0008 18.2H9.00078C8.61418 18.2 8.30078 17.8866 8.30078 17.5Z"
        fill="#4F5561"
      />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" fill="#22c55e" />
      <path
        d="M16.5 9.5l-5.25 5.25L7.5 11"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Brand icon requested for titles
function IconBrand32() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9.05059 16.1617C10.4292 17.4452 11.5413 19.7215 12.2154 21.3532C12.4567 21.9372 13.402 21.9372 13.6433 21.3532C14.3175 19.7215 15.4296 17.4452 16.8082 16.1617C18.0338 15.0206 20.0807 14.0957 21.5429 13.5322C22.112 13.3129 22.1549 12.4372 21.6073 12.1687C20.1446 11.4517 18.0602 10.3027 16.8082 9.05059C15.4888 7.73122 14.2839 5.48771 13.5782 4.0213C13.3275 3.5003 12.5312 3.5003 12.2805 4.0213C11.5749 5.48771 10.3699 7.73122 9.05059 9.05059C7.79851 10.3027 5.71412 11.4517 4.25148 12.1687C3.70382 12.4372 3.74677 13.3129 4.31589 13.5322C5.77809 14.0957 7.82494 15.0206 9.05059 16.1617Z"
        fill="#3D5AFE"
      />
      <path
        d="M21.3329 24.889C22.0222 25.5307 22.5783 26.6689 22.9153 27.4847C23.036 27.7767 23.5086 27.7767 23.6293 27.4847C23.9664 26.6689 24.5224 25.5307 25.2117 24.889C25.8245 24.3184 26.8479 23.856 27.579 23.5742C27.8636 23.4645 27.8851 23.0267 27.6113 22.8925C26.8799 22.534 25.8377 21.9594 25.2117 21.3334C24.552 20.6737 23.9495 19.552 23.5967 18.8188C23.4714 18.5583 23.0732 18.5583 22.9479 18.8188C22.5951 19.552 21.9926 20.6737 21.3329 21.3334C20.7069 21.9594 19.6647 22.534 18.9334 22.8925C18.6595 23.0267 18.681 23.4645 18.9656 23.5742C19.6967 23.856 20.7201 24.3184 21.3329 24.889Z"
        fill="#3D5AFE"
      />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.5 6.5h6l2 2h9v9.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5v-10a2 2 0 012-2z"
        stroke="#6b7280"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconWrench() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 3a5 5 0 00-4.24 7.58l-5.59 5.59a2 2 0 102.83 2.83l5.59-5.59A5 5 0 1014 3z"
        stroke="#6b7280"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2l2.2 5.1L19.5 9l-5.3 1.9L12 16l-2.2-5.1L4.5 9l5.3-1.9L12 2z"
        fill="#3D5AFE"
        opacity="0.9"
      />
      <path
        d="M7 14l1 2.3L10.5 17 8 17.8 7 20l-1-2.2L3.5 17 6 16.3 7 14z"
        fill="#5db6e6"
      />
    </svg>
  );
}

function RightShimmerPanel({ showProgress = true }) {
  const [progress, setProgress] = useState(10);
  useEffect(() => {
    // Light pulse to keep it alive; caps at 35% for now (slightly faster)
    const id = setInterval(() => {
      setProgress((p) => Math.min(35, p + (2 + Math.floor(Math.random() * 3)))); // +2..+4
    }, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="chart-card" aria-live="polite" aria-busy="true">
      <div className="skeleton-stack">
        <div className="shimmer-line w-90" />
        <div className="shimmer-line w-80" />
        <div className="shimmer-line w-70" />
        <div className="shimmer-line w-85" />
        <div className="shimmer-line w-60" />
      </div>
      {showProgress && (
        <div className="agent-progress-card">
          <div className="agent-progress-head">
            <div className="agent-progress-title">
              <span className="agent-title-icon" aria-hidden="true">
                <IconPdf />
              </span>
              <span>Finding Causes for increased Maintenance Opex</span>
            </div>
            <div className="agent-progress-sub">Deep Analysis Agent</div>
          </div>
          <div className="agent-progress-track">
            <div
              className="agent-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="agent-progress-percent">{progress}%</div>
        </div>
      )}
    </div>
  );
}

function RightInfoInitialPanel() {
  return (
    <div className="chart-card" aria-live="polite">
      <div className="info-section">
        <span className="info-bullet" aria-hidden="true">
          <IconBrand32 />
        </span>
        <div className="info-content">
          <div className="info-heading">Collecting real-time data</div>
          <p className="info-body">
            I'm starting my research on how to bake a cake. I've broken down the
            topic into several key areas to ensure a comprehensive understanding
            for a beginner. This includes finding a simple, reliable recipe,
            identifying the necessary ingredients and equipment, and outlining
            the step-by-step process. I'll also be investigating common problems
            and how to troubleshoot them.
          </p>
        </div>
      </div>
    </div>
  );
}

function RightInfoPanel() {
  return (
    <div className="chart-card" aria-live="polite">
      {/* Summary */}
      <div className="info-section">
        <span className="info-bullet" aria-hidden="true">
          <IconBrand32 />
        </span>
        <div className="info-content">
          <div className="info-heading">Collected references</div>
          <p className="info-body">
            Linked relevant work orders and manuals that commonly appear in
            investigations for increased maintenance spend.
          </p>
        </div>
      </div>

      {/* Top chips row like screenshot */}
      <div className="info-chip-row">
        <span className="info-chip">Repair Booster Pump</span>
        <span className="info-chip">Repair Booster Pump</span>
        <span className="info-chip">Repair Booster Pump</span>
      </div>

      {/* Manuals and SOPs group (row 1) */}
      <div className="info-group">
        <div className="info-group-title">
          <IconPdf />
          <span>Manuals and SOPs</span>
        </div>
        <div className="info-chip-row">
          <span className="info-chip">Hydraulic System Installment</span>
          <span className="info-chip">Hydraulic System Installment</span>
          <span className="info-chip">Repair Booster Pump</span>
        </div>
        <div className="info-chip-row">
          <span className="info-chip">Hydraulic System Installment</span>
          <span className="info-chip">Hydraulic System Installment</span>
          <span className="info-chip">Repair Booster Pump</span>
        </div>
      </div>

      {/* Only one Manuals and SOPs group as requested */}

      {/* Checklist */}
      <div className="checklist">
        <div className="check-item">
          <span className="check-icon" aria-hidden="true">
            <IconCheckCircle />
          </span>
          <div>
            <div className="check-title">Entity Linking</div>
            <div className="check-desc">
              Matching data to assets, locations, and teams to avoid duplication
            </div>
          </div>
        </div>
        <div className="check-item">
          <span className="check-icon" aria-hidden="true">
            <IconCheckCircle />
          </span>
          <div>
            <div className="check-title">Time Correlation</div>
            <div className="check-desc">
              Aligning events across work orders, permits, and inspections over
              the same time windows
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// New: Static actions chart-card (now enabled)
function RightActionsPanel({ collapsed = false, onToggleCollapse }) {
  const causeActions = [
    {
      causeTitle: "Rapid Increase in PM Work Orders",
      causePercent: 70,
      actions: [
        {
          priority: "High",
          impact: "Loss < $1M",
          title: "PM Optimization",
          description: "Identify & deactivate unnecessary PM based on failure history and execution data"
        },
        {
          priority: "Medium",
          impact: "Loss < $500K",
          title: "Risk-based PM Scheduling",
          description: "Risk-rank assets and adjust PM frequencies using criticality + condition data"
        }
      ]
    },
    {
      causeTitle: "Increase in MTTR due to Waiting for Permits",
      causePercent: 30,
      actions: [
        {
          priority: "High",
          impact: "Loss < $800K",
          title: "Permit Pre-check System",
          description: "Implement early permit pre-checks to reduce waiting time"
        },
        {
          priority: "High",
          impact: "Loss < $600K",
          title: "Shift Handover Enhancement",
          description: "Introduce shift handover checklist including pending permits"
        },
        {
          priority: "Medium",
          impact: "Loss < $400K",
          title: "Operations SLA",
          description: "Create SLA with Operations for isolation/LOTO readiness"
        }
      ]
    }
  ];

  return (
    <section className="report-card" aria-label="Project Plan Report">
      <div className="report-head">
        <div className="report-head-left">
          <span className="report-bullet" aria-hidden="true">
            <IconBrand32 />
          </span>
          <div>
            <div className="report-title">Project Plan for Maintenance Cost Reduction</div>
            <div className="report-subtitle">Contributing to 7% increase in Maintenance Opex trend</div>
          </div>
        </div>
        <div className="report-head-actions" aria-hidden="true">
          <button type="button" className="icon-badge" title="Copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect
                x="9"
                y="9"
                width="10"
                height="10"
                rx="2"
                stroke="#4B5563"
                strokeWidth="1.5"
              />
              <rect
                x="5"
                y="5"
                width="10"
                height="10"
                rx="2"
                stroke="#4B5563"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <button 
            type="button" 
            className="icon-badge" 
            title={collapsed ? "Expand" : "Collapse"}
            onClick={onToggleCollapse}
          >
            {collapsed ? <IconChevronDown /> : <IconChevronUp />}
          </button>
        </div>
      </div>

      <div className={`report-body ${collapsed ? "collapsed" : "expanded"}`} aria-hidden={collapsed}>
        {causeActions.map((cause, causeIdx) => (
          <div key={causeIdx} className="cause-actions-section" style={{ marginBottom: '24px' }}>
            <div className="cause-actions-header" style={{ marginBottom: '16px' }}>
              <div className="cause-actions-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="cause-rank-dark" style={{ 
                    backgroundColor: '#3D5AFE', 
                    color: 'white', 
                    borderRadius: '8px', 
                    padding: '6px 10px', 
                    fontSize: '14px', 
                    fontWeight: '600' 
                  }}>
                    {causeIdx + 1}
                  </span>
                  <div>
                    <div className="cause-title" style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
                      {cause.causeTitle}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {cause.actions.length} action{cause.actions.length > 1 ? 's' : ''} planned
                    </div>
                  </div>
                </div>
                <span className="cause-chip chip-high" style={{ fontSize: '14px', fontWeight: '600' }}>
                  {cause.causePercent}%
                </span>
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {cause.actions.map((action, actionIdx) => (
                <div key={actionIdx} className="chart-card" style={{ 
                  padding: '16px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  backgroundColor: '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      Action {actionIdx + 1}
                    </span>
                    <span className={action.priority === "High" ? "chip-high" : "chip-med"} style={{ fontSize: '12px' }}>
                      {action.priority}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#111827' }}>
                      {action.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4', margin: '0' }}>
                      {action.description}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                        Potential Impact
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#111827' }}>
                        {action.impact}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-outline sm" type="button" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Dismiss
                      </button>
                      <button className="btn sm" type="button" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {causeIdx < causeActions.length - 1 && (
              <div style={{ margin: '24px 0', textAlign: 'center' }}>
                <div style={{ height: '1px', backgroundColor: '#e5e7eb', width: '100%' }}></div>
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button type="button" className="btn-outline sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add New Action
          </button>
        </div>
      </div>
    </section>
  );
}

function RightHypothesisPanel() {
  return (
    <div className="chart-card" aria-live="polite">
      <div className="info-section">
        <span className="info-bullet" aria-hidden="true">
          <IconCheckCircle />
        </span>
        <div className="info-content">
          <div className="info-heading">Generating Hypothesis</div>
          <p className="info-body">
            Uses RCA logic trees (Ishikawa/Fishbone, 5 Whys) to generate
            possible causes.
          </p>
          <p className="info-body">
            Categorizes hypotheses into:
            <br />
            Equipment-related (e.g., aging pumps, unplanned breakdowns)
            <br />
            Process-related (e.g., excessive PM frequency, inefficient
            workflows)
            <br />
            Human-related (e.g., delays in permit approvals, skill gaps)
            <br />
            External (e.g., supplier quality issues, raw material variability)
          </p>
          <p className="info-body">
            Assigns probability scores based on data correlation strength.
          </p>
        </div>
      </div>

      <div className="info-section" style={{ marginTop: 12 }}>
        <span className="info-bullet" aria-hidden="true">
          <IconCheckCircle />
        </span>
        <div className="info-content">
          <div className="info-heading">Shortlisting Causes for you</div>
          <div className="mini-caption">Choosing from these</div>
          <div className="select-grid">
            <div className="select-chip">
              <div className="select-title">Cause 1 90%</div>
              <div className="select-sub">Reason for choosing this cause</div>
            </div>
            <div className="select-chip">
              <div className="select-title">Cause 2 80%</div>
              <div className="select-sub">Reason for choosing this cause</div>
            </div>
            <div className="select-chip">
              <div className="select-title">Repair Booster Pump</div>
              <div className="select-sub">Reason for choosing this cause</div>
            </div>
            <div className="select-chip">
              <div className="select-title">Cause 1 90%</div>
              <div className="select-sub">Reason for choosing this cause</div>
            </div>
            <div className="select-chip">
              <div className="select-title">Cause 2 80%</div>
              <div className="select-sub">Reason for choosing this cause</div>
            </div>
            <div className="select-chip">
              <div className="select-title">Repair Booster Pump</div>
              <div className="select-sub">Reason for choosing this cause</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartPanel({ chart }) {
  if (!chart) return <RightShimmerPanel showProgress={false} />;
  const { title, subtitle, unit, seriesName, data, trendYoY, vsLastQuarter } =
    chart;
  return (
    <div style={{ alignSelf: "start" }} aria-live="polite">
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <div className="chart-title">{title}</div>
            <div className="chart-subtitle">{subtitle}</div>
          </div>
          <div className="chart-legend">{unit}</div>
        </div>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, left: 8, right: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="areaFillRe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                width={40}
                domain={["dataMin - 10", "dataMax + 10"]}
              />
              <Tooltip formatter={(v) => [`${v}`, seriesName]} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="none"
                fill="url(#areaFillRe)"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 3, stroke: "#2563eb", fill: "#2563eb" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div
          className="chart-footer"
          style={{
            display: "flex",
            marginTop: 6,
            justifyContent: "space-between",
          }}
        >
          <div className="chart-caption">Trend: {trendYoY}</div>
          <div className="spacer" />
          <div className="chart-note" style={{ color: "#ef4444" }}>
            {vsLastQuarter}
          </div>
        </div>
      </div>
    </div>
  );
}

// Prevent Recharts from re-rendering on unrelated state updates (like progress ticks)
const MemoChartPanel = React.memo(ChartPanel);

function AgentProgress({ onCrossThreshold, onProgressChange, threshold = 40 }) {
  const [progress, setProgress] = useState(10);
  const firedRef = useRef(false);
  const intervalRef = useRef(0);
  useEffect(() => {
    let id = 0;
    id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + (2 + Math.floor(Math.random() * 3))); // +2..+4
        if (next >= 100) clearInterval(id);
        return next;
      });
    }, 300);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!firedRef.current && progress >= threshold) {
      firedRef.current = true;
      onCrossThreshold?.();
    }
  }, [progress, threshold, onCrossThreshold]);
  // Safety: if we somehow linger at 99%, finalize to 100
  useEffect(() => {
    if (progress >= 99 && progress < 100) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const t = setTimeout(() => setProgress(100), 600);
      return () => clearTimeout(t);
    }
  }, [progress]);
  useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);
  return (
    <div className="agent-progress-card" aria-live="polite">
      <div className="agent-progress-head">
        <div className="agent-progress-title">
          <span className="agent-title-icon" aria-hidden="true">
            <IconPdf />
          </span>
          <span>Finding Causes for increased Maintenance Opex</span>
        </div>
        <div className="agent-progress-sub">Deep Analysis Agent</div>
      </div>
      <div className="agent-progress-track">
        <div
          className="agent-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="agent-progress-percent">{progress}%</div>
    </div>
  );
}

function useAnimatedProgress(durationMs, isActive, onDone) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    let rafId = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      setProgress(t);
      if (t < 1) rafId = requestAnimationFrame(tick);
      else if (onDone) onDone();
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [durationMs, isActive, onDone]);
  return progress;
}

function OpexChart({ animate, onDone }) {
  const animatedProgress = useAnimatedProgress(3000, animate, onDone);
  const progress = animate ? animatedProgress : 1;
  const base = [30, 32, 35, 38, 42, 47, 53, 60, 68, 77, 87, 98];
  const shownCount = Math.max(2, Math.round(base.length * progress));
  const data = base.slice(0, shownCount);

  const width = 680;
  const height = 240;
  const padding = 28;
  const max = Math.max(...base);
  const min = Math.min(...base);
  const range = Math.max(1, max - min);
  const bottom = height - padding;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (base.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const firstX = padding + (0 / (base.length - 1)) * (width - padding * 2);
  const lastX =
    padding + ((data.length - 1) / (base.length - 1)) * (width - padding * 2);
  const areaPoints = `${firstX},${bottom} ${points} ${lastX},${bottom}`;
  const ticks = [0.2, 0.4, 0.6, 0.8];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <div className="chart-title">OPEX Trend</div>
          <div className="chart-subtitle">
            Increasing operational expenditure
          </div>
        </div>
        <div className="chart-legend">USD × 1000</div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        className="opex-chart"
        aria-label="OPEX increasing chart"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
        {ticks.map((t) => {
          const y = padding + t * (height - padding * 2);
          return (
            <line
              key={t}
              x1={padding}
              x2={width - padding}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
            />
          );
        })}
        <polyline fill="url(#areaFill)" stroke="none" points={areaPoints} />
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          points={points}
        />
        {data.map((v, i) => {
          const x = padding + (i / (base.length - 1)) * (width - padding * 2);
          const y = padding + (1 - (v - min) / range) * (height - padding * 2);
          return <circle key={i} cx={x} cy={y} r="3" fill="#2563eb" />;
        })}
      </svg>
    </div>
  );
}

function TimelineLoader({ onDone }) {
  const steps = [
    { label: "Workorders Operations", ms: 2000 },
    { label: "Spare Parts", ms: 2000 },
    { label: "Permits", ms: 2000 },
    { label: "Issues", ms: 2000 },
    { label: "Inventory", ms: 2000 },
    { label: "Round Plans", ms: 2000 },
    { label: "Summarizing insights", ms: 7000 },
  ];
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const totalMs = steps.reduce((a, s) => a + s.ms, 0);
  const completedMs = steps.slice(0, index).reduce((a, s) => a + s.ms, 0);
  const progress = Math.min(100, Math.round((completedMs / totalMs) * 100));

  useEffect(() => {
    if (done) return;
    if (index >= steps.length) {
      setDone(true);
      onDone?.();
      return;
    }
    const t = setTimeout(() => setIndex((i) => i + 1), steps[index].ms);
    return () => clearTimeout(t);
  }, [index, steps, done, onDone]);

  return (
    <div className="timeline">
      <div className="timeline-title">Fetching required data</div>
      <div className="timeline-progress">
        <div className="timeline-fill" style={{ width: `${progress}%` }} />
      </div>
      <ol className="timeline-list">
        {steps.map((s, i) => {
          const status =
            i < index ? "done" : i === index ? "active" : "pending";
          return (
            <li key={s.label} className={`timeline-item ${status}`}>
              <span className="timeline-bullet" aria-hidden="true" />
              <span className="timeline-label">{s.label}</span>
              <span className="timeline-duration">{s.ms / 1000}s</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MiniTimelineLoader({ onDone }) {
  const steps = [
    { label: "Workorders", ms: 1200 },
    { label: "History", ms: 1200 },
    { label: "Sensors", ms: 1200 },
    { label: "Permits", ms: 1200 },
    { label: "Inventory", ms: 1200 },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= steps.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setIndex((i) => i + 1), steps[index].ms);
    return () => clearTimeout(t);
  }, [index, steps, onDone]);

  return (
    <div className="mini-timeline">
      <div className="mini-steps">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={`mini-step ${
              i < index ? "done" : i === index ? "active" : ""
            }`}
          >
            <span className="mini-dot" />
            <span className="mini-label">{s.label}</span>
            <span className="mini-time">{s.ms / 1000}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubCauses({
  items,
  parentCause,
  onGeneratePlan,
  planStateFor,
  onPlanDone,
  onPlanStatusesChange,
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="sub-causes">
      <div className="sub-causes-title">Related sub-causes</div>
      <ol className="sub-causes-list">
        {items.map((sc, idx) => (
          <li key={idx} className="sub-cause-item">
            <div className="sub-cause-row">
              <div className="sub-cause-title">{sc.title}</div>
              <span className="sub-cause-chip">{sc.percent}%</span>
            </div>
            {sc.description ? (
              <p className="sub-cause-desc">{sc.description}</p>
            ) : null}
            {sc.metric?.type === "trendPercent" && (
              <div className="metric-box" style={{ marginTop: 8 }}>
                <div className="metric-box-head">
                  <span className="metric-head-icon">
                    <IconTrend />
                  </span>
                  <span className="metric-head-title">Trend</span>
                </div>
                <div className="metric-hero metric-danger">
                  {sc.metric.change}
                </div>
                <div className="metric-caption">{sc.metric.caption}</div>
              </div>
            )}
            <div className="sub-cause-actions">
              <button
                type="button"
                className="btn sm"
                onClick={() => onGeneratePlan?.(parentCause, sc)}
              >
                Generate Plan
              </button>
            </div>
            {(() => {
              const state = planStateFor?.(parentCause, sc);
              if (state?.status === "loading") {
                return (
                  <PlanAgentLoader
                    onDone={() => onPlanDone?.(parentCause, sc)}
                  />
                );
              }
              if (state?.status === "ready") {
                return (
                  <ActionPlanCards
                    title={`Plan for ${sc.title}`}
                    items={state.items}
                    onStatusesChange={(actions) =>
                      onPlanStatusesChange?.(parentCause, sc, actions)
                    }
                  />
                );
              }
              return null;
            })()}
          </li>
        ))}
      </ol>
    </div>
  );
}

// Add ChevronUp and ChevronDown icon components after the existing icon components
function IconChevronUp() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 15l-6-6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CausesReport({ collapsed = false, onToggleCollapse }) {
  const mini1 = [
    { month: "Jan", value: 118 },
    { month: "Feb", value: 131 },
    { month: "Mar", value: 159 },
  ];
  const mini2 = [
    { month: "Jan", value: 116 },
    { month: "Feb", value: 129 },
    { month: "Mar", value: 152 },
  ];
  const donut = [
    { name: "Rapid increase in PM Work Orders", value: 60 },
    { name: "Increase in MTTR due to waiting for Permits", value: 40 },
  ];
  const donutColors = ["#3D5AFE", "#c7d2fe"]; // primary + light
  return (
    <section className="report-card" aria-label="Top 2 Causes Report">
      <div className="report-head">
        <div className="report-head-left">
          <span className="report-bullet" aria-hidden="true">
            <IconBrand32 />
          </span>
          <div>
            <div className="report-title">Top 2 Causes</div>
            <div className="report-subtitle">
              Contributing to 7% increase in Maintenance Opex trend
            </div>
          </div>
        </div>
        <div className="report-head-actions" aria-hidden="true">
          <button type="button" className="icon-badge" title="Copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect
                x="9"
                y="9"
                width="10"
                height="10"
                rx="2"
                stroke="#4B5563"
                strokeWidth="1.5"
              />
              <rect
                x="5"
                y="5"
                width="10"
                height="10"
                rx="2"
                stroke="#4B5563"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <button 
            type="button" 
            className="icon-badge" 
            title={collapsed ? "Expand" : "Collapse"}
            onClick={onToggleCollapse}
          >
            {collapsed ? <IconChevronDown /> : <IconChevronUp />}
          </button>
        </div>
      </div>

      <div className={`report-body ${collapsed ? "collapsed" : "expanded"}`} aria-hidden={collapsed}>
        <div className="report-causes-grid">
        <article className="report-cause">
          <div className="report-cause-head">
            <div className="report-cause-index">1.</div>
            <div className="report-cause-title">
              Rapid Increase in PM Work Orders
            </div>
          </div>
          <p className="report-cause-desc">
            Static PMs are not optimised with actual equipment condition and
            criticality, leading to unnecessary maintenance tasks
          </p>
          <div className="report-mini">
            <div className="report-mini-left">
              <div className="report-mini-label">Trend</div>
              <div className="report-mini-chart">
                <ResponsiveContainer width="100%" height={84}>
                  <BarChart
                    data={mini1}
                    margin={{ top: 8, left: 8, right: 8, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#eef0f4"
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />
                    <YAxis
                      domain={[115, 160]}
                      ticks={[115, 160]}
                      width={28}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                      fontSize={10}
                    />
                    <Tooltip cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      fill="#ef4444"
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="report-mini-stat">
              <div className="report-mini-stat-val">+ 38%</div>
              <div className="report-mini-stat-sub">in last 3 months</div>
            </div>
          </div>
        </article>

        <article className="report-cause">
          <div className="report-cause-head">
            <div className="report-cause-index">2.</div>
            <div className="report-cause-title">
              Increase in MTTR waiting on Permits
            </div>
          </div>
          <p className="report-cause-desc">
            Permit delays are primarily due to coordination gaps between
            Operations and Maintenance teams on ground.
          </p>
          <div className="report-mini">
            <div className="report-mini-left">
              <div className="report-mini-label">Trend</div>
              <div className="report-mini-chart">
                <ResponsiveContainer width="100%" height={84}>
                  <BarChart
                    data={mini2}
                    margin={{ top: 8, left: 8, right: 8, bottom: 0 }}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#eef0f4"
                      strokeDasharray="4 4"
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                    />
                    <YAxis
                      domain={[115, 160]}
                      ticks={[115, 160]}
                      width={28}
                      tickLine={false}
                      axisLine={{ stroke: "#e5e7eb" }}
                      fontSize={10}
                    />
                    <Tooltip cursor={{ fill: "rgba(99,102,241,0.06)" }} />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      fill="#ef4444"
                      maxBarSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="report-mini-stat">
              <div className="report-mini-stat-val">+ 38%</div>
              <div className="report-mini-stat-sub">in last 3 months</div>
            </div>
          </div>
        </article>
      </div>

      <div className="report-attrib">
        <div className="report-attrib-title">Causes Attribution</div>
        <div className="report-attrib-grid">
          <div className="report-donut-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donut}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={64}
                  outerRadius={100}
                  cornerRadius={6}
                  paddingAngle={0}
                >
                  {donut.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={donutColors[i % donutColors.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="report-donut-center">60%</div>
            <div className="report-callout">
              Rapid increase in PM Work Orders
            </div>
          </div>
          <div className="report-attrib-legend">
            <span className="legend-pill red">
              Increase in MTTR due to waiting for Permits
              <span className="legend-count">3</span>
            </span>
            <span className="legend-pill blue">
              Rapid increase in PM Work Orders
              <span className="legend-count">5</span>
            </span>
          </div>
        </div>
      </div>

        <div className="report-sources">
          <div className="sources-head">Sources go here</div>
          <div className="sources-chips">
            {[
              "Hydraulic System Installment",
              "Hydraulic System Installment",
              "Repair Booster Pump",
              "Hydraulic System Installment",
              "Hydraulic System Installment",
              "Repair Booster Pump",
            ].map((t, i) => (
              <span key={i} className="chip-soft">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanAgentLoader({ onDone }) {
  const steps = [
    { label: "Collecting recent workorders", ms: 900 },
    { label: "Analyzing trends and bottlenecks", ms: 1100 },
    { label: "Cross-checking inventory and permits", ms: 900 },
    { label: "Synthesizing optimal actions", ms: 1100 },
    { label: "Drafting plan", ms: 900 },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setI((x) => x + 1), steps[i].ms);
    return () => clearTimeout(t);
  }, [i, steps, onDone]);
  return (
    <div className="agent-box">
      <div className="agent-title">Generating plan…</div>
      <div className="agent-steps">
        {steps.map((s, idx) => (
          <div
            key={s.label}
            className={`agent-step ${
              idx < i ? "done" : idx === i ? "active" : ""
            }`}
          >
            <span className="mini-dot" />
            <span className="mini-label">{s.label}</span>
            <span className="mini-time">{Math.round(s.ms / 100) / 10}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionPlanCards({
  title = "Recommended Action Plan",
  items = [],
  onStatusesChange,
}) {
  const [actions, setActions] = useState(() =>
    items.map((item, i) => {
      const obj =
        typeof item === "string" ? { text: item, type: "document" } : item;
      return {
        id: i,
        text: obj.text,
        type: obj.type ?? "document",
        status: "proposed",
      };
    })
  );
  const onStatusesChangeRef = useRef(onStatusesChange);

  useEffect(() => {
    onStatusesChangeRef.current = onStatusesChange;
  }, [onStatusesChange]);

  useEffect(() => {
    setActions(
      items.map((item, i) => {
        const obj =
          typeof item === "string" ? { text: item, type: "document" } : item;
        return {
          id: i,
          text: obj.text,
          type: obj.type ?? "document",
          status: "proposed",
        };
      })
    );
  }, [items]);

  useEffect(() => {
    onStatusesChangeRef.current?.(actions);
  }, [actions]);

  function updateStatus(id, status) {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  function approve(id) {
    updateStatus(id, "approved");
  }
  function reject(id) {
    updateStatus(id, "rejected");
  }

  function pill(status) {
    const map = {
      proposed: "Proposed",
      approved: "Approved",
      rejected: "Rejected",
    };
    return map[status] ?? status;
  }

  function typeChip(type) {
    const labelMap = {
      meeting: "Meeting",
      document: "Document",
      "wo-permit": "WO Permit",
      "round-plan": "Round Plan",
    };
    const label = labelMap[type] ?? type;
    return <span className="type-chip">{label}</span>;
  }

  return (
    <div className="plan-card">
      <div className="plan-title">{title}</div>
      <div className="actions-grid">
        {actions.map((a, idx) => (
          <article key={a.id} className={`action-card ${a.status}`}>
            <div className="action-card-head">
              <div className="action-card-title">Action {idx + 1}</div>
              <span className={`status-pill ${a.status}`}>
                {pill(a.status)}
              </span>
            </div>
            <p className="action-card-text">{a.text}</p>
            <div className="action-card-foot">
              {typeChip(a.type)}
              <div className="spacer" />
              <button
                className="btn sm"
                type="button"
                onClick={() => approve(a.id)}
                disabled={a.status === "approved"}
              >
                Approve
              </button>
              <button
                className="btn-outline sm"
                type="button"
                onClick={() => reject(a.id)}
                disabled={a.status === "rejected"}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CausesList({ onTakeAction, onPlansUpdate }) {
  const causes = [
    {
      rank: 1,
      title: "Rapid Increase in PM Work Orders",
      percent: 70,
      description:
        "Static PMs are not optimized with actual equipment condition and criticality, leading to unnecessary maintenance tasks.",
      metric: {
        type: "trendPercent",
        change: "+38%",
        caption: "in the last 2 months",
      },
    },
    {
      rank: 2,
      title: "Increase in MTTR due to Waiting for Permits",
      percent: 30,
      description:
        "Permit delays are primarily due to coordination gaps between Operations and Maintenance teams.",
      metric: {
        type: "mttr",
        from: "7.8h",
        to: "10.4h",
        caption: "Average MTTR over 3 months",
      },
    },
  ];

  const [mitigation, setMitigation] = useState({});
  const [planning, setPlanning] = useState({});
  const [plansActionsMap, setPlansActionsMap] = useState({});

  function planKey(cause, sub) {
    return sub ? `c${cause.rank}-s${sub.title}` : `c${cause.rank}`;
  }

  function generatePlanFor(cause, sub) {
    const topic = sub?.title ?? cause.title;
    if (cause.rank === 1) {
      return [
        {
          text: `Audit PM library to eliminate non-critical tasks for ${topic}`,
          type: "document",
        },
        {
          text: "Risk-rank assets and adjust PM frequencies using criticality + condition data",
          type: "document",
        },
        {
          text: "30-min sync between Ops, Maintenance, and EHS to review upcoming permit needs.",
          type: "meeting",
        },
        {
          text: "Set weekly review with planners to remove redundant inspections",
          type: "document",
        },
        {
          text: `Introduce an operator round plan for early anomaly detection around ${topic}`,
          type: "round-plan",
        },
      ];
    }
    return [
      {
        text: `Implement early permit pre-checks specifically for ${topic}`,
        type: "wo-permit",
      },
      {
        text: "Introduce shift handover checklist including pending permits",
        type: "document",
      },
      {
        text: "Create SLA with Operations for isolation/LOTO readiness",
        type: "wo-permit",
      },
      {
        text: `Pilot a focused round plan to validate permit prerequisites during preceding shift for ${topic}`,
        type: "round-plan",
      },
      {
        text: "Track MTTR by permit wait reason and publish weekly dashboard",
        type: "document",
      },
    ];
  }

  function handleGeneratePlan(cause, sub) {
    const key = planKey(cause, sub);
    setPlanning((p) => ({ ...p, [key]: { status: "loading" } }));
  }

  function handlePlanDone(cause, sub) {
    const key = planKey(cause, sub);
    setPlanning((p) => ({
      ...p,
      [key]: { status: "ready", items: generatePlanFor(cause, sub) },
    }));
  }

  function getSubCausesFor(cause) {
    if (cause.rank === 1) {
      return [
        {
          title: "Overly frequent PM intervals",
          percent: 45,
          description: "Intervals not adjusted for low-risk assets.",
          metric: {
            type: "trendPercent",
            change: "+18%",
            caption: "in the last 2 months",
          },
        },
        {
          title: "Template-based PM tasks",
          percent: 35,
          description: "Non-critical tasks executed across all equipment.",
          metric: {
            type: "trendPercent",
            change: "+11%",
            caption: "in the last 2 months",
          },
        },
        {
          title: "Redundant inspections",
          percent: 20,
          description: "Duplicate checks across successive PMs.",
          metric: {
            type: "trendPercent",
            change: "+6%",
            caption: "in the last 2 months",
          },
        },
      ];
    }
    return [
      {
        title: "Permit approvals after shift start",
        percent: 40,
        description: "Delays in approvals due to shift overlap.",
        metric: {
          type: "trendPercent",
          change: "+9%",
          caption: "over 3 months",
        },
      },
      {
        title: "Missing prerequisite checks",
        percent: 35,
        description: "Work paused to gather missing documentation.",
        metric: {
          type: "trendPercent",
          change: "+7%",
          caption: "over 3 months",
        },
      },
      {
        title: "Coordination with operations",
        percent: 25,
        description: "Waiting for asset isolation and LOTO.",
        metric: {
          type: "trendPercent",
          change: "+5%",
          caption: "over 3 months",
        },
      },
    ];
  }

  function handleMitigate(cause) {
    setMitigation((prev) => ({ ...prev, [cause.rank]: { status: "loading" } }));
  }

  function handleMiniDone(cause) {
    setMitigation((prev) => ({
      ...prev,
      [cause.rank]: { status: "ready", subCauses: getSubCausesFor(cause) },
    }));
  }

  function chipClass(p) {
    if (p >= 50) return "chip-high";
    if (p >= 20) return "chip-med";
    return "chip-low";
  }

  const handlePlanStatusesChange = useCallback(
    (parent, sub, actions) => {
      const key = planKey(parent, sub);
      setPlansActionsMap((prev) => {
        const next = { ...prev, [key]: actions };
        const allActions = Object.values(next).flat();
        const total = allActions.length;
        const allResolved =
          total > 0 && allActions.every((a) => a.status !== "proposed");
        const approved = allActions
          .filter((a) => a.status === "approved")
          .map((a) => ({ text: a.text, type: a.type }));
        onPlansUpdate?.({ allResolved, approved });
        return next;
      });
    },
    [onPlansUpdate]
  );

  return (
    <section className="causes-card" aria-label="Top 2 Causes">
      <div className="causes-header">
        <div>
          <div className="section-title">Top 2 Causes</div>
          <div className="causes-subtitle">
            Contributing to 7% increase in Maintenance Opex trend
          </div>
        </div>
        <div className="causes-stat">
          <div className="stat-value">+7%</div>
          <div className="stat-label">Opex increase</div>
        </div>
      </div>

      <ol className="causes-list">
        {causes.map((c) => (
          <li key={c.rank} className="cause-item elevated">
            <div className="cause-title-row">
              <span className="cause-rank-dark">{c.rank}</span>
              <div className="cause-title">{c.title}</div>
              <span className={`cause-chip ${chipClass(c.percent)}`}>
                {c.percent}%
              </span>
            </div>
            <p className="cause-desc">{c.description}</p>

            {c.metric?.type === "trendPercent" && (
              <div className="metric-box">
                <div className="metric-box-head">
                  <span className="metric-head-icon">
                    <IconTrend />
                  </span>
                  <span className="metric-head-title">Trend</span>
                </div>
                <div className="metric-hero metric-danger">
                  {c.metric.change}
                </div>
                <div className="metric-caption">{c.metric.caption}</div>
              </div>
            )}

            {c.metric?.type === "mttr" && (
              <div className="metric-box">
                <div className="metric-box-head">
                  <span className="metric-head-icon">
                    <IconTarget />
                  </span>
                  <span className="metric-head-title">Trend</span>
                </div>
                <div className="metric-hero">
                  <span className="metric-hero-value">{c.metric.from}</span>
                  <span className="metric-arrow">→</span>
                  <span className="metric-hero-value metric-danger">
                    {c.metric.to}
                  </span>
                </div>
                <div className="metric-caption">{c.metric.caption}</div>
              </div>
            )}

            <div className="cause-footer">
              <button
                type="button"
                className="btn sm"
                onClick={() => handleGeneratePlan(c)}
              >
                Generate Plan
              </button>
              <button
                type="button"
                className="btn-outline sm"
                onClick={() => handleMitigate(c)}
                disabled={mitigation[c.rank]?.status === "loading"}
              >
                {mitigation[c.rank]?.status === "loading"
                  ? "Mitigating…"
                  : "Mitigate"}
              </button>
            </div>

            {planning[planKey(c)]?.status === "loading" && (
              <PlanAgentLoader onDone={() => handlePlanDone(c)} />
            )}
            {planning[planKey(c)]?.status === "ready" && (
              <ActionPlanCards
                items={planning[planKey(c)].items}
                onStatusesChange={(actions) =>
                  handlePlanStatusesChange(c, undefined, actions)
                }
              />
            )}

            {mitigation[c.rank]?.status === "loading" && (
              <MiniTimelineLoader onDone={() => handleMiniDone(c)} />
            )}

            {mitigation[c.rank]?.status === "ready" && (
              <SubCauses
                items={mitigation[c.rank].subCauses}
                parentCause={c}
                onGeneratePlan={(parent, sub) =>
                  handleGeneratePlan(parent, sub)
                }
                planStateFor={(parent, sub) => planning[planKey(parent, sub)]}
                onPlanDone={(parent, sub) => handlePlanDone(parent, sub)}
                onPlanStatusesChange={handlePlanStatusesChange}
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Action() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialTextFromState = useMemo(() => state?.initialText ?? "", [state]);
  const [text, setText] = useState(initialTextFromState);
  const textareaRef = useRef(null);
  const pendingRequestRef = useRef(null);

  const [phase, setPhase] = useState("input");
  const [messages, setMessages] = useState([]);
  const [twoCol, setTwoCol] = useState(false);
  const [executeReady, setExecuteReady] = useState(false);
  const [approvedActions, setApprovedActions] = useState([]);
  const hasRequestedShiftRef = useRef(false);
  const [chartData, setChartData] = useState(null);
  const [chartReady, setChartReady] = useState(false);
  const [progressAtTop, setProgressAtTop] = useState(false);
  const [progressPct, setProgressPct] = useState(10);
  const [rightStage, setRightStage] = useState("chart"); // chart → collecting → references → hypothesis
  const rightFeedRef = useRef(null);
  const reportScrollRef = useRef(null);
  const [rightScrollAuto, setRightScrollAuto] = useState(false);
  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const [reportCollapsed, setReportCollapsed] = useState(false);
  const [actionsCollapsed, setActionsCollapsed] = useState(false);

  // Stage transitions for right pane
  useEffect(() => {
    if (progressAtTop && rightStage === "chart") {
      setRightStage("collecting");
    }
  }, [progressAtTop, rightStage]);

  useEffect(() => {
    if (rightStage === "collecting" && progressPct >= 50) {
      setRightStage("references");
    }
  }, [rightStage, progressPct]);

  // After references appear, show hypothesis shortly after
  useEffect(() => {
    if (
      (rightStage === "references" || rightStage === "collecting") &&
      progressPct >= 85
    ) {
      setRightStage("hypothesis");
    }
  }, [rightStage, progressPct]);

  // Smooth, continuous scroll loop synced with progress percentage
  const scrollStateRef = useRef({ raf: 0, running: false, target: 0 });

  // Start/stop the animation loop when twoCol changes
  useEffect(() => {
    if (!twoCol) return;
    const state = scrollStateRef.current;
    state.running = true;

    const tick = () => {
      if (!state.running) return;
      const el = rightFeedRef.current;
      if (!el) return;
      const max = Math.max(0, el.scrollHeight - el.clientHeight);
      const target = Math.min(max, state.target);
      const current = el.scrollTop;
      const delta = target - current;
      const abs = Math.abs(delta);
      // Spring-like approach for ultra-smooth motion
      const stiffness = 0.12; // lower = smoother
      const minStep = 0.2; // prevents tiny stalls
      if (abs > 0.5) {
        el.scrollTop = current + delta * stiffness + Math.sign(delta) * minStep;
      } else {
        el.scrollTop = target;
      }
      state.raf = requestAnimationFrame(tick);
    };

    state.raf = requestAnimationFrame(tick);
    return () => {
      state.running = false;
      cancelAnimationFrame(state.raf);
    };
  }, [twoCol]);

  // Update target position whenever progress (or content) changes
  useEffect(() => {
    const el = rightFeedRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    scrollStateRef.current.target = (progressPct / 100) * max;
  }, [progressPct, chartReady, rightStage]);

  // Ensure report scroll starts at top when it becomes visible at 100%
  useEffect(() => {
    if (progressPct === 100 && reportScrollRef.current) {
      try {
        reportScrollRef.current.scrollTop = 0;
      } catch (_) {}
    }
  }, [progressPct]);

  // Enable scrollbar only after first feed item after shimmer (references stage)
  useEffect(() => {
    if (rightStage === "references" || rightStage === "hypothesis") {
      setRightScrollAuto(true);
    }
  }, [rightStage]);

  useEffect(() => {
    setText(initialTextFromState);
  }, [initialTextFromState]);

  function autoSizeTextArea(el) {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(220, el.scrollHeight)}px`;
  }

  useEffect(() => {
    if (textareaRef.current && phase === "input") {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
      autoSizeTextArea(textareaRef.current);
    }
  }, [textareaRef, text, phase]);

  useEffect(() => {
    return () => {
      // Abort any in-flight request when navigating away
      try {
        pendingRequestRef.current?.abort();
      } catch (_) {
        // no-op
      }
    };
  }, []);

  async function sendPromptToAssistant(prompt) {
    // Cancel previous request if any
    try {
      pendingRequestRef.current?.abort();
    } catch (_) {
      // ignore
    }
    const controller = new AbortController();
    pendingRequestRef.current = controller;
    try {
      const result = await sendActionPrompt(prompt, {
        signal: controller.signal,
      });
      const assistantMessages = (result?.messages ?? []).map((m, idx) => ({
        id: Date.now() + idx + 1,
        role: m.role,
        text: m.text,
      }));
      if (assistantMessages.length) {
        setMessages((prev) => [...prev, ...assistantMessages]);
        if (result?.chart) setChartData(result.chart);
        // After the very first assistant response renders, wait briefly,
        // then shift to the two-column layout smoothly. Run only once.
        if (!hasRequestedShiftRef.current) {
          hasRequestedShiftRef.current = true;
          requestAnimationFrame(() => {
            setTimeout(() => setTwoCol(true), 2000);
          });
        }
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      // For now, fail silently to avoid UX changes; can add toast later
      // console.warn("Assistant request failed", err);
    }
  }

  // When a new chart payload arrives, show shimmer for a brief time before the chart
  useEffect(() => {
    if (!chartData) return;
    setChartReady(false);
    const t = setTimeout(() => setChartReady(true), 3000);
    return () => clearTimeout(t);
  }, [chartData]);

  function handleSubmit(event) {
    event.preventDefault();
    const prompt = text.trim();
    if (!prompt) return;
    // Add the user's message and switch to chat view
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: prompt },
    ]);
    setText("");
    setPhase("chat");
    setTwoCol(false); // start in single column; shift after first assistant reply
    hasRequestedShiftRef.current = false; // allow shift scheduling for this round
    setShowActionsPanel(false); // reset actions panel on new submit
    // Ask assistant (backend shim)
    sendPromptToAssistant(prompt);
  }

  function handleTakeActionCause(cause, subCause) {
    const label = subCause ? `${cause.title} → ${subCause.title}` : cause.title;
    alert(`Action created for: ${label}`);
    navigate("/");
  }

  function handlePlansUpdate({ allResolved, approved }) {
    setExecuteReady(allResolved);
    setApprovedActions(approved);
  }

  function handleBackClick() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  function handleFollowupClick(nextText) {
    setText(nextText);
    setShowActionsPanel(true);
  }

  return (
    <div className="action-overlay">
      <header className="action-header">
        <button
          className="header-back"
          onClick={handleBackClick}
          aria-label="Back"
        >
          <span className="back-icon" aria-hidden="true">
            <IconBack />
          </span>
          <span className="back-text">Back</span>
        </button>
        <div className="header-title">
          <span className="ai-brand">
            <IconBrand32 />
            AI Assistant
          </span>
        </div>
        <div className="header-spacer" />
      </header>
      <div className="action-content">
        {phase === "input" && (
          <div className="action-card" role="region" aria-label="Assistant">
            <h1 className="action-title">What's on your mind today?</h1>
            <form className="action-form" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="action-textarea">
                Describe your task
              </label>
              <div className="input-row">
                <span className="input-plus" aria-hidden="true">
                  📎
                </span>
                <textarea
                  id="action-textarea"
                  ref={textareaRef}
                  className="action-textarea"
                  placeholder="Deep dive into the month on month increased maintenance cost. Last month it was increased by 7%($450 annualized)"
                  rows={1}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    autoSizeTextArea(textareaRef.current);
                  }}
                />
                <div className="action-controls">
                  <button
                    type="button"
                    className="icon-button"
                    title="Voice input"
                    aria-label="Voice input"
                  >
                    <IconMic />
                  </button>
                  <button
                    type="submit"
                    className="icon-button primary"
                    title="Send"
                    aria-label="Send"
                    disabled={!text.trim()}
                  >
                    <IconSend />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {phase === "chat" && (
          <div className={`chat-container embedded ${showActionsPanel ? "wide" : ""}`}>
            <div className={`chat-body-grid ${twoCol ? "two-col" : ""}`}>
              <div className={`left-pane ${twoCol ? "shift-left" : ""}`}>
                <div className={`messages`} role="log" aria-live="polite">
                  {messages.map((m) => (
                    <div key={m.id} className={`bubble-row ${m.role}`}>
                      {m.role === "assistant" ? (
                        <>
                          <span className="assistant-avatar" aria-hidden="true">
                            <IconInnovaSmall />
                          </span>
                          <div className={`bubble ${m.role}`}>{m.text}</div>
                        </>
                      ) : (
                        <div className={`bubble ${m.role}`}>{m.text}</div>
                      )}
                    </div>
                  ))}
                </div>
                {twoCol && (
                  <AgentProgress
                    onCrossThreshold={() => setProgressAtTop(true)}
                    onProgressChange={setProgressPct}
                    threshold={40}
                  />
                )}
                {twoCol && progressPct >= 100 && (
                  <div className="followups-card">
                    <div className="followups-title">Suggested Follow-ups</div>
                    <div className="followup-list">
                      <button
                        type="button"
                        className="followup-btn"
                        onClick={() => handleFollowupClick("Validate with site data")}
                      >
                        Validate with site data →
                      </button>
                      <button
                        type="button"
                        className="followup-btn"
                        onClick={() => handleFollowupClick("Trace 3 months of permit delays")}
                      >
                        Trace 3 months of permit delays →
                      </button>
                      <button
                        type="button"
                        className="followup-btn"
                        onClick={() => handleFollowupClick("Create a 3-month cost-reduction roadmap")}
                      >
                        Create a 3-month cost-reduction roadmap →
                      </button>
                    </div>
                  </div>
                )}
                <form className="chat-input-form" onSubmit={handleSubmit}>
                  <label className="sr-only" htmlFor="action-textarea">
                    Type your message
                  </label>
                  <div className="input-row">
                    <span className="input-plus" aria-hidden="true">
                      📎
                    </span>
                    <textarea
                      id="action-textarea"
                      ref={textareaRef}
                      className="action-textarea"
                      placeholder="Type your next instruction…"
                      rows={1}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        autoSizeTextArea(textareaRef.current);
                      }}
                    />
                    <div className="action-controls">
                      <button
                        type="button"
                        className="icon-button"
                        title="Voice input"
                        aria-label="Voice input"
                      >
                        <IconMic />
                      </button>
                      <button
                        type="submit"
                        className="icon-button primary"
                        title="Send"
                        aria-label="Send"
                        disabled={!text.trim()}
                      >
                        <IconSend />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              {twoCol && (
                <div style={{ alignSelf: "start" }}>
                  <div className="right-title">
                    Causes for increased Maintenance Opex
                  </div>
                  {progressPct === 100 ? (
                    <div
                      className="report-scroll panel-animate-in"
                      ref={reportScrollRef}
                    >
                      <CausesReport collapsed={reportCollapsed} onToggleCollapse={() => setReportCollapsed(!reportCollapsed)} />
                      {showActionsPanel && (
                        <div className="panel-animate-in">
                          <RightActionsPanel collapsed={actionsCollapsed} onToggleCollapse={() => setActionsCollapsed(!actionsCollapsed)} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="right-feed"
                      ref={rightFeedRef}
                      style={{ overflowY: rightScrollAuto ? "auto" : "hidden" }}
                      aria-live="polite"
                    >
                      {/* Chart always first */}
                      <div className="panel-animate-in">
                        {chartReady ? (
                          <MemoChartPanel chart={chartData} />
                        ) : (
                          <RightShimmerPanel showProgress={false} />
                        )}
                      </div>

                      {/* Collecting stage when reached or later */}
                      {(rightStage === "collecting" ||
                        rightStage === "references" ||
                        rightStage === "hypothesis") && (
                        <div className="panel-animate-in">
                          <RightInfoInitialPanel />
                        </div>
                      )}

                      {/* References stage when reached or later */}
                      {(rightStage === "references" ||
                        rightStage === "hypothesis") && (
                        <div className="panel-animate-in">
                          <RightInfoPanel />
                        </div>
                      )}

                      {/* Hypothesis stage */}
                      {rightStage === "hypothesis" && (
                        <div className="panel-animate-in">
                          <RightHypothesisPanel />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "shimmer" && (
          <div className="loading-card" aria-busy="true">
            <div className="shimmer-line w-40" />
            <div className="shimmer-line w-80" />
            <div className="shimmer-line w-60" />
            <div className="shimmer-line w-90" />
            <div className="shimmer-line w-70" />
          </div>
        )}

        {phase === "graph" && (
          <div className="stack">
            <OpexChart animate onDone={() => setPhase("timeline")} />
          </div>
        )}

        {phase === "timeline" && (
          <div className="stack">
            <OpexChart animate={false} />
            <TimelineLoader onDone={() => setPhase("results")} />
          </div>
        )}

        {phase === "results" && (
          <div className="results-stack">
            <OpexChart animate={false} />
            <CausesList
              onTakeAction={handleTakeActionCause}
              onPlansUpdate={handlePlansUpdate}
            />
            <div className="results-actions">
              {executeReady && (
                <button
                  className="btn"
                  type="button"
                  onClick={() =>
                    navigate("/execute", {
                      state: { actions: approvedActions },
                    })
                  }
                  disabled={approvedActions.length === 0}
                >
                  Execute actions
                </button>
              )}
              <button
                className="btn-outline"
                type="button"
                onClick={() => setPhase("input")}
              >
                Ask another
              </button>
              <button
                className="btn-outline"
                type="button"
                onClick={() => navigate("/")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
