import React, { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { FilterBar } from '../components/tasks/FilterBar';
import { TaskDetail } from '../components/tasks/TaskDetail';
import { TaskForm } from '../components/tasks/TaskForm';
import { DeleteConfirm } from '../components/tasks/DeleteConfirm';
import { Modal } from '../components/ui/Modal';
import { Spinner, STATUS_META } from '../components/ui';
import { Plus, List, LayoutGrid, AlertCircle } from 'lucide-react';

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

// Modal state machine: null | 'detail' | 'create' | 'edit' | 'delete'
export function TaskListPage() {
  const { fetchTasks, deleteTask, isLoading, error, getFilteredTasks, tasks } = useTaskStore();
  const [view, setView] = React.useState('list');
  const [modal, setModal] = React.useState(null); // { type, task? }

  useEffect(() => { fetchTasks(); }, []);
  const filtered = getFilteredTasks();

  const openDetail = (task) => setModal({ type: 'detail', task });
  const openCreate = () => setModal({ type: 'create' });
  const openEdit   = (task) => setModal({ type: 'edit', task });
  const openDelete = (task) => setModal({ type: 'delete', task });
  const closeModal = () => setModal(null);

  const handleDeleteConfirm = () => {
    deleteTask(modal.task.id);
    closeModal();
  };

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '232px 1fr',
        gridTemplateRows: 'auto 1fr',
        height: '100vh', width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg)',
      }}>
        {/* Toolbar */}
        <header style={{
          gridColumn: '1 / -1',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 20px', height: 52,
          background: 'rgba(242,242,247,0.85)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid var(--sep)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7, background: 'var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,122,255,0.35)',
            }}>
              <span style={{ fontSize: 13, color: '#fff' }}>✓</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Tasks
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* View toggle */}
          <div style={{
            display: 'flex', background: 'var(--sep-2)',
            borderRadius: 'var(--r-sm)', padding: 2, gap: 1,
            border: '0.5px solid var(--sep)',
          }}>
            {[['list', List], ['grid', LayoutGrid]].map(([mode, Icon]) => (
              <button key={mode} onClick={() => setView(mode)} style={{
                display: 'flex', alignItems: 'center', padding: '4px 10px',
                borderRadius: 6, border: 'none',
                background: view === mode ? 'var(--bg-2)' : 'transparent',
                color: view === mode ? 'var(--text)' : 'var(--text-4)',
                boxShadow: view === mode ? 'var(--sh-xs)' : 'none',
                transition: 'all 0.15s ease',
              }}>
                <Icon size={14} strokeWidth={1.8} />
              </button>
            ))}
          </div>

          <button
            onClick={openCreate}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'var(--blue)', color: '#fff',
              borderRadius: 'var(--r-sm)', padding: '6px 14px',
              fontSize: 13, fontWeight: 600,
              boxShadow: '0 1px 4px rgba(0,122,255,0.3)',
              transition: 'opacity 0.15s',
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
          overflowY: 'auto', padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          {!isLoading && tasks.length > 0 && <StatsPills tasks={tasks} />}

          {!isLoading && (
            <p style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 500 }}>
              {filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}
            </p>
          )}

          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, height: 220, color: 'var(--text-4)' }}>
              <Spinner size={26} />
              <span style={{ fontSize: 13 }}>Loading tasks…</span>
            </div>
          )}

          {!isLoading && error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 'var(--r)', background: 'var(--red-bg)', color: 'var(--red)', fontSize: 13 }}>
              <AlertCircle size={15} strokeWidth={1.5} /> {error}
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, height: 220, color: 'var(--text-4)' }}>
              <span style={{ fontSize: 36, opacity: 0.3 }}>◻</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>No tasks</span>
              <span style={{ fontSize: 13 }}>Try adjusting your filters</span>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: view === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr',
              gap: 10, alignContent: 'start',
            }}>
              {filtered.map((task, i) => (
                <div key={task.id} style={{ animationDelay: `${i * 30}ms` }}>
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

      {/* ── Modals ── */}
      {modal?.type === 'detail' && (
        <Modal title="Task Detail" onClose={closeModal}>
          <TaskDetail
            task={modal.task}
            onEdit={() => openEdit(modal.task)}
            onDelete={() => openDelete(modal.task)}
            onClose={closeModal}
          />
        </Modal>
      )}

      {modal?.type === 'create' && (
        <Modal title="New Task" onClose={closeModal}>
          <TaskForm onClose={closeModal} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Edit Task" onClose={closeModal}>
          <TaskForm task={modal.task} onClose={closeModal} />
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title="Confirm Delete" onClose={closeModal} width={420}>
          <DeleteConfirm
            task={modal.task}
            onConfirm={handleDeleteConfirm}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </>
  );
}