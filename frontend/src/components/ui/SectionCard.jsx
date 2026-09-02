const SectionCard = ({ title, description, children, action, className = "" }) => {
  return (
    <div className={`card overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            {title && <h2 className="text-xl font-semibold text-text">{title}</h2>}
            {description && <p className="text-sm text-muted mt-1">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default SectionCard;
