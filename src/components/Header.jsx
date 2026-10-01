import { Mark } from './Mark';

export function Header() {
  return (
    <header className="header">
      <div className="header__inner glass">
        <a className="wordmark" href="#main" aria-label="Prosphere home">
          <Mark />
          <span>Prosphere</span>
        </a>
        <nav className="header__nav" aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#privacy" className="hide-sm">Privacy</a>
          <a href="#try" className="btn btn--primary btn--sm">Try the preview</a>
        </nav>
      </div>
    </header>
  );
}
