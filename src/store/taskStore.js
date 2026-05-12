import { create } from 'zustand';
import { api } from '../api/client';

function normalizeStatus(s) {
  if (s === 'review')  return 'in_progress';
  if (s === 'blocked') return 'todo';
  return s;
}

function normalize(t) {
  return {
    id:               t.id,
    title:            t.title,
    description:      t.description ?? '',
    status:           normalizeStatus(t.status.toLowerCase()),
    priority:         t.priority.toLowerCase(),
    assignee:         t.assignee
                        ? { id: t.assignee.id, username: t.assignee.nickname }
                        : null,
    tags:             (t.tags ?? []).map((tg) => ({
                        id:    tg.id,
                        name:  tg.name,
                        color: tagColor(tg.name),
                      })),
    assignmentStatus: (t.assignmentStatus ?? 'NONE').toUpperCase(),
    assignedById:     t.assignedById ?? null,
    viewerUserIds:    t.viewerUserIds ?? [],
    createdAt:        t.createdAt,
    updatedAt:        t.updatedAt,
    visibility:       t.visibility ?? 'ANYONE',
  };
}

const PALETTE = ['#007aff','#34c759','#ff9500','#ff3b30','#af52de','#5ac8fa'];
function tagColor(name) {
  let h = 0;
  for (const c of (name ?? '')) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

function currentUserId() {
  try {
    return JSON.parse(localStorage.getItem('authUser') ?? '{}')?.id ?? null;
  } catch { return null; }
}

export const useTaskStore = create((set, get) => ({
  tasks:      [],
  tags:       [],
  isLoading:  false,
  error:      null,
  pagination: { total: 0, page: 1, pageSize: 20, totalPages: 1 },

  filters: {
    status:   null,
    priority: null,
    tag:      null,
    q:        '',
    mine:     null,
    sort:     'updatedAt',
    order:    'desc',
    page:     1,
  },

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value, page: 1 } })),

  clearFilters: () =>
    set({ filters: { status: null, priority: null, tag: null, q: '', mine: null, sort: 'updatedAt', order: 'desc', page: 1 } }),

  setPage: (page) =>
    set((s) => ({ filters: { ...s.filters, page } })),

  setSort: (sort, order) =>
    set((s) => ({ filters: { ...s.filters, sort, order, page: 1 } })),

  fetchTasks: async ({ kanban = false } = {}) => {
    set({ isLoading: true, error: null });
    const { filters } = get();
    const params = {
      sort:     filters.sort,
      order:    filters.order,
      page:     kanban ? 1 : filters.page,
      pageSize: kanban ? 100 : 20,
    };
    if (filters.status)   params.status   = filters.status.toUpperCase();
    if (filters.priority) params.priority = filters.priority.toUpperCase();
    if (filters.tag)      params.tag      = filters.tag;
    if (filters.q)        params.q        = filters.q;
    if (filters.mine)     params.mine     = filters.mine;

    try {
      const { data } = await api.get('/tasks', { params });
      const items = data.items ?? [];
      set({
        tasks: items.map(normalize),
        pagination: {
          total:      data.total,
          page:       data.page,
          pageSize:   data.pageSize,
          totalPages: Math.ceil(data.total / data.pageSize),
        },
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchTags: async () => {
    try {
      const { data } = await api.get('/tags');
      set({ tags: data.map((t) => ({ id: t.id, name: t.name, color: tagColor(t.name) })) });
    } catch {}
  },

  createTask: async (body) => {
    const userId = currentUserId();
    const { data } = await api.post('/tasks', {
      title:       body.title,
      description: body.description ?? '',
      status:      (body.status ?? 'todo').toUpperCase(),
      priority:    (body.priority ?? 'medium').toUpperCase(),
      visibility:  'ANYONE',
      ...(userId ? { assigneeId: userId } : {}),
    });
    set((s) => ({ tasks: [normalize(data), ...s.tasks] }));
    get().fetchTasks();
    return data;
  },

  updateTask: async (id, body) => {
    const existing = get().tasks.find((t) => t.id === id);
    if (!existing) return;
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...body } : t) }));
    try {
      const { data } = await api.put(`/tasks/${id}`, {
        title:         body.title       ?? existing.title,
        description:   body.description ?? existing.description ?? '',
        status:        (body.status     ?? existing.status).toUpperCase(),
        priority:      (body.priority   ?? existing.priority).toUpperCase(),
        visibility:    existing.visibility ?? 'ANYONE',
        viewerUserIds: [],
      });
      set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? normalize(data) : t) }));
    } catch (err) {
      set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? existing : t) }));
      throw err;
    }
  },

  deleteTask: async (id) => {
    const backup = get().tasks;
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    try {
      await api.delete(`/tasks/${id}`);
    } catch (err) {
      set({ tasks: backup });
      throw err;
    }
  },

  moveTaskStatus: async (taskId, newStatus) => {
    const existing = get().tasks.find((t) => String(t.id) === String(taskId));
    if (!existing || existing.status === newStatus) return;
    set((s) => ({ tasks: s.tasks.map((t) => String(t.id) === String(taskId) ? { ...t, status: newStatus } : t) }));
    try {
      await api.put(`/tasks/${taskId}`, {
        title:         existing.title,
        description:   existing.description ?? '',
        status:        newStatus.toUpperCase(),
        priority:      existing.priority.toUpperCase(),
        visibility:    existing.visibility ?? 'ANYONE',
        viewerUserIds: [],
      });
    } catch {
      set((s) => ({ tasks: s.tasks.map((t) => String(t.id) === String(taskId) ? existing : t) }));
    }
  },

  selfAssign: async (taskId) => {
    const userId = currentUserId();
    if (!userId) throw new Error('Not logged in');
    const { data } = await api.post(`/tasks/${taskId}/assignment`, { assigneeId: userId });
    set((s) => ({ tasks: s.tasks.map((t) => t.id === taskId ? normalize(data) : t) }));
  },

  getFilteredTasks: () => get().tasks,
}));