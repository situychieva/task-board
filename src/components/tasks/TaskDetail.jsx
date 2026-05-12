import React from 'react';
import { Pencil, Trash2, Clock, CalendarDays, UserCheck } from 'lucide-react';
import { Pill, Avatar, STATUS_META, PRIORITY_META } from '../ui';
import { useTaskStore } from '../../store/taskStore';

const ASSIGNMENT_STATUS_META = {
  NONE:     { label: 'Unassigned', color: 'var(--gray)',   bg: 'var(--gray-bg)' },
  PENDING:  { label: 'Pending',    color: 'var(--orange)', bg: 'var(--orange-bg)' },
  APPROVED: { label: 'Approved',   color: 'var(--green)',  bg: 'var(--green-bg)' },
  REJECTED: { label: 'Rejected',   color: 'var(--red)',    bg: 'var(--red-bg)' },
};

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
  const { selfAssign } = useTaskStore();
  const [assigning, setAssigning] = React.useState(false);
  const [assignError, setAssignError] = React.useState(null);

  const status           = STATUS_META[task.status];
  const priority         = PRIORITY_META[task.priority];
  const assignmentStatus = ASSIGNMENT_STATUS_META[task.assignmentStatus ?? 'NONE'];

  const handleSelfAssign = async () => {
    setAssigning(true);
    setAssignError(null);
    try {
      await selfAssign(task.id);
      onClose();
    } catch (err) {
      setAssignError(err.message);
      setAssigning(false);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, letterSpacing: '-0.02em' }}>{task.title}</h2>
        {task.description && <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>{task.description}</p>}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill color={status.color} bg={status.bg}>{status.label}</Pill>
        <Pill color={priority.color} bg={priority.bg}>{priority.dot} {priority.label}</Pill>
        <Pill color={assignmentStatus.color} bg={assignmentStatus.bg}>{assignmentStatus.label}</Pill>
        {task.assignmentStatus === 'NONE' && (
          <button
            onClick={handleSelfAssign}
            disabled={assigning}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px',
              borderRadius: 99, fontSize: 12, fontWeight: 500,
              background: 'var(--green-bg)', color: 'var(--green)',
              border: '0.5px solid rgba(52,199,89,0.3)',
              opacity: assigning ? 0.6 : 1, cursor: assigning ? 'default' : 'pointer',
            }}
          >
            <UserCheck size={11} strokeWidth={2} />
            {assigning ? 'Assigning…' : 'Assign to me'}
          </button>
        )}
      </div>
      {assignError && (
        <div style={{ padding: '8px 12px', borderRadius: 'var(--r-sm)', background: 'var(--red-bg)', border: '0.5px solid rgba(255,59,48,0.2)', fontSize: 13, color: 'var(--red)' }}>
          {assignError}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, borderRadius: 'var(--r)', background: 'var(--bg)', border: '0.5px solid var(--sep)' }}>
        {task.assignee && (
          <DetailRow label="Assignee">
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
              <Avatar username={task.assignee.username} size={22} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{task.assignee.username}</span>
            </div>
          </DetailRow>
        )}
        <DetailRow label="Visibility">
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{task.visibility}</span>
        </DetailRow>
        <DetailRow label="Created">
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: 13 }}>
            <CalendarDays size={13} strokeWidth={1.5} />{fmt(task.createdAt)}
          </div>
        </DetailRow>
        <DetailRow label="Updated">
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)', fontSize: 13 }}>
            <Clock size={13} strokeWidth={1.5} />{fmt(task.updatedAt)}
          </div>
        </DetailRow>
      </div>

      {task.tags?.length > 0 && (
        <DetailRow label="Tags">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {task.tags.map((tag) => (
              <span key={tag.id} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: tag.color + '18', color: tag.color }}>{tag.name}</span>
            ))}
          </div>
        </DetailRow>
      )}

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
