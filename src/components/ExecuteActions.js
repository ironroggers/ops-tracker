import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../screens/Action.css';

export default function ExecuteActions() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const actions = state?.actions ?? [];

  return (
    <div className="action-page">
      <header className="action-header">
        <button className="header-back" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <div className="header-title">Execute Actions</div>
        <div className="header-spacer" />
      </header>
      <div className="action-content">
        <div className="action-card">
          <div className="section-title">Approved actions</div>
          {actions.length === 0 ? (
            <p className="cause-desc">No approved actions to execute.</p>
          ) : (
            <ol className="causes-list">
              {actions.map((text, idx) => (
                <li key={idx} className="cause-item">
                  <div className="action-card-head">
                    <div className="action-card-title">Action {idx + 1}</div>
                    <span className="status-pill approved">Approved</span>
                  </div>
                  <p className="action-card-text">{text}</p>
                </li>
              ))}
            </ol>
          )}
          <div className="results-actions" style={{ marginTop: 12 }}>
            <button className="btn-outline" type="button" onClick={() => navigate('/')}>Back to Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
} 