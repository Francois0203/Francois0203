// A grey loading shape. Size it with w and h, round it with r.
export const Bone = ({ w = '100%', h = '1rem', r, className = '', style }) => (
  <span
    className={`skeleton ${className}`}
    style={{ width: w, height: h, ...(r !== undefined ? { borderRadius: r } : {}), ...style }}
    aria-hidden="true"
  />
);

// Wraps a group of bones and tells screen readers that something is loading.
const Skeleton = ({ label = 'Loading', className = '', children }) => (
  <div className={className} role="status">
    <span className="sr-only">{label}</span>
    {children}
  </div>
);

export default Skeleton;
