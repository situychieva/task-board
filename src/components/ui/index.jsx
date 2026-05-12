import React from 'react';

export const STATUS_META = {
  todo:        { label: 'To Do',       color: 'var(--gray)',  bg: 'var(--gray-bg)' },
  in_progress: { label: 'In Progress', color: 'var(--blue)',  bg: 'var(--blue-bg)' },
  done:        { label: 'Done',        color: 'var(--green)', bg: 'var(--green-bg)' },
};

export const PRIORITY_META = {
  low:    { label: 'Low',    color: 'var(--gray)',   bg: 'var(--gray-bg)',   dot: '○' },
  medium: { label: 'Medium', color: 'var(--orange)', bg: 'var(--orange-bg)', dot: '◑' },
  high:   { label: 'High',   color: 'var(--red)',    bg: 'var(--red-bg)',    dot: '●' },
};

export function Pill({ color, bg, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 9px',
      borderRadius: 99,
      fontSize: 12, fontWeight: 500, letterSpacing: '-0.01em',
      color, background: bg,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

export function Avatar({ username, size = 26 }) {
  const initials = (username || '?').slice(0, 2).toUpperCase();
  const hue = [...(username || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div title={username} style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},55%,88%)`,
      color: `hsl(${hue},60%,38%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600,
      flexShrink: 0,
      border: '1.5px solid rgba(255,255,255,0.9)',
      boxShadow: 'var(--sh-xs)',
    }}>
      {initials}
    </div>
  );
}

export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid var(--sep)`,
      borderTopColor: 'var(--blue)',
      borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
    }} />
  );
}

export function TagChip({ tag, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 10px', borderRadius: 99,
        fontSize: 12, fontWeight: 500,
        border: `1px solid ${active ? tag.color + 'aa' : tag.color + '44'}`,
        background: active ? tag.color + '18' : 'transparent',
        color: active ? tag.color : 'var(--text-3)',
        transition: 'all 0.15s ease',
      }}
    >
      {tag.name}
    </button>
  );
}

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--sep-2)',
      borderRadius: var_r_sm,
      padding: 2,
      gap: 1,
    }}>
      {options.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          title={label}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 5, padding: '5px 12px', borderRadius: 6,
            fontSize: 13, fontWeight: 500,
            background: value === key ? 'var(--bg-2)' : 'transparent',
            color: value === key ? 'var(--text)' : 'var(--text-4)',
            boxShadow: value === key ? 'var(--sh-xs)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}

const var_r_sm = 'var(--r-sm)';