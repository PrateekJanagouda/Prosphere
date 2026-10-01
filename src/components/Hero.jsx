const FADING = 'forever.'.split('');

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__content">
          <p className="pill-note">
            <span className="pill-note__dot" aria-hidden="true" /> Demo · sharing isn't live yet
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
            A simpler way to share personal files temporarily. Time-limited sharing and automatic deletion are coming
            to Prosphere.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#share">Share a file</a>
            <a className="btn btn--quiet" href="#how">How it works</a>
          </div>
          <p className="hero__support">A little less digital baggage. A little more peace of mind.</p>
        </div>
        <div className="orb-slot orb-slot--hero" data-orb="0" />
      </div>
    </section>
  );
}
