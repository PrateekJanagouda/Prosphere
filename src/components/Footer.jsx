import { Mark } from './Mark';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="wordmark">
          <Mark size={22} />
          <span>Prosphere</span>
        </div>
        {/* Privacy, terms and support links go here once those pages exist. Don't link placeholders. */}
        <p className="mono footer__note">Demo build · v0.1 · Privacy, terms and support pages will be linked before launch.</p>
      </div>
    </footer>
  );
}
