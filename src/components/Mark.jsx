export function Mark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12.5" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="16" cy="16" rx="12.5" ry="4.6" stroke="var(--accent)" strokeWidth="1.6" />
      <circle cx="25" cy="7.5" r="2.2" fill="var(--accent)" />
    </svg>
  );
}
