export function SectionHead({ index, label, title, id, children }) {
  return (
    <div className="shead">
      <p className="shead__label">
        <span>[{index}]</span> {label}
      </p>
      <h2 id={id} className="shead__title">{title}</h2>
      {children ? <p className="shead__body">{children}</p> : null}
    </div>
  );
}
