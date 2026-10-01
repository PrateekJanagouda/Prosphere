const FADING = 'exposure.'.split('');

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__content">
          <p className="pill-note">
            <span className="pill-note__dot" aria-hidden="true" /> Preview · in development
          </p>
          <h1 id="hero-title" className="hero__title" aria-label="Get the insight. Not the exposure.">
            <span aria-hidden="true">Get the insight.</span>
            <span aria-hidden="true" className="hero__fade">
              Not{' '}
              {FADING.map((ch, i) => (
                <span key={i} style={{ '--i': i }}>{ch}</span>
              ))}
            </span>
          </h1>
          <p className="hero__lede">
            Prosphere will read documents like your credit card statement on your own device, remove your card number
            and name, and only then ask AI what's going on with your money.
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#try">Try the preview</a>
            <a className="btn btn--quiet" href="#how">How it works</a>
          </div>
          <p className="hero__support">Your card number doesn't need to leave your phone to tell you where your money went.</p>
        </div>
        <div className="orb-slot orb-slot--hero" data-orb="0" />
      </div>
    </section>
  );
}
