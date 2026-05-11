import React, { useState, useRef } from 'react';
import { Plus, Clock } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { STATUS_META, PRIORITY_META, Avatar } from '../ui';

function KanbanCard({ task, onOpen, isDragging }) {
  const priority = PRIORITY_META[task.priority];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', String(task.id));
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onOpen(task)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-2)',
        border: '0.5px solid var(--sep)',
        borderRadius: 'var(--r)',
        padding: '10px 12px',
        cursor: 'grab',
        opacity: isDragging ? 0.35 : 1,
        boxShadow: hovered ? 'var(--sh)' : 'var(--sh-xs)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow 0.15s, transform 0.15s, opacity 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        userSelect: 'none',
      }}
    >
      <div style={{
        height: 2, borderRadius: 99,
        background: priority.color,
        opacity: task.priority === 'high' ? 1 : task.priority === 'medium' ? 0.55 : 0.25,
        marginBottom: 2,
      }} />

      <p style={{
        fontSize: 13, fontWeight: 600, color: 'var(--text)',
        lineHeight: 1.4,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
      }}>
        {task.title}
      </p>

      {task.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag.id} style={{
              fontSize: 10, fontWeight: 500,
              color: tag.color, background: tag.color + '16',
              padding: '1px 6px', borderRadius: 99,
            }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        borderTop: '0.5px solid var(--sep-2)', paddingTop: 7,
      }}>
        <span style={{ fontSize: 11, color: priority.color, fontWeight: 600 }}>
          {priority.dot}
        </span>
        <span style={{
          fontSize: 10, color: 'var(--text-5)',
          display: 'flex', alignItems: 'center', gap: 3, flex: 1,
        }}>
          <Clock size={9} strokeWidth={1.5} />
          {(() => {
            const d = Math.floor((Date.now() - new Date(task.updatedAt)) / 86400000);
            return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago`;
          })()}
        </span>
        {task.assignee && <Avatar username={task.assignee.username} size={18} />}
      </div>
    </div>
  );
}

function KanbanColumn({ statusKey, tasks, onCardOpen, onAddTask, draggingId, onDrop }) {
  const meta = STATUS_META[statusKey];
  const [dragOver, setDragOver] = useState(false);
  const enterCount = useRef(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    enterCount.current += 1;
    setDragOver(true);
  };
  const handleDragLeave = () => {
    enterCount.current -= 1;
    if (enterCount.current === 0) setDragOver(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e) => {
    e.preventDefault();
    enterCount.current = 0;
    setDragOver(false);
    const taskId = parseInt(e.dataTransfer.getData('taskId'), 10);
    if (taskId) onDrop(taskId, statusKey);
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 248,
        width: 248,
        flexShrink: 0,
        background: dragOver ? meta.bg : 'rgba(0,0,0,0.018)',
        border: `1.5px solid ${dragOver ? meta.color + '66' : 'var(--sep-2)'}`,
        borderRadius: 'var(--r-lg)',
        transition: 'background 0.15s, border-color 0.15s',
        maxHeight: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '11px 12px 9px',
        flexShrink: 0,
        borderBottom: `1.5px solid ${dragOver ? meta.color + '33' : 'var(--sep-2)'}`,
        background: dragOver ? meta.bg : 'transparent',
        transition: 'all 0.15s',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: meta.color, flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', flex: 1, letterSpacing: '-0.01em' }}>
          {meta.label}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: meta.color, background: meta.bg,
          padding: '1px 7px', borderRadius: 99,
          minWidth: 22, textAlign: 'center',
        }}>
          {tasks.length}
        </span>
        <button
          onClick={() => onAddTask(statusKey)}
          title={`Add to ${meta.label}`}
          style={{
            width: 20, height: 20, borderRadius: 5,
            background: 'transparent', color: 'var(--text-4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = meta.bg; e.currentTarget.style.color = meta.color; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}
        >
          <Plus size={12} strokeWidth={2.5} />
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 8px 12px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {tasks.length === 0 && !dragOver && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 56,
            border: '1.5px dashed var(--sep)',
            borderRadius: 'var(--r)',
            color: 'var(--text-5)', fontSize: 12,
          }}>
            Drop here
          </div>
        )}
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onOpen={onCardOpen}
            isDragging={draggingId === task.id}
          />
        ))}
        {dragOver && (
          <div style={{
            height: 44, flexShrink: 0,
            border: `2px dashed ${meta.color}55`,
            borderRadius: 'var(--r)',
            background: meta.bg,
          }} />
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ onCardOpen, onAddTask }) {
  const { getFilteredTasks, moveTaskStatus } = useTaskStore();
  const [draggingId, setDraggingId] = useState(null);
  const tasks = getFilteredTasks();

  const handleDrop = (taskId, newStatus) => {
    moveTaskStatus(taskId, newStatus);
    setDraggingId(null);
  };

  return (
    <div
      onDragStart={(e) => {
        requestAnimationFrame(() => setDraggingId(parseInt(e.dataTransfer.getData('taskId') || '0', 10)));
      }}
      onDragEnd={() => setDraggingId(null)}
      style={{
        display: 'flex',
        gap: 10,
        height: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '16px 24px 20px',
        alignItems: 'flex-start',
      }}
    >
      {Object.keys(STATUS_META).map((statusKey) => (
        <KanbanColumn
          key={statusKey}
          statusKey={statusKey}
          tasks={tasks.filter((t) => t.status === statusKey)}
          onCardOpen={onCardOpen}
          onAddTask={onAddTask}
          draggingId={draggingId}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}