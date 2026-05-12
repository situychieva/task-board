import { create } from 'zustand';
import { api } from '../api/client';

// Map any legacy/extra statuses to the 3 supported ones
function normalizeStatus(s) {
  if (s === 'review')  return 'in_progress';
  if (s === 'blocked') return 'todo';
  return s;
}

// API → UI shape
function normalize(t) {
  return {
    id:          t.id,
    title:       t.title,
    description: t.description ?? '',
    status:      normalizeStatus(t.status.toLowerCase()),
    priority:    t.priority.toLowerCase(),      // LOW → low
    assignee:    t.assignee
                   ? { id: t.assignee.id, username: t.assignee.nickname }
                   : null,
    tags:        (t.tags ?? []).map((tg) => ({
                   id:    tg.id,
                   name:  tg.name,
                   color: tagColor(tg.name),
                 })),
    assignmentStatus: (t.assignmentStatus ?? 'NONE').toUpperCase(),
    assignedById:     t.assignedById ?? null,
    viewerUserIds:    t.viewerUserIds ?? [],
    createdAt:        t.createdAt,
    updatedAt:        t.updatedAt,
    visibility:       t.visibility ?? 'PUBLIC',
  };
}

// Deterministic color from tag name
const PALETTE = ['#007aff','#34c759','#ff9500','#ff3b30','#af52de','#5ac8fa'];
function tagColor(name) {
  let h = 0;
  for (const c of (name ?? '')) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return PALETTE[Math.abs(h) % PALETTE.length];
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
    const { data } = await api.post('/tasks', {
      title:       body.title,
      description: body.description ?? '',
      status:      (body.status ?? 'todo').toUpperCase(),
      priority:    (body.priority ?? 'medium').toUpperCase(),
      visibility:  'ANYONE',
    });
    set((s) => ({ tasks: [normalize(data), ...s.tasks] }));
    return data;
  },

  updateTask: async (id, body) => {
    const existing = get().tasks.find((t) => t.id === id);
    if (!existing) return;
    // Optimistic update
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...body } : t) }));
    try {
      const { data } = await api.put(`/tasks/${id}`, {
        title:       body.title       ?? existing.title,
        description: body.description ?? existing.description ?? '',
        status:      (body.status     ?? existing.status).toUpperCase(),
        priority:    (body.priority   ?? existing.priority).toUpperCase(),
        visibility:  existing.visibility ?? 'ANYONE',
        viewerUserIds: [],
      });
      set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? normalize(data) : t) }));
    } catch (err) {
      // Rollback
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
    // Be robust to API id types (number vs string vs UUID).
    const existing = get().tasks.find((t) => String(t.id) === String(taskId));
    if (!existing || existing.status === newStatus) return;
    // Optimistic
    set((s) => ({ tasks: s.tasks.map((t) => String(t.id) === String(taskId) ? { ...t, status: newStatus } : t) }));
    try {
      await api.put(`/tasks/${taskId}`, {
        title:        existing.title,
        description:  existing.description ?? '',
        status:       newStatus.toUpperCase(),
        priority:     existing.priority.toUpperCase(),
        visibility:   existing.visibility ?? 'ANYONE',
        viewerUserIds: [],
      });
    } catch {
      // Rollback
      set((s) => ({ tasks: s.tasks.map((t) => String(t.id) === String(taskId) ? existing : t) }));
    }
  },

  selfAssign: async (taskId) => {
    try {
      const { data } = await api.post(`/tasks/${taskId}/assign`);
      set((s) => ({ tasks: s.tasks.map((t) => t.id === taskId ? normalize(data) : t) }));
    } catch (err) {
      throw err;
    }
  },

  // Kept for compatibility with components that call getFilteredTasks()
  getFilteredTasks: () => get().tasks,
}));