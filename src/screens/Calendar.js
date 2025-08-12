import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_API_DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];

export default function Calendar() {
  const navigate = useNavigate();
  const [gsiReady, setGsiReady] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [summary, setSummary] = useState('Ops Review Meeting');
  const [description, setDescription] = useState('Discuss action items and timelines.');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState(() => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(() => new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [attendees, setAttendees] = useState('');

  const clientId = useMemo(() => process.env.REACT_APP_GOOGLE_CLIENT_ID || '', []);
  const apiKey = useMemo(() => process.env.REACT_APP_GOOGLE_API_KEY || '', []);

  // Load Google Identity Services
  useEffect(() => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      setGsiReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiReady(true);
    script.onerror = () => setError('Failed to load Google Identity Services');
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  // Load gapi for Calendar discovery doc
  useEffect(() => {
    if (!gsiReady) return;
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.gapi.load('client', async () => {
        try {
          // @ts-ignore
          await window.gapi.client.init({ apiKey, discoveryDocs: GOOGLE_API_DISCOVERY_DOCS });
        } catch (e) {
          setError('Failed to initialize Google API client');
        }
      });
    };
    script.onerror = () => setError('Failed to load Google API script');
    document.body.appendChild(script);
    return () => script.remove();
  }, [gsiReady, apiKey]);

  // Configure token client
  useEffect(() => {
    if (!gsiReady || !clientId) return;
    // @ts-ignore
    const tc = window.google?.accounts?.oauth2?.initTokenClient?.({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (resp) => {
        if (resp && resp.access_token) {
          setAccessToken(resp.access_token);
          setError(null);
        } else {
          setError('Authorization failed');
        }
      },
    });
    setTokenClient(tc || null);
  }, [gsiReady, clientId]);

  const authorize = useCallback(() => {
    if (!tokenClient) return;
    setSuccess(null);
    // @ts-ignore
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
  }, [tokenClient, accessToken]);

  const handleCreateEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!accessToken) {
        setLoading(false);
        setError('Please authorize Google Calendar first');
        return;
      }
      // @ts-ignore
      window.gapi.client.setToken({ access_token: accessToken });

      const event = {
        summary,
        location: location || undefined,
        description: description || undefined,
        start: {
          dateTime: new Date(startTime).toISOString(),
        },
        end: {
          dateTime: new Date(endTime).toISOString(),
        },
        attendees: attendees
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((email) => ({ email })),
        reminders: {
          useDefault: true,
        },
      };

      // @ts-ignore
      const resp = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      if (resp.status === 200 || resp.status === 201) {
        setSuccess('Meeting created in Google Calendar');
      } else {
        setError('Failed to create event');
      }
    } catch (e) {
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  }, [accessToken, summary, description, location, startTime, endTime, attendees]);

  return (
    <div className="action-page">
      <header className="action-header">
        <button className="header-back" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <div className="header-title">Calendar</div>
        <div className="header-spacer" />
      </header>

      <div className="action-content">
        <div className="action-card">
          <div className="section-title">Create a meeting</div>

          {!clientId && (
            <p className="cause-desc">Set <code>REACT_APP_GOOGLE_CLIENT_ID</code> and <code>REACT_APP_GOOGLE_API_KEY</code> in your environment.</p>
          )}

          <div className="grid" style={{ gap: 12 }}>
            <label className="field">
              <span className="field-label">Title</span>
              <input className="field-input" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Meeting title" />
            </label>
            <label className="field">
              <span className="field-label">Description</span>
              <textarea className="field-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details" />
            </label>
            <label className="field">
              <span className="field-label">Location</span>
              <input className="field-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
            </label>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label className="field">
                <span className="field-label">Start time</span>
                <input type="datetime-local" className="field-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </label>
              <label className="field">
                <span className="field-label">End time</span>
                <input type="datetime-local" className="field-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </label>
            </div>
            <label className="field">
              <span className="field-label">Attendees</span>
              <input className="field-input" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="email1@example.com, email2@example.com" />
            </label>
          </div>

          <div className="results-actions" style={{ marginTop: 12 }}>
            <button className="btn" type="button" onClick={authorize} disabled={!tokenClient}>Authorize Google</button>
            <button className="btn" type="button" onClick={handleCreateEvent} disabled={loading || !accessToken}>{loading ? 'Creating…' : 'Create event'}</button>
            <button className="btn-outline" type="button" onClick={() => navigate('/')}>Back to Dashboard</button>
          </div>

          {error && <p className="cause-desc" style={{ color: '#b91c1c' }}>{error}</p>}
          {success && <p className="cause-desc" style={{ color: '#047857' }}>{success}</p>}
        </div>
      </div>
    </div>
  );
} 