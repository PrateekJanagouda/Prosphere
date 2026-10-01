import { Mark } from './Mark';

export function ExpiredPage() {
  return (
    <main className="expired">
      <a className="wordmark expired__brand" href="#">
        <Mark />
        <span>Prosphere</span>
      </a>
      <div className="expired__body">
        <div className="expired__glyph" aria-hidden="true">
          <span />
        </div>
        <p className="mono expired__code">LINK // UNAVAILABLE</p>
        <h1>This link isn't available</h1>
        <p>
          Real Prosphere links stop working when their time is up. This one came from the demo, so it never carried a
          file in the first place.
        </p>
        <p className="expired__hint">If you need a file, ask the sender to share it again.</p>
        <a className="btn btn--solid" href="#">Back to Prosphere</a>
      </div>
    </main>
  );
}
