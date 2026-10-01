import { Mark } from './Mark';

export function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="wordmark" href="#main" aria-label="Prosphere home">
          <Mark />
          <span>Prosphere</span>
        </a>
        <nav className="header__nav" aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#privacy" className="hide-sm">Privacy</a>
          <a href="#share" className="btn btn--solid btn--sm">Share a file</a>
        </nav>
      </div>
    </header>
  );
}
