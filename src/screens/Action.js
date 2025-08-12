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
          .map((a) => a.text);
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
  const [executeReady, setExecuteReady] = useState(false);
  const [approvedActions, setApprovedActions] = useState([]);

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
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      // For now, fail silently to avoid UX changes; can add toast later
      // console.warn("Assistant request failed", err);
    }
  }

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
            <svg className="ai-logo" viewBox="0 0 32 32" aria-hidden="true">
              <path
                d="M9.05059 16.1617C10.4292 17.4452 11.5413 19.7215 12.2154 21.3532C12.4567 21.9372 13.402 21.9372 13.6433 21.3532C14.3175 19.7215 15.4296 17.4452 16.8082 16.1617C18.0338 15.0206 20.0807 14.0957 21.5429 13.5322C22.112 13.3129 22.1549 12.4372 21.6073 12.1687C20.1446 11.4517 18.0602 10.3027 16.8082 9.05059C15.4888 7.73122 14.2839 5.48771 13.5782 4.0213C13.3275 3.5003 12.5312 3.5003 12.2805 4.0213C11.5749 5.48771 10.3699 7.73122 9.05059 9.05059C7.79851 10.3027 5.71412 11.4517 4.25148 12.1687C3.70382 12.4372 3.74677 13.3129 4.31589 13.5322C5.77809 14.0957 7.82494 15.0206 9.05059 16.1617Z"
                fill="#3D5AFE"
              />
              <path
                d="M21.3329 24.889C22.0222 25.5307 22.5783 26.6689 22.9153 27.4847C23.036 27.7767 23.5086 27.7767 23.6293 27.4847C23.9664 26.6689 24.5224 25.5307 25.2117 24.889C25.8245 24.3184 26.8479 23.856 27.579 23.5742C27.8636 23.4645 27.8851 23.0267 27.6113 22.8925C26.8799 22.534 25.8377 21.9594 25.2117 21.3334C24.552 20.6737 23.9495 19.552 23.5967 18.8188C23.4714 18.5583 23.0732 18.5583 22.9479 18.8188C22.5951 19.552 21.9926 20.6737 21.3329 21.3334C20.7069 21.9594 19.6647 22.534 18.9334 22.8925C18.6595 23.0267 18.681 23.4645 18.9656 23.5742C19.6967 23.856 20.7201 24.3184 21.3329 24.889Z"
                fill="#3D5AFE"
              />
            </svg>
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
          <div className="chat-container">
            <div className="messages" role="log" aria-live="polite">
              {messages.map((m) => (
                <div key={m.id} className={`bubble-row ${m.role}`}>
                  {m.role === "assistant" ? (
                    <>
                      <span className="assistant-avatar" aria-hidden="true">
                        <img src="/inn_logo.svg" alt="" />
                      </span>
                      <div className={`bubble ${m.role}`}>{m.text}</div>
                    </>
                  ) : (
                    <div className={`bubble ${m.role}`}>{m.text}</div>
                  )}
                </div>
              ))}
            </div>
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
