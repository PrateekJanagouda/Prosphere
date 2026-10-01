export function SectionHead({ eyebrow, title, id, children }) {
  return (
    <div className="shead reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
      {children ? <p className="shead__body">{children}</p> : null}
    </div>
  );
}
