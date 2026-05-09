import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { STATUS_META, PRIORITY_META, Avatar } from '../ui';
import { mockUsers, CURRENT_USER } from '../../utils/mockData';

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-4)', padding: '0 4px' }}>
      {children}
    </p>
  );
}

function FilterRow({ label, color, bg, active, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px',
      borderRadius: 'var(--r-sm)', background: active ? bg : 'transparent',
      border: 'none', textAlign: 'left', width: '100%', transition: 'background 0.15s',
    }}>
      {icon ?? <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, opacity: active ? 1 : 0.45 }} />}
      <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? color : 'var(--text-2)', transition: 'all 0.15s', flex: 1, textAlign: 'left' }}>{label}</span>
      {active && <span style={{ fontSize: 11, color: color, opacity: 0.7 }}>✓</span>}
    </button>
  );
}

const SORT_OPTIONS = [
  { field: 'updatedAt', dir: 'desc', label: 'Recently updated' },
  { field: 'createdAt', dir: 'desc', label: 'Newest first' },
  { field: 'createdAt', dir: 'asc',  label: 'Oldest first' },
  { field: 'priority',  dir: 'desc', label: 'Priority ↑' },
  { field: 'priority',  dir: 'asc',  label: 'Priority ↓' },
  { field: 'title',     dir: 'asc',  label: 'Title A→Z' },
  { field: 'title',     dir: 'desc', label: 'Title Z→A' },
];

const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

export function FilterBar() {
  const { filters, setFilter, clearFilters, tags, sort, setSort } = useTaskStore();
  const hasActive = filters.status || filters.priority || filters.tagId || filters.search || filters.onlyMine || filters.assigneeId;
  const sortKey = `${sort.field}:${sort.dir}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={13} strokeWidth={2} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
        <input type="text" placeholder="Search…" value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="field-input"
          style={{ paddingLeft: 30 }}
        />
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SectionLabel>Sort</SectionLabel>
        <select
          value={sortKey}
          onChange={(e) => { const [field, dir] = e.target.value.split(':'); setSort(field, dir); }}
          className="field-input"
          style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer', backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', fontSize: 13 }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={`${o.field}:${o.dir}`} value={`${o.field}:${o.dir}`}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionLabel>Status</SectionLabel>
        {Object.entries(STATUS_META).map(([key, { label, color, bg }]) => (
          <FilterRow key={key} label={label} color={color} bg={bg}
            active={filters.status === key}
            onClick={() => setFilter('status', filters.status === key ? null : key)} />
        ))}
      </div>

      {/* Priority */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionLabel>Priority</SectionLabel>
        {Object.entries(PRIORITY_META).map(([key, { label, color, bg }]) => (
          <FilterRow key={key} label={label} color={color} bg={bg}
            active={filters.priority === key}
            onClick={() => setFilter('priority', filters.priority === key ? null : key)} />
        ))}
      </div>

      {/* Assignee */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <SectionLabel>Assignee</SectionLabel>
        <FilterRow
          label="Assigned to me" color="var(--blue)" bg="var(--blue-bg)"
          active={filters.onlyMine}
          onClick={() => { setFilter('onlyMine', !filters.onlyMine); setFilter('assigneeId', null); }}
          icon={<Avatar username={CURRENT_USER.username} size={16} />}
        />
        {mockUsers.filter((u) => u.id !== CURRENT_USER.id).map((u) => (
          <FilterRow
            key={u.id} label={u.username} color="var(--text-2)" bg="var(--sep-2)"
            active={filters.assigneeId === u.id}
            onClick={() => { setFilter('assigneeId', filters.assigneeId === u.id ? null : u.id); setFilter('onlyMine', false); }}
            icon={<Avatar username={u.username} size={16} />}
          />
        ))}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SectionLabel>Tags</SectionLabel>
          {tags.map((tag) => (
            <FilterRow key={tag.id} label={tag.name} color={tag.color} bg={tag.color + '15'}
              active={filters.tagId === tag.id}
              onClick={() => setFilter('tagId', filters.tagId === tag.id ? null : tag.id)} />
          ))}
        </div>
      )}

      {/* Clear */}
      {hasActive && (
        <button onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--blue)', fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 'var(--r-sm)', background: 'var(--blue-bg)' }}>
          <X size={12} /> Clear filters
        </button>
      )}
    </div>
  );
}