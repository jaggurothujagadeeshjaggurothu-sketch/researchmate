export default function IconButton({ icon: Icon, label, onClick, disabled, active, spin, size = 16 }) {
  return (
    <button
      type="button"
      className={`icon-btn ${active ? '!border-emerald-400/50 !bg-emerald-500/15 !text-emerald-200' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    >
      <Icon size={size} className={spin ? 'animate-spin' : ''} />
    </button>
  );
}
