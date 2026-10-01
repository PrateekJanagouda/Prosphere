import { useNow } from '../hooks/useNow';
import { formatClock, timeZoneLabel } from '../lib/format';

const FADING = 'forever.'.split('');

export function Hero({ children }) {
  const now = useNow(1000);
  return (
    <section className="hero" aria-labelledby="hero-title">
      {children}
      <div className="hero__grid" aria-hidden="true" />

      <div className="hud hud--tl" aria-hidden="true">
        <span>PSP/01</span>
        <span className="hud__dim">Temporary by design</span>
      </div>
      <div className="hud hud--tr" aria-hidden="true">
        <span className="hud__dim">Local</span>
        <span>{formatClock(now)} {timeZoneLabel()}</span>
      </div>

      <div className="hero__content">
        <p className="tag">
          <span className="tag__dot" /> Demo build · sharing isn't live yet
        </p>
        <h1 id="hero-title" className="hero__title" aria-label="Share what matters. Not forever.">
          <span aria-hidden="true">Share what matters.</span>
          <span aria-hidden="true" className="hero__fade">
            Not{' '}
            {FADING.map((ch, i) => (
              <span key={i} style={{ '--i': i }}>{ch}</span>
            ))}
          </span>
        </h1>
        <p className="hero__lede">
          A simpler way to share personal files temporarily. Time-limited sharing and automatic deletion are
          coming to Prosphere.
        </p>
        <div className="hero__actions">
          <a className="btn btn--accent" href="#share">Share a file</a>
          <a className="btn btn--ghost" href="#how">How it works</a>
        </div>
        <p className="hero__support">A little less digital baggage. A little more peace of mind.</p>
      </div>
    </section>
  );
}
