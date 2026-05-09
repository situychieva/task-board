import React from 'react';
import { Trash2, Clock } from 'lucide-react';
import { Pill, Avatar, STATUS_META, PRIORITY_META } from '../ui';

function timeAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d}d ago`;
}

export function TaskCard({ task, onDelete, onClick }) {
  const status = STATUS_META[task.status];
  const priority = PRIORITY_META[task.priority];
  const [hovered, setHovered] = React.useState(false);

  return (
    <article
      onClick={() => onClick?.(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-2)',
        borderRadius: 'var(--r-lg)',
        padding: '14px 16px',
        cursor: 'pointer',
        boxShadow: hovered ? 'var(--sh)' : 'var(--sh-sm)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        animation: 'fadeUp 0.25s ease both',
        border: '0.5px solid var(--sep)',
      }}
    >
      {/* Top row: title + delete */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 600,
            color: 'var(--text)', lineHeight: 1.4,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {task.title}
          </p>
          {task.description && (
            <p style={{
              fontSize: 13, color: 'var(--text-4)', lineHeight: 1.45,
              marginTop: 3,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {task.description}
            </p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}
          style={{
            padding: 5, borderRadius: 6, flexShrink: 0,
            color: hovered ? 'var(--red)' : 'var(--text-5)',
            background: hovered ? 'var(--red-bg)' : 'transparent',
            transition: 'all 0.15s ease',
            display: 'flex',
          }}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {task.tags.map((tag) => (
            <span key={tag.id} style={{
              fontSize: 11, fontWeight: 500,
              color: tag.color,
              background: tag.color + '16',
              padding: '2px 8px', borderRadius: 99,
            }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        paddingTop: 8, borderTop: '0.5px solid var(--sep-2)',
        flexWrap: 'wrap',
      }}>
        <Pill color={status.color} bg={status.bg}>{status.label}</Pill>
        <span style={{
          fontSize: 12, color: priority.color,
          fontWeight: 500, marginLeft: 2,
        }}>
          {priority.dot} {priority.label}
        </span>
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 11, color: 'var(--text-5)',
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <Clock size={10} strokeWidth={1.5} />
          {timeAgo(task.updatedAt)}
        </span>
        {task.assignee && <Avatar username={task.assignee.username} size={22} />}
      </div>
    </article>
  );
}