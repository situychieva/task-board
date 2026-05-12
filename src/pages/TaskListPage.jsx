import React, { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { FilterBar } from '../components/tasks/FilterBar';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { TaskForm } from '../components/tasks/TaskForm';
import { DeleteConfirm } from '../components/tasks/DeleteConfirm';
import { Modal } from '../components/ui/Modal';
import { Spinner, STATUS_META } from '../components/ui';
import { Plus, List, LayoutGrid, Columns, AlertCircle } from 'lucide-react';

function StatsPills({ tasks }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {Object.entries(STATUS_META).map(([key, { label, color, bg }]) => {
        const count = tasks.filter((t) => t.status === key).length;
        if (count === 0) return null;
        return (
          <span key={key} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 99,
            fontSize: 12, fontWeight: 500, color, background: bg,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
            {count} {label}
          </span>
        );
      })}
    </div>
  );
}

const VIEWS = [
  { key: 'list',   Icon: List,       label: 'List'  },
  { key: 'grid',   Icon: LayoutGrid, label: 'Grid'  },
  { key: 'kanban', Icon: Columns,    label: 'Board' },
];

export function TaskListPage() {
  const { fetchTasks, fetchTags, deleteTask, isLoading, error, tasks, filters } = useTaskStore();
  const [view, setView]   = React.useState('list');
  const [modal, setModal] = React.useState(null);

  // Fetch whenever filters or view change; in Kanban mode load all tasks at once
  useEffect(() => { fetchTasks({ kanban: view === 'kanban' }); }, [
    view,
    filters.status, filters.priority, filters.tag,
    filters.q, filters.mine, filters.sort, filters.order, filters.page,
  ]);
  useEffect(() => { fetchTags(); }, []);

  const openDetail = (task)   => setModal({ type: 'detail', task });
  const openCreate = (status) => setModal({ type: 'create', defaultStatus: status ?? 'todo' });
  const openEdit   = (task)   => setModal({ type: 'edit',   task });
  const openDelete = (task)   => setModal({ type: 'delete', task });
  const closeModal = ()       => setModal(null);

  const handleDeleteConfirm = async () => {
    await deleteTask(modal.task.id);
    closeModal();
  };

  const isKanban = view === 'kanban';

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '232px 1fr',
        gridTemplateRows: 'auto 1fr',
        height: '100vh', width: '100vw',
        overflow: 'hidden', background: 'var(--bg)',
      }}>

        {/* Header */}
        <header style={{
          gridColumn: '1 / -1',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 20px', height: 52,
          background: 'rgba(242,242,247,0.88)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid var(--sep)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,122,255,0.35)' }}>
              <span style={{ fontSize: 13, color: '#fff' }}>✓</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>Tasks</span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--r-sm)', padding: 2, gap: 1, border: '0.5px solid var(--sep)' }}>
            {VIEWS.map(({ key, Icon, label }) => (
              <button key={key} onClick={() => setView(key)} title={label} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6,
                background: view === key ? 'var(--bg-2)' : 'transparent',
                color: view === key ? 'var(--text)' : 'var(--text-4)',
                boxShadow: view === key ? 'var(--sh-xs)' : 'none',
                fontSize: 12, fontWeight: view === key ? 600 : 400, transition: 'all 0.15s ease',
              }}>
                <Icon size={13} strokeWidth={1.8} />
                <span style={{ display: view === key ? 'inline' : 'none' }}>{label}</span>
              </button>
            ))}
          </div>

          <button onClick={() => openCreate(null)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'var(--blue)', color: '#fff', borderRadius: 'var(--r-sm)',
            padding: '6px 14px', fontSize: 13, fontWeight: 600,
            boxShadow: '0 1px 4px rgba(0,122,255,0.3)', transition: 'opacity 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Plus size={14} strokeWidth={2.5} /> New Task
          </button>
        </header>

        {/* Sidebar */}
        <aside style={{
          background: 'rgba(242,242,247,0.6)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRight: '0.5px solid var(--sep)',
          padding: '20px 12px', overflowY: 'auto',
        }}>
          <FilterBar />
        </aside>

        {/* Main */}
        <main style={{
          overflowY: isKanban ? 'hidden' : 'auto',
          overflowX: 'hidden',
          padding: isKanban ? '16px 0 0' : '20px 24px',
          display: 'flex', flexDirection: 'column',
          gap: isKanban ? 0 : 14,
        }}>

          {!isKanban && !isLoading && tasks.length > 0 && <StatsPills tasks={tasks} />}

          {!isKanban && !isLoading && (
            <p style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 500 }}>
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          )}

          {isKanban && !isLoading && (
            <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-5)' }}>Drag cards between columns to change status</span>
            </div>
          )}

          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: 220, color: 'var(--text-4)' }}>
              <Spinner size={26} />
              <span style={{ fontSize: 13 }}>Loading tasks…</span>
            </div>
          )}

          {!isLoading && error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--r)', background: 'var(--red-bg)', color: 'var(--red)', fontSize: 13, margin: isKanban ? '0 24px' : 0 }}>
              <AlertCircle size={15} strokeWidth={1.5} /> {error}
            </div>
          )}

          {!isLoading && !error && isKanban && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <KanbanBoard onCardOpen={openDetail} onAddTask={openCreate} onDeleteTask={openDelete} />
            </div>
          )}

          {!isLoading && !error && !isKanban && tasks.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, height: 220, color: 'var(--text-4)' }}>
              <span style={{ fontSize: 36, opacity: 0.3 }}>◻</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>No tasks</span>
              <span style={{ fontSize: 13 }}>Try adjusting your filters</span>
            </div>
          )}

          {!isLoading && !error && !isKanban && tasks.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr',
              gap: 10, alignContent: 'start',
            }}>
              {tasks.map((task, i) => (
                <div key={task.id} style={{ animationDelay: `${i * 25}ms` }}>
                  <TaskCard
                    task={task}
                    onDelete={(id) => openDelete(tasks.find((t) => t.id === id))}
                    onClick={openDetail}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {modal?.type === 'detail' && (
        <Modal title="Task Detail" onClose={closeModal}>
          <TaskDetail task={modal.task} onEdit={() => { closeModal(); openEdit(modal.task); }} onDelete={() => openDelete(modal.task)} onClose={closeModal} />
        </Modal>
      )}
      {modal?.type === 'create' && (
        <Modal title="New Task" onClose={closeModal}>
          <TaskForm defaultStatus={modal.defaultStatus} onClose={closeModal} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit Task" onClose={closeModal}>
          <TaskForm task={modal.task} onClose={closeModal} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Confirm Delete" onClose={closeModal} width={420}>
          <DeleteConfirm task={modal.task} onConfirm={handleDeleteConfirm} onCancel={closeModal} />
        </Modal>
      )}
    </>
  );
}