import React, { useMemo, useState } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';

function formatCurrency(amount) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatHours(hours) {
  return Number(hours).toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M12 2l7 3v6c0 5-3.5 9.4-7 11-3.5-1.6-7-6-7-11V5l7-3z"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v6l5 3 .9-1.5L13 12V7z"/>
    </svg>
  );
}

function IconWrench() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M22 7.2l-5.2 5.2-2.2-2.2L19.8 5a6 6 0 11-9 7.2l-7 7L2 22l7-7A6 6 0 0019 5l3 2.2z"/>
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M4 22h16v-2H4V4H2v18h2zm4-4h3V10H8v8zm5 0h3V6h-3v12zm5 0h3V13h-3v5z"/>
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z"/>
    </svg>
  );
}

function TrendChip({ direction, percent }) {
  const isUp = direction === 'up';
  return (
    <span className={`trend-chip ${isUp ? 'up' : 'down'}`} aria-label={`Trend ${direction} ${percent}%`}>
      <span className="trend-arrow" aria-hidden="true">{isUp ? '▲' : '▼'}</span>
      {percent}% vs last period
    </span>
  );
}

function AlertBanner({ message, onClose, actionTo = '/action', actionLabel = 'Take Action' }) {
  return (
    <div className="alert-banner alert-warning" role="alert">
      <span className="alert-icon" aria-hidden="true"><IconAlert /></span>
      <p className="alert-message">{message}</p>
      <div className="alert-actions">
        <Link to={actionTo} state={{ initialText: message }} className="btn btn-primary">{actionLabel}</Link>
        <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Dismiss alert">Dismiss</button>
      </div>
    </div>
  );
}

function Sparkline({ data, color }) {
  const width = 120;
  const height = 36;
  const padding = 2;

  const points = useMemo(() => {
    if (!data || data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = Math.max(1, max - min);
    return data
      .map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (width - padding * 2);
        const y = padding + (1 - (value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(' ');
  }, [data]);

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

function KpiCard({ title, Icon, value, unit, subtitle, accent, trendPercent, trendDirection, sparklineData, sparklineColor, progressPercent }) {
  return (
    <article className={`dashboard-card ${accent}`} role="region" aria-label={title}>
      <div className="card-header">
        <span className={`icon-badge ${accent}`} aria-hidden="true">
          <Icon />
        </span>
        <span className="card-title">{title}</span>
      </div>

      <div className="card-value-row">
        <span className="card-value">{value}</span>
        {unit ? <span className="card-unit">{unit}</span> : null}
      </div>

      {subtitle ? <div className="card-subtitle">{subtitle}</div> : null}

      {typeof progressPercent === 'number' ? (
        <div className="progress-bar" aria-label={`${title} progress`}>
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      ) : null}

      {sparklineData && sparklineData.length ? (
        <div className="card-sparkline">
          <Sparkline data={sparklineData} color={sparklineColor} />
        </div>
      ) : null}

      <div className="card-footer">
        <TrendChip direction={trendDirection} percent={trendPercent} />
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState('Month');
  const [showOpexAlert, setShowOpexAlert] = useState(true);

  const base = useMemo(() => ({
    safety: { count: 2, trendPercent: 12, trendDirection: 'down', spark: [6, 5, 4, 3, 4, 3, 2] },
    downtime: { hours: 14.5, trendPercent: 8, trendDirection: 'up', spark: [1, 2, 1.8, 2.4, 2.2, 2.6, 2.9] },
    cost: { usd: 48200, trendPercent: 4, trendDirection: 'up', spark: [30, 32, 34, 35, 36, 38, 40] },
    productivity: { rate: 92, trendPercent: 3, trendDirection: 'up', spark: [86, 88, 87, 89, 90, 91, 92] },
  }), []);

  const metrics = useMemo(() => {
    const multipliers = { Week: 0.25, Month: 1, Quarter: 3 };
    const m = multipliers[timeframe] ?? 1;
    return {
      safety: { ...base.safety, count: Math.max(0, Math.round(base.safety.count * m)) },
      downtime: { ...base.downtime, hours: Number((base.downtime.hours * m).toFixed(1)) },
      cost: { ...base.cost, usd: Math.round(base.cost.usd * m) },
      productivity: base.productivity,
    };
  }, [base, timeframe]);

  return (
    <main className="dashboard-container">
      <section className="dashboard-toolbar">
        <div className="toolbar-left">
          <h1>Operations Dashboard</h1>
          <p className="dashboard-subtitle">Live snapshot of key metrics</p>
        </div>
        <div className="toolbar-right">
          <label className="sr-only" htmlFor="timeframe">Timeframe</label>
          <select id="timeframe" className="timeframe-select" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option>Week</option>
            <option>Month</option>
            <option>Quarter</option>
          </select>
          <button className="btn" type="button" onClick={() => window.location.reload()}>Refresh</button>
        </div>
      </section>

      {showOpexAlert && (
        <section className="dashboard-alerts">
          <AlertBanner
            message={"I can see increase in OPEX from last 3 months. Lets find RCA and resolve this issue."}
            onClose={() => setShowOpexAlert(false)}
          />
        </section>
      )}

      <section className="dashboard-grid" aria-label="Key performance indicators">
        <KpiCard
          title="Safety Incidents"
          Icon={IconShield}
          value={metrics.safety.count}
          unit="this period"
          subtitle="Lower is better"
          accent="accent-safety"
          trendPercent={metrics.safety.trendPercent}
          trendDirection={metrics.safety.trendDirection}
          sparklineData={metrics.safety.spark}
          sparklineColor="#ea580c"
        />

        <KpiCard
          title="Asset Downtime"
          Icon={IconClock}
          value={formatHours(metrics.downtime.hours)}
          unit="hours"
          subtitle="Total across critical assets"
          accent="accent-downtime"
          trendPercent={metrics.downtime.trendPercent}
          trendDirection={metrics.downtime.trendDirection}
          sparklineData={metrics.downtime.spark}
          sparklineColor="#2563eb"
        />

        <KpiCard
          title="Maintenance Cost"
          Icon={IconWrench}
          value={formatCurrency(metrics.cost.usd)}
          unit=""
          subtitle="Material + labor"
          accent="accent-cost"
          trendPercent={metrics.cost.trendPercent}
          trendDirection={metrics.cost.trendDirection}
          sparklineData={metrics.cost.spark}
          sparklineColor="#6b7280"
        />

        <KpiCard
          title="Productivity"
          Icon={IconChart}
          value={`${metrics.productivity.rate}%`}
          unit="rate"
          subtitle="Output vs capacity"
          accent="accent-productivity"
          trendPercent={metrics.productivity.trendPercent}
          trendDirection={metrics.productivity.trendDirection}
          sparklineData={metrics.productivity.spark}
          sparklineColor="#059669"
          progressPercent={metrics.productivity.rate}
        />
      </section>
    </main>
  );
} 