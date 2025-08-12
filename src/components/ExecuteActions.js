import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../screens/Action.css';
import WoPermitGif from '../assets/Create using AI (3).gif';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const EXEC_TIMEOUT_MS = 15000; // safety fallback
const HARDCODED_ATTENDEES = [
  // 'ritikchauhan67215@gmail.com',
  // 'vivekskale03@gmail.com',
  // 'pasari.rashi99@gmail.com',
  // 'apurv.Srivastava@innovapptive.com',
];
const TIMELINE_STEPS = ['Creating EHS Meet', 'Inviting People', 'Finding Time', 'Blocking Calendar'];
const TIMELINE_STEP_MS = 1500;
const AI_THINK_MS = 5000;
const THINK_TYPE_INTERVAL_MS = 18;
const THINK_CURSOR_BLINK_MS = 500;

// WO-PERMIT specific loader steps
const WOP_STEPS = ['Authoring Permit Forms', 'Attaching it with Workorders', 'Saving Edits', 'Done'];
const WOP_STEP_MS = 1500;

export default function ExecuteActions() {
  const navigate = useNavigate();
  const { state } = useLocation();
  function normalizeType(t) {
    const s = String(t ?? '').toLowerCase().trim();
    if (s === 'meeting') return 'meeting';
    if (s === 'wo-permit' || s === 'wo permit' || s === 'permit' || s === 'wo' || s === 'wo_permit' || s === 'wopermit') return 'wo-permit';
    if (s === 'round-plan' || s === 'round plan' || s === 'roundplan' || s === 'round_plan') return 'round-plan';
    if (s === 'document' || s === 'documents' || s === 'doc') return 'document';
    return 'document';
  }
  const actions = useMemo(() => {
    const raw = state?.actions ?? [];
    return raw.map((item) => {
      if (typeof item === 'string') return { text: item, type: 'document' };
      const type = normalizeType(item.type);
      return { text: item.text, type };
    });
  }, [state]);

  const [statuses, setStatuses] = useState(() => actions.map(() => 'approved'));

  // Expanded document editors and content per index
  const [expandedDocs, setExpandedDocs] = useState({}); // { [index:number]: boolean }
  const [docContents, setDocContents] = useState({}); // { [index:number]: string }
  const defaultDocContentFor = useCallback((index, text) => {
    return `Action ${index + 1} Document\n\n${text || ''}\n\nWrite your notes here...`;
  }, []);
  // aiGenRef entry shape:
  // thinking: { phase:'thinking', thoughtFull:string, thoughtVisible:string, thoughtCursor:number, thoughtTypingId?:number, blinkId?:number, blinkOn:boolean, writeTimeoutId:number }
  // writing:  { phase:'writing', fullText:string, cursor:number, typingId:number }
  const aiGenRef = useRef({});
  const isGenerating = useCallback((index) => Boolean(aiGenRef.current[index]), []);
  const stopAIGeneration = useCallback((index) => {
    const entry = aiGenRef.current[index];
    if (!entry) return;
    if (entry.typingId) clearInterval(entry.typingId);
    if (entry.thoughtTypingId) clearInterval(entry.thoughtTypingId);
    if (entry.blinkId) clearInterval(entry.blinkId);
    if (entry.timeoutId) clearTimeout(entry.timeoutId);
    if (entry.writeTimeoutId) clearTimeout(entry.writeTimeoutId);
    delete aiGenRef.current[index];
  }, []);
  const buildAIDocument = useCallback((index, actionText) => {
    const title = `Action ${index + 1}: ${actionText || 'Document'}`;
    const today = new Date().toLocaleString();
    return (
      `${title}\n\n` +
      `Generated: ${today}\n\n` +
      `Executive Summary\n` +
      `- Objective: Outline the action and concrete next steps.\n` +
      `- Scope: Define what is in and out of scope.\n` +
      `- Outcome: What success looks like.\n\n` +
      `Details\n` +
      `1) Context\n` +
      `   Provide background, constraints, and assumptions related to: ${actionText || 'the action.'}\n\n` +
      `2) Analysis\n` +
      `   Key findings, risks, and mitigations. Include data points and references if available.\n\n` +
      `3) Plan\n` +
      `   - Tasks\n` +
      `   - Owners\n` +
      `   - Timeline\n` +
      `   - Dependencies\n\n` +
      `4) Acceptance Criteria\n` +
      `   - Clear, measurable checkpoints to validate completion.\n\n` +
      `Notes\n` +
      `Add any additional observations, links, or open questions.`
    );
  }, []);
  const buildAIThought = useCallback((index, actionText) => {
    const subject = actionText || 'this action';
    return `Planning outline for ${subject}: Objective → Scope → Outcome → Context → Analysis → Plan (Tasks, Owners, Timeline, Dependencies) → Acceptance Criteria.`;
  }, []);
  const startAIGeneration = useCallback((index, actionText) => {
    stopAIGeneration(index);
    const fullText = buildAIDocument(index, actionText);
    // Overwrite content and stream from start
    setDocContents((prev) => ({ ...prev, [index]: '' }));
    let cursor = 0;
    const tick = () => {
      const remaining = fullText.length - cursor;
      if (remaining <= 0) {
        stopAIGeneration(index);
        setStatusAt(index, 'executed');
        return;
      }
      const chunkLen = Math.min(remaining, Math.floor(Math.random() * 4) + 1); // 1-4 chars
      const nextChunk = fullText.slice(cursor, cursor + chunkLen);
      cursor += chunkLen;
      setDocContents((prev) => ({ ...prev, [index]: (prev[index] || '') + nextChunk }));
    };
    const typingId = setInterval(tick, 18); // typing cadence
    aiGenRef.current[index] = { typingId, cursor: 0, fullText, phase: 'writing' };
  }, [buildAIDocument, stopAIGeneration]);
  useEffect(() => () => {
    // Cleanup all generators on unmount
    Object.values(aiGenRef.current).forEach((entry) => {
      if (entry?.typingId) clearInterval(entry.typingId);
      if (entry?.thoughtTypingId) clearInterval(entry.thoughtTypingId);
      if (entry?.blinkId) clearInterval(entry.blinkId);
      if (entry?.timeoutId) clearTimeout(entry.timeoutId);
      if (entry?.writeTimeoutId) clearTimeout(entry.writeTimeoutId);
    });
    aiGenRef.current = {};
  }, []);
  const startAIThinking = useCallback((index, actionText) => {
    stopAIGeneration(index);
    const thoughtFull = buildAIThought(index, actionText);
    // Trigger UI to show thinking state
    setDocContents((prev) => ({ ...prev, [index]: '' }));

    // Create entry now so intervals can reference it
    aiGenRef.current[index] = {
      phase: 'thinking',
      thoughtFull,
      thoughtVisible: '',
      thoughtCursor: 0,
      blinkOn: true,
    };

    // Typing effect for the thought
    const thoughtTypingId = setInterval(() => {
      const entry = aiGenRef.current[index];
      if (!entry || entry.phase !== 'thinking') return;
      const remaining = entry.thoughtFull.length - entry.thoughtCursor;
      if (remaining <= 0) {
        clearInterval(entry.thoughtTypingId);
        delete entry.thoughtTypingId;
        return;
      }
      const chunkLen = Math.min(remaining, Math.floor(Math.random() * 3) + 1); // 1-3 chars
      const nextChunk = entry.thoughtFull.slice(entry.thoughtCursor, entry.thoughtCursor + chunkLen);
      entry.thoughtCursor += chunkLen;
      entry.thoughtVisible = (entry.thoughtVisible || '') + nextChunk;
      setExecInfoVersion((v) => v + 1);
    }, THINK_TYPE_INTERVAL_MS);

    // Blinking cursor while thinking
    const blinkId = setInterval(() => {
      const entry = aiGenRef.current[index];
      if (!entry || entry.phase !== 'thinking') return;
      entry.blinkOn = !entry.blinkOn;
      setExecInfoVersion((v) => v + 1);
    }, THINK_CURSOR_BLINK_MS);

    // Switch to writing after fixed think duration
    const writeTimeoutId = setTimeout(() => {
      const entry = aiGenRef.current[index];
      if (!entry || entry.phase !== 'thinking') return;
      if (entry.thoughtTypingId) clearInterval(entry.thoughtTypingId);
      if (entry.blinkId) clearInterval(entry.blinkId);
      startAIGeneration(index, actionText);
    }, AI_THINK_MS);

    // Store timer handles
    aiGenRef.current[index].thoughtTypingId = thoughtTypingId;
    aiGenRef.current[index].blinkId = blinkId;
    aiGenRef.current[index].writeTimeoutId = writeTimeoutId;
  }, [stopAIGeneration, startAIGeneration, buildAIThought]);

  // Generic pre-execution thinking that runs for AI_THINK_MS, then invokes onFinish()
  const startPreExecuteThinking = useCallback((index, actionText, onFinish) => {
    stopAIGeneration(index);
    const thoughtFull = buildAIThought(index, actionText);
    aiGenRef.current[index] = {
      phase: 'thinking',
      thoughtFull,
      thoughtVisible: '',
      thoughtCursor: 0,
      blinkOn: true,
    };
    const thoughtTypingId = setInterval(() => {
      const entry = aiGenRef.current[index];
      if (!entry || entry.phase !== 'thinking') return;
      const remaining = entry.thoughtFull.length - entry.thoughtCursor;
      if (remaining <= 0) {
        clearInterval(entry.thoughtTypingId);
        delete entry.thoughtTypingId;
        return;
      }
      const chunkLen = Math.min(remaining, Math.floor(Math.random() * 3) + 1);
      const nextChunk = entry.thoughtFull.slice(entry.thoughtCursor, entry.thoughtCursor + chunkLen);
      entry.thoughtCursor += chunkLen;
      entry.thoughtVisible = (entry.thoughtVisible || '') + nextChunk;
      setExecInfoVersion((v) => v + 1);
    }, THINK_TYPE_INTERVAL_MS);
    const blinkId = setInterval(() => {
      const entry = aiGenRef.current[index];
      if (!entry || entry.phase !== 'thinking') return;
      entry.blinkOn = !entry.blinkOn;
      setExecInfoVersion((v) => v + 1);
    }, THINK_CURSOR_BLINK_MS);
    const writeTimeoutId = setTimeout(() => {
      const entry = aiGenRef.current[index];
      if (!entry || entry.phase !== 'thinking') return;
      if (entry.thoughtTypingId) clearInterval(entry.thoughtTypingId);
      if (entry.blinkId) clearInterval(entry.blinkId);
      if (entry.writeTimeoutId) clearTimeout(entry.writeTimeoutId);
      delete aiGenRef.current[index];
      setExecInfoVersion((v) => v + 1);
      onFinish?.();
    }, AI_THINK_MS);
    aiGenRef.current[index].thoughtTypingId = thoughtTypingId;
    aiGenRef.current[index].blinkId = blinkId;
    aiGenRef.current[index].writeTimeoutId = writeTimeoutId;
  }, [stopAIGeneration, buildAIThought]);
  const toggleDocExpanded = useCallback((index, actionText) => {
    setExpandedDocs((prev) => {
      const wasExpanded = !!prev[index];
      const nextExpanded = !wasExpanded;
      const next = { ...prev, [index]: nextExpanded };
      if (nextExpanded) {
        setDocContents((prevDocs) => {
          if (prevDocs[index] != null) return prevDocs;
          return { ...prevDocs, [index]: defaultDocContentFor(index, actionText) };
        });
      } else {
        // Stop any ongoing generation when collapsing
        stopAIGeneration(index);
      }
      return next;
    });
  }, [defaultDocContentFor, stopAIGeneration]);
  const handleDocChange = useCallback((index, value) => {
    setDocContents((prev) => ({ ...prev, [index]: value }));
  }, []);
  const handleClearDoc = useCallback((index) => {
    stopAIGeneration(index);
    setDocContents((prev) => ({ ...prev, [index]: '' }));
  }, [stopAIGeneration]);
  const handleDownloadDoc = useCallback((index) => {
    const text = docContents[index] || '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Action_Document_${index + 1}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 0);
  }, [docContents]);
  const handleMarkDocExecuted = useCallback((index) => {
    stopAIGeneration(index);
    setStatusAt(index, 'executed');
  }, [stopAIGeneration]);

  const [gsiReady, setGsiReady] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [error, setError] = useState(null);
  const pendingExecuteIndexRef = useRef(null);
  const [authStatus, setAuthStatus] = useState('unknown'); // 'unknown' | 'authorized' | 'unauthorized'
  const authAttemptRef = useRef('idle'); // 'idle' | 'silent' | 'user' | 'exec'

  // Quick preload for WO-permit GIF to minimize jank on first use
  const [woGifLoaded, setWoGifLoaded] = useState(false);
  const woGifUrl = WoPermitGif;
  useEffect(() => {
    const img = new Image();
    img.src = woGifUrl;
    img.onload = () => setWoGifLoaded(true);
  }, [woGifUrl]);

  const clientId = useMemo(() => process.env.REACT_APP_GOOGLE_CLIENT_ID || '', []);

  const hasMeetingActions = useMemo(() => actions.some((a) => a.type === 'meeting'), [actions]);

  // Startup diagnostics
  useEffect(() => {
    console.log('[ExecuteActions] env presence', {
      hasClientId: Boolean(clientId),
    });
  }, [clientId]);

  // Keep latest actions in a ref to avoid unstable deps
  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  // Per-item progress info (rendered inline)
  const execInfoRef = useRef({});
  const [, setExecInfoVersion] = useState(0);
  function setExecInfo(index, msg) {
    execInfoRef.current = { ...execInfoRef.current, [index]: msg };
    setExecInfoVersion((v) => v + 1);
  }
  function clearExecInfo(index) {
    if (execInfoRef.current[index]) {
      const next = { ...execInfoRef.current };
      delete next[index];
      execInfoRef.current = next;
      setExecInfoVersion((v) => v + 1);
    }
  }

  // Per-item timeline state
  const execTimelineRef = useRef({}); // index -> { current:number, timers:number[], timelineComplete:boolean, apiDone:boolean }
  function clearTimeline(index) {
    const tl = execTimelineRef.current[index];
    if (tl?.timers) {
      tl.timers.forEach((t) => clearTimeout(t));
    }
    const next = { ...execTimelineRef.current };
    delete next[index];
    execTimelineRef.current = next;
    setExecInfoVersion((v) => v + 1);
  }
  function startTimeline(index) {
    clearTimeline(index);
    const timers = [];
    execTimelineRef.current[index] = { current: -1, timers, timelineComplete: false, apiDone: false };
    TIMELINE_STEPS.forEach((_, stepIdx) => {
      const id = setTimeout(() => {
        const tl = execTimelineRef.current[index];
        if (!tl) return;
        tl.current = stepIdx;
        setExecInfoVersion((v) => v + 1);
      }, stepIdx * TIMELINE_STEP_MS);
      timers.push(id);
    });
    // On timeline finished
    const doneId = setTimeout(() => {
      const tl = execTimelineRef.current[index];
      if (!tl) return;
      tl.timelineComplete = true;
      setExecInfoVersion((v) => v + 1);
      // If API already finished, finalize now
      if (tl.apiDone) {
        setStatusAt(index, 'executed');
        clearExecInfo(index);
        clearExecTimeout(index);
        clearTimeline(index);
      }
    }, TIMELINE_STEPS.length * TIMELINE_STEP_MS);
    timers.push(doneId);
  }
  const onApiSuccess = useCallback((index) => {
    const tl = execTimelineRef.current[index];
    if (tl) {
      tl.apiDone = true;
      if (tl.timelineComplete) {
        setStatusAt(index, 'executed');
        clearExecInfo(index);
        clearExecTimeout(index);
        clearTimeline(index);
      }
      return;
    }
    // No timeline (should not happen), finalize immediately
    setStatusAt(index, 'executed');
    clearExecInfo(index);
    clearExecTimeout(index);
  }, []);
  const onApiFailure = useCallback((index) => {
    clearTimeline(index);
  }, []);

  // Timeout map per index
  const execTimeoutsRef = useRef({});
  function startExecTimeout(index) {
    clearExecTimeout(index);
    execTimeoutsRef.current[index] = setTimeout(() => {
      console.warn('[ExecuteActions] Timeout waiting for Google readiness or API response for index', index);
      setStatusAt(index, 'approved');
      setExecInfo(index, 'Took too long. Google not ready or network issue. Please try again.');
      clearTimeline(index);
    }, EXEC_TIMEOUT_MS);
  }
  function clearExecTimeout(index) {
    const t = execTimeoutsRef.current[index];
    if (t) {
      clearTimeout(t);
      delete execTimeoutsRef.current[index];
    }
  }
  useEffect(() => () => {
    Object.values(execTimeoutsRef.current).forEach((t) => clearTimeout(t));
  }, []);

  function setStatusAt(index, status) {
    setStatuses((prev) => prev.map((s, i) => (i === index ? status : s)));
  }

  // Load Google Identity Services
  useEffect(() => {
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      console.log('[ExecuteActions] GSI script already present');
      setGsiReady(true);
    } else {
      console.log('[ExecuteActions] Loading GSI script');
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('[ExecuteActions] GSI loaded');
        setGsiReady(true);
      };
      script.onerror = () => setError('Failed to load Google Identity Services');
      document.body.appendChild(script);
    }
  }, []);

  // Configure token client when GSI is ready
  useEffect(() => {
    if (!gsiReady) {
      return;
    }
    if (!clientId) {
      console.warn('[ExecuteActions] Missing REACT_APP_GOOGLE_CLIENT_ID');
      return;
    }
    // @ts-ignore
    const tc = window.google?.accounts?.oauth2?.initTokenClient?.({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (resp) => {
        const attempt = authAttemptRef.current;
        console.log('[ExecuteActions] token callback', resp, { attempt });
        if (resp && resp.access_token) {
          setAccessToken(resp.access_token);
          const seconds = Number(resp.expires_in) || 3600;
          setTokenExpiresAt(Date.now() + seconds * 1000);
          setError(null);
          setAuthStatus('authorized');
          if (pendingExecuteIndexRef.current != null) {
            const idx = pendingExecuteIndexRef.current;
            pendingExecuteIndexRef.current = null;
            // Timeline already started in the click; proceed to create event
            handleCreateEventForIndexRef.current?.(idx);
          }
        } else {
          // Do not surface an error here; empty callbacks can happen. Only adjust auth state for silent checks.
          if (attempt === 'silent') {
            setAuthStatus('unauthorized');
            if (pendingExecuteIndexRef.current != null) {
              setStatusAt(pendingExecuteIndexRef.current, 'approved');
              clearExecTimeout(pendingExecuteIndexRef.current);
              clearTimeline(pendingExecuteIndexRef.current);
              pendingExecuteIndexRef.current = null;
            }
          }
        }
        authAttemptRef.current = 'idle';
      },
      error_callback: (err) => {
        const attempt = authAttemptRef.current;
        console.warn('[ExecuteActions] token error_callback', err, { attempt });
        if (attempt === 'silent') {
          // Silent failures should not show user-facing errors
          setAuthStatus('unauthorized');
          if (pendingExecuteIndexRef.current != null) {
            setStatusAt(pendingExecuteIndexRef.current, 'approved');
            clearExecTimeout(pendingExecuteIndexRef.current);
            clearTimeline(pendingExecuteIndexRef.current);
            pendingExecuteIndexRef.current = null;
          }
        } else {
          // Only now surface an authorization failure to the UI
          setError('Authorization failed');
          if (pendingExecuteIndexRef.current != null) {
            setStatusAt(pendingExecuteIndexRef.current, 'approved');
            setExecInfo(pendingExecuteIndexRef.current, 'Authorization failed. Please try again.');
            clearExecTimeout(pendingExecuteIndexRef.current);
            clearTimeline(pendingExecuteIndexRef.current);
            pendingExecuteIndexRef.current = null;
          }
        }
        authAttemptRef.current = 'idle';
      },
    });
    setTokenClient(tc || null);
    console.log('[ExecuteActions] token client initialized');
    if (tc) {
      // Attempt silent authorization to detect existing session without prompting the user
      authAttemptRef.current = 'silent';
      // @ts-ignore
      tc.requestAccessToken({ prompt: '' });
    }
  }, [gsiReady, clientId]);

  // Auto refresh access token shortly before expiry
  useEffect(() => {
    if (!tokenClient || !tokenExpiresAt) return;
    const now = Date.now();
    const timeLeft = tokenExpiresAt - now;
    // If long-lived (> 2 min), refresh 60s before expiry; otherwise refresh 1s before
    const msUntilRefresh = timeLeft > 120000
      ? Math.max(1000, timeLeft - 60000)
      : Math.max(1000, timeLeft - 1000);
    const id = setTimeout(() => {
      console.log('[ExecuteActions] silently refreshing access token');
      // @ts-ignore
      tokenClient.requestAccessToken({ prompt: '' });
    }, msUntilRefresh);
    return () => clearTimeout(id);
  }, [tokenClient, tokenExpiresAt]);

  const handleCreateEventForIndex = useCallback(async (index) => {
    try {
      console.log('[ExecuteActions] creating event for index', index);
      if (!accessToken) {
        throw new Error('No access token');
      }

      const now = Date.now();
      const start = new Date(now).toISOString();
      const end = new Date(now + 30 * 60 * 1000).toISOString();

      const actionObj = actionsRef.current?.[index];
      const actionText = typeof actionObj === 'string' ? actionObj : actionObj?.text;
      const event = {
        summary: `Execute: Action ${index + 1}`,
        description: actionText || undefined,
        start: { dateTime: start },
        end: { dateTime: end },
        reminders: { useDefault: true },
        attendees: HARDCODED_ATTENDEES.map((email) => ({ email })),
      };

      const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      console.log('[ExecuteActions] calendar insert response status', resp.status);
      if (resp.status === 200 || resp.status === 201) {
        onApiSuccess(index);
      } else {
        const body = await resp.text().catch(() => '');
        console.error('[ExecuteActions] calendar insert failed', resp.status, body);
        throw new Error('Calendar API error');
      }
    } catch (e) {
      console.error('[ExecuteActions] create event failed', e);
      setStatusAt(index, 'approved');
      setExecInfo(index, 'Failed to block your calendar. Please try again.');
      clearExecTimeout(index);
      onApiFailure(index);
    }
  }, [accessToken, onApiSuccess, onApiFailure]);

  // Keep latest callback in a ref so effects don't depend on it
  const handleCreateEventForIndexRef = useRef(handleCreateEventForIndex);
  useEffect(() => {
    handleCreateEventForIndexRef.current = handleCreateEventForIndex;
  }, [handleCreateEventForIndex]);

  const authorize = useCallback(() => {
    if (!tokenClient) return;
    console.log('[ExecuteActions] manual authorize click');
    // @ts-ignore
    authAttemptRef.current = 'user';
    tokenClient.requestAccessToken({ prompt: accessToken ? '' : 'consent' });
  }, [tokenClient, accessToken]);

  function handleExecute(index) {
    if (statuses[index] === 'executing' || statuses[index] === 'executed') return;
    setError(null);

    const action = actionsRef.current?.[index] ?? actions[index];
    const type = action?.type ?? 'document';

    // Non-meeting types: document/wo-permit behavior
    if (type !== 'meeting') {
      // For document: expand and start AI generation as the execute behavior
      if (type === 'document') {
        setExpandedDocs((prev) => ({ ...prev, [index]: true }));
        setStatusAt(index, 'executing');
        startAIThinking(index, action?.text);
        return;
      }
      // For wo-permit/round-plan: run thinking first, then start loader timeline
      if (type === 'wo-permit' || type === 'round-plan') {
        setStatusAt(index, 'executing');
        startPreExecuteThinking(index, action?.text, () => startWoPermitTimeline(index));
        return;
      }
      // For other non-meeting types: thinking then instant execute
      setStatusAt(index, 'executing');
      startPreExecuteThinking(index, action?.text, () => {
        setStatusAt(index, 'executed');
        clearExecInfo(index);
        clearTimeline(index);
        clearExecTimeout(index);
      });
      return;
    }

    // Meeting flow: always show thinking first, then proceed with calendar steps
    setStatusAt(index, 'executing');
    startPreExecuteThinking(index, action?.text, () => {
      // If Google token client isn't ready yet, avoid triggering popup outside user gesture
      if (!tokenClient && !accessToken) {
        setExecInfo(index, 'Initializing Google… Please wait a moment and try again.');
        return;
      }
      // Start timeline loader for this item
      startTimeline(index);
      // If we don't yet have a token, request consent within this click (user gesture)
      if (!accessToken) {
        pendingExecuteIndexRef.current = index;
        startExecTimeout(index);
        // @ts-ignore
        authAttemptRef.current = 'exec';
        tokenClient.requestAccessToken({ prompt: 'consent' });
        return;
      }
      // Have token, create event immediately
      startExecTimeout(index);
      handleCreateEventForIndex(index);
    });
  }

  function pillLabel(status) {
    const map = { approved: 'Approved', executing: 'Executing', executed: 'Executed' };
    return map[status] ?? status;
  }

  const readinessText = `GSI:${gsiReady ? 'ready' : '…'} | clientId:${clientId ? 'ok' : 'missing'} | token:${accessToken ? 'ok' : tokenClient ? 'init' : 'none'}`;

  function groupedActions() {
    return {
      meeting: actions.map((a, idx) => ({ a, idx })).filter(({ a }) => a.type === 'meeting'),
      document: actions.map((a, idx) => ({ a, idx })).filter(({ a }) => a.type === 'document'),
      woPermit: actions.map((a, idx) => ({ a, idx })).filter(({ a }) => a.type === 'wo-permit'),
      roundPlan: actions.map((a, idx) => ({ a, idx })).filter(({ a }) => a.type === 'round-plan'),
    };
  }

  // Start WO-PERMIT loader timeline
  function startWoPermitTimeline(index) {
    clearTimeline(index);
    const timers = [];
    execTimelineRef.current[index] = { current: -1, timers, timelineComplete: false, apiDone: true };
    WOP_STEPS.forEach((_, stepIdx) => {
      const id = setTimeout(() => {
        const tl = execTimelineRef.current[index];
        if (!tl) return;
        tl.current = stepIdx;
        setExecInfoVersion((v) => v + 1);
      }, stepIdx * WOP_STEP_MS);
      timers.push(id);
    });
    const doneId = setTimeout(() => {
      // Mark executed and show final message; loader collapses since status changes
      setStatusAt(index, 'executed');
      clearTimeline(index);
      setExecInfo(index, 'Edited 4 Workorder and added Permits.');
    }, WOP_STEPS.length * WOP_STEP_MS);
    timers.push(doneId);
  }

  function renderGroup(title, items) {
    if (!items || items.length === 0) return null;
    return (
      <div style={{ marginTop: 12 }}>
        <div className="section-title" style={{ fontSize: 16 }}>{title}</div>
        <ol className="causes-list">
          {items.map(({ a, idx }) => {
            const tl = execTimelineRef.current[idx];
            const currentStep = tl?.current ?? -1;
            const typeLabel = a.type === 'meeting' ? 'Meeting' : a.type === 'wo-permit' ? 'WO Permit' : a.type === 'round-plan' ? 'Round Plan' : 'Document';
            const isDoc = a.type === 'document';
            const isDocExpanded = !!expandedDocs[idx];
            const generating = isGenerating(idx);
            const entry = aiGenRef.current[idx];
            const phase = entry?.phase;
            const thinking = phase === 'thinking';
            const thoughtVisible = entry?.thoughtVisible || '';
            const blinkOn = entry?.blinkOn;
            const docPageStyle = {
              width: '100%',
              maxWidth: 760,
              minHeight: 420,
              background: '#fff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              padding: 24,
              lineHeight: 1.6,
              fontSize: 15,
              fontFamily: 'Georgia, \'Times New Roman\', Times, serif',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            };
            const toolbarStyle = {
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '8px 0 12px',
              flexWrap: 'wrap',
            };
            const rightActionsStyle = { display: 'flex', gap: 8, alignItems: 'center' };
            const leftStatusStyle = { fontSize: 12, opacity: 0.7 };
            return (
              <li key={idx} className="cause-item">
                <div className="action-card-head">
                  <div className="action-card-title">Action {idx + 1} • {typeLabel}</div>
                  <span className={`status-pill ${statuses[idx]}`}>{pillLabel(statuses[idx])}</span>
                </div>
                <p className="action-card-text">{a.text}</p>
                <div className="action-card-foot">
                  <button
                    className="btn sm"
                    type="button"
                    onClick={() => handleExecute(idx)}
                    disabled={
                      statuses[idx] === 'executing' ||
                      statuses[idx] === 'executed' ||
                      (a.type === 'meeting' && (!clientId || (!tokenClient && !accessToken)))
                    }
                  >
                    {statuses[idx] === 'approved' && 'Execute'}
                    {statuses[idx] === 'executing' && 'Executing…'}
                    {statuses[idx] === 'executed' && 'Executed'}
                  </button>
                </div>

                {/* Meeting timeline */}
                {a.type === 'meeting' && statuses[idx] === 'executing' && (
                  <div style={{ marginTop: 8 }}>
                    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {TIMELINE_STEPS.map((label, sIdx) => {
                        const isDone = currentStep > sIdx;
                        const isCurrent = currentStep === sIdx;
                        return (
                          <li key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isDone ? 0.7 : 1, margin: '4px 0' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDone ? '#10b981' : isCurrent ? '#3b82f6' : '#d1d5db', display: 'inline-block' }} />
                            <span className="cause-desc" style={{ fontSize: 13 }}>{label}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}

                {/* WO-PERMIT GIF loader */}
                {(a.type === 'wo-permit' || a.type === 'round-plan') && statuses[idx] === 'executing' && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {!woGifLoaded && (
                      <div style={{ width: 320, maxWidth: '100%', height: 180, borderRadius: 8, background: 'linear-gradient(90deg,#f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)', animation: 'shimmer 1.2s infinite', position: 'relative', overflow: 'hidden' }} />
                    )}
                    <img
                      src={woGifUrl}
                      alt="Authoring permit forms"
                      style={{ width: 320, maxWidth: '100%', borderRadius: 8, display: woGifLoaded ? 'block' : 'none' }}
                      onLoad={() => setWoGifLoaded(true)}
                    />
                    <ol style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0', width: '100%', maxWidth: 420 }}>
                      {WOP_STEPS.map((label, sIdx) => {
                        const isCurrent = currentStep === sIdx;
                        const isDone = currentStep > sIdx;
                        return (
                          <li key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0', opacity: isDone ? 0.7 : 1 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: isDone ? '#10b981' : isCurrent ? '#3b82f6' : '#d1d5db', display: 'inline-block' }} />
                            <span className="cause-desc" style={{ fontSize: 13 }}>{label}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                )}

                {/* Generic thinking text for non-document actions */}
                {!isDoc && statuses[idx] === 'executing' && thinking && (
                  <p className="cause-desc" style={{ fontSize: 13, marginTop: 8, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                    {thoughtVisible}
                    <span style={{ opacity: blinkOn ? 1 : 0 }}>|</span>
                  </p>
                )}

                {/* Document editor */}
                {isDoc && isDocExpanded && (
                  <div style={{ marginTop: 12 }}>
                    <div style={toolbarStyle}>
                      <span style={leftStatusStyle}>{thinking ? 'AI is thinking…' : generating ? 'AI is writing…' : 'Editor ready'}</span>
                      <div style={rightActionsStyle}>
                        <button
                          className="btn-outline sm"
                          type="button"
                          onClick={() => stopAIGeneration(idx)}
                          disabled={!generating}
                        >
                          Stop
                        </button>
                        <button
                          className="btn-outline sm"
                          type="button"
                          onClick={() => handleClearDoc(idx)}
                          disabled={generating}
                        >
                          Clear
                        </button>
                        <button className="btn sm" type="button" onClick={() => handleDownloadDoc(idx)}>Download (.txt)</button>
                        <button
                          className="btn-outline sm"
                          type="button"
                          onClick={() => handleMarkDocExecuted(idx)}
                          disabled={statuses[idx] === 'executed' || generating}
                        >
                          {statuses[idx] === 'executed' ? 'Executed' : 'Mark Done'}
                        </button>
                      </div>
                    </div>
                    {thinking && (
                      <p className="cause-desc" style={{ fontSize: 13, margin: '4px 0 8px', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                        {thoughtVisible}
                        <span style={{ opacity: blinkOn ? 1 : 0 }}>|</span>
                      </p>
                    )}
                    <textarea
                      value={docContents[idx] ?? defaultDocContentFor(idx, a.text)}
                      onChange={(e) => handleDocChange(idx, e.target.value)}
                      placeholder="Start writing…"
                      style={docPageStyle}
                    />
                  </div>
                )}

                {execInfoRef.current[idx] && (
                  <p className="cause-desc" style={{ marginTop: 8 }}>
                    {execInfoRef.current[idx]}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

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
          {hasMeetingActions && !clientId && (
            <p className="cause-desc" style={{ color: '#b91c1c' }}>
              Missing Google Client ID. Set <code>REACT_APP_GOOGLE_CLIENT_ID</code> in your .env and restart the dev server.
            </p>
          )}
          {hasMeetingActions && (
            <p className="cause-desc" style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{readinessText}</p>
          )}
          {actions.length === 0 ? (
            <p className="cause-desc">No approved actions to execute.</p>
          ) : (
            <div>
              {renderGroup('Meetings', groupedActions().meeting)}
              {renderGroup('Documents', groupedActions().document)}
              {renderGroup('WO Permits', groupedActions().woPermit)}
              {renderGroup('Round Plans', groupedActions().roundPlan)}
            </div>
          )}
          <div className="results-actions" style={{ marginTop: 12 }}>
            {hasMeetingActions && authStatus === 'unauthorized' && !accessToken && (
              <button className="btn" type="button" onClick={authorize} disabled={!tokenClient || !clientId}>Authorize Google</button>
            )}
            <button className="btn-outline" type="button" onClick={() => navigate('/')}>Back to Dashboard</button>
          </div>
          {error && <p className="cause-desc" style={{ color: '#b91c1c' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
} 