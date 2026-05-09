import React from 'react';
import { Pencil, Trash2, Clock, CalendarDays } from 'lucide-react';
import { Pill, Avatar, STATUS_META, PRIORITY_META } from '../ui';

function DetailRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
        textTransform: 'uppercase', color: 'var(--text-4)',
      }}>
        {label}
      </span>
      <div style={{ fontSize: 14, color: 'var(--text)' }}>{children}</div>
    </div>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function TaskDetail({ task, onEdit, onDelete, onClose }) {
  const status = STATUS_META[task.status];
  const priority = PRIORITY_META[task.priority];

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Title */}
      <div>
        <h2 style={{
          fontSize: 18, fontWeight: 700,
          color: 'var(--text)', lineHeight: 1.35,
          letterSpacing: '-0.02em',
        }}>
          {task.title}
        </h2>
        {task.description && (
          <p style={{
            marginTop: 8, fontSize: 14, color: 'var(--text-3)',
            lineHeight: 1.6,
          }}>
            {task.description}
          </p>
        )}
      </div>

      {/* Status + Priority */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Pill color={status.color} bg={status.bg}>{status.label}</Pill>
        <Pill color={priority.color} bg={priority.bg}>
          {priority.dot} {priority.label}
        </Pill>
      </div>

      {/* Meta grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
        padding: 16, borderRadius: 'var(--r)',
        background: 'var(--bg)', border: '0.5px solid var(--sep)',
      }}>
        {task.assignee && (
          <DetailRow label="Assignee">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
              <Avatar username={task.assignee.username} size={22} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{task.assignee.username}</span>
            </div>
          </DetailRow>
        )}

        <DetailRow label="Created">
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: 13 }}>
            <CalendarDays size={13} strokeWidth={1.5} />
            {formatDate(task.createdAt)}
          </div>
        </DetailRow>

        <DetailRow label="Updated">
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: 13 }}>
            <Clock size={13} strokeWidth={1.5} />
            {formatDate(task.updatedAt)}
          </div>
        </DetailRow>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <DetailRow label="Tags">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {task.tags.map((tag) => (
              <span key={tag.id} style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                background: tag.color + '18', color: tag.color,
              }}>
                {tag.name}
              </span>
            ))}
          </div>
        </DetailRow>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 8, paddingTop: 4,
        borderTop: '0.5px solid var(--sep-2)',
      }}>
        <button
          onClick={onEdit}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 'var(--r-sm)',
            background: 'var(--blue-bg)', color: 'var(--blue)',
            border: '0.5px solid rgba(0,122,255,0.2)',
            fontSize: 13, fontWeight: 600,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Pencil size={13} strokeWidth={2} /> Edit
        </button>
        <button
          onClick={onDelete}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 'var(--r-sm)',
            background: 'var(--red-bg)', color: 'var(--red)',
            border: '0.5px solid rgba(255,59,48,0.2)',
            fontSize: 13, fontWeight: 600,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <Trash2 size={13} strokeWidth={2} /> Delete
        </button>
      </div>
    </div>
  );
}