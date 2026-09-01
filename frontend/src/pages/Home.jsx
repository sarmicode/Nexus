import { useCallback, useEffect, useState } from 'react';
import { fetchHealth } from '../services/health';
import { formatUptime } from '../utils/formatUptime';

/**
 * Home — live ping to the backend health endpoint (Phase 00).
 * Loading / success / error states per RULES.md §5.
 */
export default function Home() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // Bumped on "Retry" to re-run the effect (event-handler-triggered, not an effect body).
  const [attempt, setAttempt] = useState(0);

  // Fetch on mount / retry. setState happens only in the promise callbacks —
  // i.e. when the external system (the network) reports back — not in the
  // effect body itself.
  useEffect(() => {
    let active = true;
    fetchHealth()
      .then((data) => {
        if (!active) return;
        setHealth(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.apiError || { code: 'UNKNOWN', message: err.message || 'Unknown error' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setLoading(true); // immediate spinner feedback (event handler, not an effect)
    setAttempt((n) => n + 1);
  }, []);

  return (
    <section className="card">
      <h1>FarmBridge is up 🌾</h1>
      <p className="muted">
        Phase 00 foundation — the Vite + React shell is talking to the Express gateway.
      </p>

      {loading && (
        <div className="status status--loading" role="status">
          ⏳ Checking backend health…
        </div>
      )}

      {!loading && health && (
        <div className="status status--ok" role="status">
          <span className="dot" aria-hidden="true" />
          <div>
            <strong>Backend reachable — {health.status}</strong>
            <p className="muted">
              uptime {formatUptime(health.uptime)} · {new Date(health.ts).toLocaleString()} · db{' '}
              {health.db}
            </p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="status status--error" role="alert">
          <div>
            <strong>Backend unreachable ({error.code})</strong>
            <p className="muted">{error.message}</p>
            <p className="muted">
              Start it with <code>cd backend &amp;&amp; npm run dev</code>, then retry.
            </p>
          </div>
          <button type="button" onClick={retry}>
            Retry
          </button>
        </div>
      )}
    </section>
  );
}
