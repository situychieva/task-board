import React from 'react';
import { Pencil, Trash2, Clock, CalendarDays, Ban, UserCheck } from 'lucide-react';
import { Pill, Avatar, STATUS_META, PRIORITY_META } from '../ui';
import { useTaskStore } from '../../store/taskStore';
import { CURRENT_USER } from '../../utils/mockData';

function DetailRow({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-4)' }}>{label}</span>
      <div style={{ fontSize: 14, color: 'var(--text)' }}>{children}</div>
    </div>
  );
}

function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function TaskDetail({ task, onEdit, onDelete, onClose }) {
  const { tasks, selfAssign, removeBlocker } = useTaskStore();
  const status   = STATUS_META[task.status];
  const priority = PRIORITY_META[task.priority];
  const isMine   = task.assignee?.id === CURRENT_USER.id;

  // Resolve blocker task objects
  const blockers = (task.blockedBy ?? []).map((id) => tasks.find((t) => t.id === id)).filter(Boolean);
  // Tasks this task is blocking
  const blocking = tasks.filter((t) => t.blockedBy?.includes(task.id));

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Title */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, letterSpacing: '-0.02em' }}>{task.title}</h2>
        {task.description && <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>{task.description}</p>}
      </div>

      {/* Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill color={status.color} bg={status.bg}>{status.label}</Pill>
        <Pill color={priority.color} bg={priority.bg}>{priority.dot} {priority.label}</Pill>
        {!isMine && (
          <button onClick={() => { selfAssign(task.id); onClose(); }} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
            borderRadius: 99, fontSize: 12, fontWeight: 500,
            background: 'var(--green-bg)', color: 'var(--green)',
            border: '0.5px solid rgba(52,199,89,0.3)',
          }}>
            <UserCheck size={11} strokeWidth={2} /> Assign to me
          </button>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, borderRadius: 'var(--r)', background: 'var(--bg)', border: '0.5px solid var(--sep)' }}>
        {task.assignee && (
          <DetailRow label="Assignee">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
              <Avatar username={task.assignee.username} size={22} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{task.assignee.username}</span>
              {isMine && <span style={{ fontSize: 11, color: 'var(--text-4)' }}>(you)</span>}
            </div>
          </DetailRow>
        )}
        <DetailRow label="Created">
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: 13 }}><CalendarDays size={13} strokeWidth={1.5} />{fmt(task.createdAt)}</div>
        </DetailRow>
        <DetailRow label="Updated">
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: 13 }}><Clock size={13} strokeWidth={1.5} />{fmt(task.updatedAt)}</div>
        </DetailRow>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <DetailRow label="Tags">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {task.tags.map((tag) => (
              <span key={tag.id} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: tag.color + '18', color: tag.color }}>{tag.name}</span>
            ))}
          </div>
        </DetailRow>
      )}

      {/* Blocked by */}
      {blockers.length > 0 && (
        <DetailRow label={`Blocked by (${blockers.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
            {blockers.map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 'var(--r-sm)', background: 'var(--red-bg)', border: '0.5px solid rgba(255,59,48,0.18)' }}>
                <Ban size={12} color="var(--red)" strokeWidth={1.8} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{b.title}</span>
                <Pill color={STATUS_META[b.status].color} bg={STATUS_META[b.status].bg}>{STATUS_META[b.status].label}</Pill>
                <button onClick={() => removeBlocker(task.id, b.id)} style={{ fontSize: 11, color: 'var(--text-4)', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,59,48,0.12)' }}>Remove</button>
              </div>
            ))}
          </div>
        </DetailRow>
      )}

      {/* Is blocking others */}
      {blocking.length > 0 && (
        <DetailRow label={`Blocking (${blocking.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
            {blocking.map((b) => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 'var(--r-sm)', background: 'var(--orange-bg)', border: '0.5px solid rgba(255,149,0,0.18)' }}>
                <Ban size={12} color="var(--orange)" strokeWidth={1.8} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{b.title}</span>
                <Pill color={STATUS_META[b.status].color} bg={STATUS_META[b.status].bg}>{STATUS_META[b.status].label}</Pill>
              </div>
            ))}
          </div>
        </DetailRow>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: '0.5px solid var(--sep-2)' }}>
        <button onClick={onEdit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--r-sm)', background: 'var(--blue-bg)', color: 'var(--blue)', border: '0.5px solid rgba(0,122,255,0.2)', fontSize: 13, fontWeight: 600 }}>
          <Pencil size={13} strokeWidth={2} /> Edit
        </button>
        <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--r-sm)', background: 'var(--red-bg)', color: 'var(--red)', border: '0.5px solid rgba(255,59,48,0.2)', fontSize: 13, fontWeight: 600 }}>
          <Trash2 size={13} strokeWidth={2} /> Delete
        </button>
      </div>
    </div>
  );
}