import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTaskStore } from '../../store/taskStore';
import { Spinner, Avatar } from '../ui';
import { CURRENT_USER, mockUsers } from '../../utils/mockData';
import { X, Ban } from 'lucide-react';

const schema = z.object({
  title:       z.string().min(1, 'Title is required').max(120, 'Max 120 characters'),
  description: z.string().max(1000, 'Max 1000 characters').optional(),
  status:      z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']),
  priority:    z.enum(['low', 'medium', 'high']),
  assigneeId:  z.number().nullable(),
  tagIds:      z.array(z.number()),
  blockedBy:   z.array(z.number()),
});

const STATUS_OPTIONS  = [
  { value: 'todo', label: 'To Do' }, { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' }, { value: 'done', label: 'Done' }, { value: 'blocked', label: 'Blocked' },
];
const PRIORITY_OPTIONS = [
  { value: 'low', label: '○  Low' }, { value: 'medium', label: '◑  Medium' }, { value: 'high', label: '●  High' },
];

const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238e8e93' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function StyledSelect({ error, children, ...props }) {
  return (
    <select
      className={`field-input${error ? ' error' : ''}`}
      style={{ appearance: 'none', cursor: 'pointer', paddingRight: 32, backgroundImage: chevronBg, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      {...props}
    >{children}</select>
  );
}

export function TaskForm({ task, onClose, defaultStatus }) {
  const { addTask, updateTask, tasks, tags } = useTaskStore();
  const isEdit = Boolean(task);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title:       task?.title ?? '',
      description: task?.description ?? '',
      status:      task?.status ?? defaultStatus ?? 'todo',
      priority:    task?.priority ?? 'medium',
      assigneeId:  task?.assignee?.id ?? CURRENT_USER.id,
      tagIds:      task?.tags?.map((t) => t.id) ?? [],
      blockedBy:   task?.blockedBy ?? [],
    },
  });

  const watchedTagIds    = watch('tagIds');
  const watchedBlockedBy = watch('blockedBy');
  const watchedAssigneeId = watch('assigneeId');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 350));
    const assignee = mockUsers.find((u) => u.id === data.assigneeId) ?? null;
    const taskTags = tags.filter((t) => data.tagIds.includes(t.id));
    const now = new Date().toISOString();
    if (isEdit) {
      updateTask(task.id, { ...data, assignee, tags: taskTags, updatedAt: now });
    } else {
      addTask({ ...data, assignee, tags: taskTags, createdAt: now, updatedAt: now });
    }
    setIsSubmitting(false);
    onClose();
  };

  const blockCandidates = tasks.filter((t) => t.id !== task?.id);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <Field label="Title" error={errors.title?.message}>
          <input className={`field-input${errors.title ? ' error' : ''}`} placeholder="What needs to be done?" autoFocus {...register('title')} />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea className={`field-input${errors.description ? ' error' : ''}`} placeholder="Add more detail…" rows={3} {...register('description')} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Status" error={errors.status?.message}>
            <StyledSelect error={errors.status} {...register('status')}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </StyledSelect>
          </Field>
          <Field label="Priority" error={errors.priority?.message}>
            <StyledSelect error={errors.priority} {...register('priority')}>
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </StyledSelect>
          </Field>
        </div>

        <Field label="Assignee">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {mockUsers.map((u) => {
              const active = watchedAssigneeId === u.id;
              return (
                <Controller key={u.id} name="assigneeId" control={control} render={({ field }) => (
                  <button
                    type="button"
                    onClick={() => field.onChange(active ? null : u.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 10px', borderRadius: 'var(--r-sm)',
                      border: `1px solid ${active ? 'var(--blue)' : 'var(--sep)'}`,
                      background: active ? 'var(--blue-bg)' : 'var(--bg)',
                      fontSize: 12, fontWeight: active ? 600 : 400,
                      color: active ? 'var(--blue)' : 'var(--text-2)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <Avatar username={u.username} size={18} />
                    {u.username}
                    {u.id === CURRENT_USER.id && <span style={{ fontSize: 10, color: 'var(--text-4)' }}>(you)</span>}
                  </button>
                )} />
              );
            })}
          </div>
        </Field>

        <Field label="Tags">
          <Controller name="tagIds" control={control} render={({ field }) => (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tags.map((tag) => {
                const active = field.value.includes(tag.id);
                return (
                  <button
                    key={tag.id} type="button"
                    onClick={() => field.onChange(active ? field.value.filter((id) => id !== tag.id) : [...field.value, tag.id])}
                    style={{
                      padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                      border: `1px solid ${active ? tag.color + 'aa' : tag.color + '44'}`,
                      background: active ? tag.color + '18' : 'transparent',
                      color: active ? tag.color : 'var(--text-3)',
                      transition: 'all 0.15s',
                    }}
                  >{tag.name}</button>
                );
              })}
            </div>
          )} />
        </Field>

        <Field label="Blocked By">
          <Controller name="blockedBy" control={control} render={({ field }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {field.value.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {field.value.map((bid) => {
                    const bt = tasks.find((t) => t.id === bid);
                    if (!bt) return null;
                    return (
                      <div key={bid} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 10px', borderRadius: 'var(--r-sm)',
                        background: 'var(--red-bg)', border: '0.5px solid rgba(255,59,48,0.2)',
                      }}>
                        <Ban size={12} color="var(--red)" strokeWidth={1.8} />
                        <span style={{ flex: 1, fontSize: 12, color: 'var(--text-2)' }}>{bt.title}</span>
                        <button type="button" onClick={() => field.onChange(field.value.filter((id) => id !== bid))}
                          style={{ color: 'var(--text-4)', display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <StyledSelect
                value=""
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val && !field.value.includes(val)) field.onChange([...field.value, val]);
                }}
              >
                <option value="">Add a blocker…</option>
                {blockCandidates
                  .filter((t) => !field.value.includes(t.id))
                  .map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </StyledSelect>
            </div>
          )} />
        </Field>

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '0.5px solid var(--sep-2)' }}>
        <button type="button" onClick={onClose} style={{ padding: '7px 16px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 500, background: 'var(--bg)', border: '0.5px solid var(--sep)', color: 'var(--text-2)' }}>Cancel</button>
        <button type="submit" disabled={isSubmitting} style={{ padding: '7px 18px', borderRadius: 'var(--r-sm)', fontSize: 13, fontWeight: 600, background: 'var(--blue)', color: '#fff', border: 'none', boxShadow: '0 1px 4px rgba(0,122,255,0.28)', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 7, transition: 'opacity 0.15s' }}>
          {isSubmitting && <Spinner size={13} />}
          {isEdit ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}