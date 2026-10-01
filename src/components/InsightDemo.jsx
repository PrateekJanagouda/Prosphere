import { useEffect, useId, useState } from 'react';
import { SectionHead } from './SectionHead';
import { formatBytes } from '../lib/format';
import { setCapsule } from '../three/store';

// Preview limits. Real limits come from the engine once it exists.
const DEMO_MAX_BYTES = 10 * 1024 * 1024;
const DEMO_TYPES = ['pdf', 'csv'];
const QUESTIONS = [
  { id: 'fees', label: 'Fees & hidden charges' },
  { id: 'subs', label: 'Subscriptions' },
  { id: 'spend', label: 'Where my money goes' },
];

// Illustrative rows only. They are NOT read from the user's file.
const EXAMPLE = [
  { original: 'Card 4111 1111 1111 4821', sent: 'Card [CARD_1]' },
  { original: 'A. Sharma, 14 MG Road, Bengaluru', sent: '[NAME_1], [ADDRESS_1]' },
  { original: '12 Sep · Netflix · ₹649', sent: '12 Sep · Netflix · ₹649' },
  { original: '15 Sep · Late payment fee · ₹1,180', sent: '15 Sep · Late payment fee · ₹1,180' },
];

function validate(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  if (!DEMO_TYPES.includes(ext)) return `${file.name} isn't supported yet. Try a PDF or CSV statement.`;
  if (file.size > DEMO_MAX_BYTES) return `${file.name} is ${formatBytes(file.size)}. The preview limit is 10 MB.`;
  if (file.size === 0) return `${file.name} is empty.`;
  return '';
}

export function InsightDemo() {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const [file, setFile] = useState(null); // { name, size } only — contents are never read
  const [error, setError] = useState('');
  const [question, setQuestion] = useState(null);
  const [phase, setPhase] = useState('compose'); // compose | preview | cleared
  const [dragging, setDragging] = useState(false);
  const [announce, setAnnounce] = useState('');

  // The card inside the 3D sphere appears with a file and dissolves when cleared.
  const capsule = phase === 'cleared' ? 'expired' : file ? 'holding' : 'empty';
  useEffect(() => setCapsule(capsule), [capsule]);
  useEffect(() => () => setCapsule('empty'), []);

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

  function reset() {
    setFile(null);
    setQuestion(null);
    setError('');
    setPhase('compose');
    setAnnounce('Ready for another statement.');
  }

  const status =
    phase === 'cleared'
      ? 'Cleared from this device'
      : phase === 'preview'
        ? 'Preview ready · nothing sent'
        : file
          ? 'On your device · not uploaded'
          : 'Waiting for a statement';

  return (
    <section id="try" className="section" aria-labelledby="try-title">
      <div className="split split--flip split--share">
        <div className="share-slot">
          <div className="orb-slot orb-slot--share" data-orb="3" />
          <p className={`status${phase === 'preview' ? ' status--live' : ''}${phase === 'cleared' ? ' status--gone' : ''}`}>
            <span className="status__dot" aria-hidden="true" />
            {status}
          </p>
        </div>
        <div className="split__text">
          <SectionHead eyebrow="Try the preview" title="See what the AI would see" id="try-title">
            Pick a statement to walk through the flow. In this preview nothing is analysed or uploaded. Only the file’s
            name and size are read.
          </SectionHead>
          <div className="share__panel glass reveal">
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
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    takeFile(e.dataTransfer.files?.[0]);
                  }}
                >
                  <input
                    id={inputId}
                    type="file"
                    className="sr-only"
                    accept=".pdf,.csv"
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
                      <label htmlFor={inputId} className="btn btn--quiet btn--sm">Change</label>
                    </div>
                  ) : (
                    <label htmlFor={inputId} className="drop__label">
                      <span className="drop__icon" aria-hidden="true">+</span>
                      <span className="drop__title">Choose a statement <span>or drop it here</span></span>
                    </label>
                  )}
                  <p id={hintId} className="drop__hint">Credit card statement · PDF or CSV · preview limit 10 MB</p>
                </div>

                {error && (
                  <p id={errorId} className="alert" role="alert">{error}</p>
                )}

                <fieldset className="ttl">
                  <legend>What do you want to know?</legend>
                  <div className="ttl__opts">
                    {QUESTIONS.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        className="pill"
                        aria-pressed={question === q.id}
                        onClick={() => setQuestion(q.id)}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="share__actions">
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={!file || !question}
                    onClick={() => {
                      setPhase('preview');
                      setAnnounce('Preview ready. Nothing was analysed or sent.');
                    }}
                  >
                    Show the preview
                  </button>
                  <p className="share__fine">Preview only. Nothing is analysed or uploaded.</p>
                </div>
              </>
            )}

            {phase === 'preview' && (
              <div className="result">
                <p className="eyebrow">Example</p>
                <h3 className="result__title">What stays, and what the AI sees</h3>
                <table className="redact">
                  <thead>
                    <tr>
                      <th scope="col">On your device</th>
                      <th scope="col">Sent for analysis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXAMPLE.map((row) => (
                      <tr key={row.original}>
                        <td>{row.original}</td>
                        <td className="mono">{row.sent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="share__fine">
                  These are example rows, not your statement. The analysis engine isn’t built yet, so {file?.name} was
                  not opened.
                </p>
                <div className="share__actions">
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => {
                      setPhase('cleared');
                      setAnnounce('Cleared from this device.');
                    }}
                  >
                    Clear from this device
                  </button>
                  <button type="button" className="btn btn--text" onClick={reset}>Start over</button>
                </div>
              </div>
            )}

            {phase === 'cleared' && (
              <div className="result">
                <p className="eyebrow eyebrow--warn">Cleared</p>
                <h3 className="result__title">Gone from this device.</h3>
                <p>
                  In the real product, clearing removes the file and every working copy from memory. In this preview,
                  nothing was ever read or sent.
                </p>
                <div className="share__actions">
                  <button type="button" className="btn btn--primary" onClick={reset}>Try another statement</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
