import { Suspense, lazy, useEffect, useId, useRef, useState } from 'react';
import { SectionHead } from './SectionHead';
import { SceneBoundary } from './SceneBoundary';
import { useNow } from '../hooks/useNow';
import { formatBytes, formatExpiry, formatRemaining, randomId } from '../lib/format';

const CapsuleScene = lazy(() => import('../three/CapsuleScene'));

// Demo-only limits. Real limits must come from the backend config and be enforced server-side too.
const DEMO_MAX_BYTES = 25 * 1024 * 1024;
const DEMO_TYPES = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'heic', 'doc', 'docx', 'txt'];
const DEMO_DURATIONS = [
  { id: '1h', label: '1 hour', ms: 60 * 60 * 1000 },
  { id: '24h', label: '24 hours', ms: 24 * 60 * 60 * 1000 },
  { id: '7d', label: '7 days', ms: 7 * 24 * 60 * 60 * 1000 },
];

function validate(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  if (!DEMO_TYPES.includes(ext)) return `${file.name} isn't a supported type. Try a PDF, image, Word or text file.`;
  if (file.size > DEMO_MAX_BYTES) return `${file.name} is ${formatBytes(file.size)}. The demo limit is 25 MB.`;
  if (file.size === 0) return `${file.name} is empty.`;
  return '';
}

export function ShareDemo({ reduced }) {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const [file, setFile] = useState(null); // { name, size } only — contents are never read
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(null); // no default: the person chooses
  const [phase, setPhase] = useState('compose'); // compose | ready | expired
  const [link, setLink] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState('');
  const copyTimer = useRef(0);
  const now = useNow(1000, phase === 'ready');

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function takeFile(f) {
    if (!f) return;
    const problem = validate(f);
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setFile({ name: f.name, size: f.size });
    setAnnounce(`${f.name} selected, ${formatBytes(f.size)}. Not uploaded.`);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    takeFile(e.dataTransfer.files?.[0]);
  }

  function createLink() {
    if (!file || !duration) return;
    const d = DEMO_DURATIONS.find((x) => x.id === duration);
    const id = randomId();
    const url = `${window.location.origin}${window.location.pathname}#/s/${id}`;
    setLink({ id, url, expiresAt: Date.now() + d.ms });
    setPhase('ready');
    setAnnounce('Demo link created. Nothing was uploaded.');
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      setAnnounce('Link copied to clipboard.');
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setAnnounce("Couldn't copy automatically. Select the link and copy it manually.");
    }
  }

  function simulateExpiry() {
    setPhase('expired');
    setAnnounce('Simulated expiry. The link would now stop working.');
  }

  function reset() {
    setFile(null);
    setDuration(null);
    setLink(null);
    setError('');
    setCopied(false);
    setPhase('compose');
    setAnnounce('Cleared. Ready for another file.');
  }

  const capsuleState = phase === 'expired' ? 'expired' : file ? 'holding' : 'empty';
  const statusLine =
    phase === 'expired'
      ? 'STATUS // EXPIRED'
      : phase === 'ready'
        ? `STATUS // ACTIVE · T-${formatRemaining(link.expiresAt - now)}`
        : file
          ? 'STATUS // HELD LOCALLY · NOT UPLOADED'
          : 'STATUS // EMPTY';

  return (
    <section id="share" className="section" aria-labelledby="share-title">
      <div className="container">
        <SectionHead index="03" label="Share a file" title="Try the flow" id="share-title">
          This is a working demo of the experience. Your file never leaves this device.
        </SectionHead>

        <div className="share frame">
          <div className="capsule">
            <SceneBoundary>
              <Suspense fallback={null}>
                <CapsuleScene state={capsuleState} reduced={reduced} />
              </Suspense>
            </SceneBoundary>
            <div className="capsule__hud mono" aria-hidden="true">
              <span>CAPSULE/{link ? link.id.slice(0, 6).toUpperCase() : '——————'}</span>
              <span className={phase === 'ready' ? 'is-live' : ''}>{statusLine}</span>
            </div>
          </div>

          <div className="share__panel">
            <p className="sr-only" aria-live="polite">{announce}</p>

            {phase === 'compose' && (
              <>
                <div
                  className={`drop${dragging ? ' is-drag' : ''}${file ? ' has-file' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <input
                    id={inputId}
                    type="file"
                    className="sr-only"
                    accept={DEMO_TYPES.map((t) => `.${t}`).join(',')}
                    aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
                    onChange={(e) => {
                      takeFile(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                  {file ? (
                    <div className="filechip">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8zM14 3v5h5" />
                      </svg>
                      <div className="filechip__meta">
                        <strong>{file.name}</strong>
                        <span className="mono">{formatBytes(file.size)} · not uploaded</span>
                      </div>
                      <label htmlFor={inputId} className="btn btn--ghost btn--sm">Change</label>
                    </div>
                  ) : (
                    <label htmlFor={inputId} className="drop__label">
                      <span className="drop__icon" aria-hidden="true">+</span>
                      <span className="drop__title">Choose a file <span>or drop it here</span></span>
                    </label>
                  )}
                  <p id={hintId} className="drop__hint mono">PDF · images · Word · text — demo limit 25 MB</p>
                </div>

                {error && (
                  <p id={errorId} className="alert" role="alert">{error}</p>
                )}

                <fieldset className="ttl">
                  <legend>How long should it be available?</legend>
                  <div className="ttl__opts">
                    {DEMO_DURATIONS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className="pill"
                        aria-pressed={duration === d.id}
                        onClick={() => setDuration(d.id)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="ttl__note mono">
                    {duration
                      ? `Would expire ${formatExpiry(Date.now() + DEMO_DURATIONS.find((d) => d.id === duration).ms)}`
                      : 'Demo durations. Pick one to see the exact expiry.'}
                  </p>
                </fieldset>

                <div className="share__actions">
                  <button type="button" className="btn btn--accent" disabled={!file || !duration} onClick={createLink}>
                    Create demo link
                  </button>
                  <p className="share__fine">Demo only: no file is uploaded or shared.</p>
                </div>
              </>
            )}

            {phase === 'ready' && link && (
              <div className="result">
                <p className="mono result__k">Demo link ready</p>
                <label className="result__label" htmlFor="ps-link">Sharing link</label>
                <div className="linkbox">
                  <input id="ps-link" readOnly value={link.url} onFocus={(e) => e.target.select()} />
                  <button type="button" className="btn btn--solid btn--sm" onClick={copy}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <dl className="result__facts">
                  <div>
                    <dt className="mono">Expires</dt>
                    <dd>{formatExpiry(link.expiresAt)}</dd>
                  </div>
                  <div>
                    <dt className="mono">Remaining</dt>
                    <dd className="mono">{formatRemaining(link.expiresAt - now)}</dd>
                  </div>
                </dl>
                <p className="share__fine">
                  This link doesn't carry your file. It opens the page recipients see once a link has expired.
                </p>
                <div className="share__actions">
                  <button type="button" className="btn btn--ghost" onClick={simulateExpiry}>Simulate expiry</button>
                  <button type="button" className="btn btn--text" onClick={reset}>Start over</button>
                </div>
              </div>
            )}

            {phase === 'expired' && (
              <div className="result">
                <p className="mono result__k result__k--warn">Simulated expiry</p>
                <h3 className="result__title">The link has stopped working.</h3>
                <p>
                  In the real product, the server refuses the link from this point. Stored copies are then deleted
                  within [DELETION WINDOW]. Anything a recipient already downloaded stays with them.
                </p>
                <div className="share__actions">
                  <a className="btn btn--ghost" href={`#/s/${link.id}`}>See what recipients see</a>
                  <button type="button" className="btn btn--accent" onClick={reset}>Share another file</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
