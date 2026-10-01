import { Mark } from './Mark';

export function ExpiredPage() {
  return (
    <main className="expired">
      <a className="wordmark" href="#">
        <Mark />
        <span>Prosphere</span>
      </a>
      <div className="expired__body">
        <div className="orb-slot orb-slot--expired" data-orb="4" />
        <div className="expired__card glass">
          <p className="eyebrow eyebrow--warn">Link unavailable</p>
          <h1>This link isn't available</h1>
          <p>
            Real Prosphere links stop working when their time is up. This one came from the demo, so it never carried a
            file.
          </p>
          <p className="muted">If you need a file, ask the sender to share it again.</p>
          <a className="btn btn--primary" href="#">Back to Prosphere</a>
        </div>
      </div>
    </main>
  );
}
