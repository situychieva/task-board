import React from 'react';
import { Search, X } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { STATUS_META, PRIORITY_META } from '../ui';

function FilterSection({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
        textTransform: 'uppercase', color: 'var(--text-4)',
        padding: '0 4px',
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {children}
      </div>
    </div>
  );
}

function FilterRow({ label, color, bg, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '6px 10px', borderRadius: 'var(--r-sm)',
        background: active ? bg : 'transparent',
        border: 'none', textAlign: 'left', width: '100%',
        transition: 'background 0.15s ease',
      }}
    >
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: color, flexShrink: 0,
        opacity: active ? 1 : 0.45,
      }} />
      <span style={{
        fontSize: 13, fontWeight: active ? 500 : 400,
        color: active ? color : 'var(--text-2)',
        transition: 'all 0.15s',
      }}>
        {label}
      </span>
      {active && (
        <span style={{
          marginLeft: 'auto', fontSize: 11,
          color: color, opacity: 0.7,
        }}>✓</span>
      )}
    </button>
  );
}

export function FilterBar() {
  const { filters, setFilter, clearFilters, tags } = useTaskStore();
  const hasActive = filters.status || filters.priority || filters.tagId || filters.search;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={13} strokeWidth={2} style={{
          position: 'absolute', left: 10, top: '50%',
          transform: 'translateY(-50%)', color: 'var(--text-4)',
          pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search…"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg)',
            border: '0.5px solid var(--sep)',
            borderRadius: 'var(--r-sm)',
            color: 'var(--text)',
            fontSize: 13, padding: '7px 10px 7px 30px',
            outline: 'none',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--blue)';
            e.target.style.boxShadow = '0 0 0 3px var(--blue-bg), inset 0 1px 2px rgba(0,0,0,0.04)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--sep)';
            e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)';
          }}
        />
      </div>

      {/* Status */}
      <FilterSection label="Status">
        {Object.entries(STATUS_META).map(([key, { label, color, bg }]) => (
          <FilterRow
            key={key} label={label} color={color} bg={bg}
            active={filters.status === key}
            onClick={() => setFilter('status', filters.status === key ? null : key)}
          />
        ))}
      </FilterSection>

      {/* Priority */}
      <FilterSection label="Priority">
        {Object.entries(PRIORITY_META).map(([key, { label, color, bg }]) => (
          <FilterRow
            key={key} label={label} color={color} bg={bg}
            active={filters.priority === key}
            onClick={() => setFilter('priority', filters.priority === key ? null : key)}
          />
        ))}
      </FilterSection>

      {/* Tags */}
      {tags.length > 0 && (
        <FilterSection label="Tags">
          {tags.map((tag) => (
            <FilterRow
              key={tag.id}
              label={tag.name} color={tag.color} bg={tag.color + '15'}
              active={filters.tagId === tag.id}
              onClick={() => setFilter('tagId', filters.tagId === tag.id ? null : tag.id)}
            />
          ))}
        </FilterSection>
      )}

      {/* Clear */}
      {hasActive && (
        <button
          onClick={clearFilters}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            color: 'var(--blue)', fontSize: 13, fontWeight: 500,
            padding: '6px 10px', borderRadius: 'var(--r-sm)',
            background: 'var(--blue-bg)',
          }}
        >
          <X size={12} /> Clear filters
        </button>
      )}
    </div>
  );
}