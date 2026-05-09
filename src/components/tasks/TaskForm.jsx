import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTaskStore } from '../../store/taskStore';
import { Spinner } from '../ui';

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(120, 'Max 120 characters'),
  description: z.string().max(1000, 'Max 1000 characters').optional(),
  status:      z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']),
  priority:    z.enum(['low', 'medium', 'high']),
});

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review',      label: 'Review' },
  { value: 'done',        label: 'Done' },
  { value: 'blocked',     label: 'Blocked' },
];

const PRIORITY_OPTIONS = [
  { value: 'low',    label: '○  Low' },
  { value: 'medium', label: '◑  Medium' },
  { value: 'high',   label: '●  High' },
];

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function Select({ error, children, ...props }) {
  return (
    <select
      className={`field-input${error ? ' error' : ''}`}
      style={{ appearance: 'none', cursor: 'pointer', paddingRight: 32, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      {...props}
    >
      {children}
    </select>
  );
}

export function TaskForm({ task, onClose }) {
  const { addTask, updateTask } = useTaskStore();
  const isEdit = Boolean(task);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       task?.title       ?? '',
      description: task?.description ?? '',
      status:      task?.status      ?? 'todo',
      priority:    task?.priority    ?? 'medium',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400)); // simulate API
    if (isEdit) {
      updateTask(task.id, { ...data, updatedAt: new Date().toISOString() });
    } else {
      addTask({
        ...data,
        tags: [],
        assignee: { id: 4, username: 'you' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Title */}
        <Field label="Title" error={errors.title?.message}>
          <input
            className={`field-input${errors.title ? ' error' : ''}`}
            placeholder="What needs to be done?"
            autoFocus
            {...register('title')}
          />
        </Field>

        {/* Description */}
        <Field label="Description" error={errors.description?.message}>
          <textarea
            className={`field-input${errors.description ? ' error' : ''}`}
            placeholder="Add more detail…"
            rows={3}
            {...register('description')}
          />
        </Field>

        {/* Status + Priority row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Status" error={errors.status?.message}>
            <Select error={errors.status} {...register('status')}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Priority" error={errors.priority?.message}>
            <Select error={errors.priority} {...register('priority')}>
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 8,
        padding: '14px 20px',
        borderTop: '0.5px solid var(--sep-2)',
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '7px 16px', borderRadius: 'var(--r-sm)',
            fontSize: 13, fontWeight: 500,
            background: 'var(--bg)', border: '0.5px solid var(--sep)',
            color: 'var(--text-2)',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '7px 18px', borderRadius: 'var(--r-sm)',
            fontSize: 13, fontWeight: 600,
            background: 'var(--blue)', color: '#fff',
            border: 'none',
            boxShadow: '0 1px 4px rgba(0,122,255,0.28)',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: 7,
            transition: 'opacity 0.15s',
          }}
        >
          {isSubmitting && <Spinner size={13} />}
          {isEdit ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}