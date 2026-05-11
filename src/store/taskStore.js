import { create } from 'zustand';
import { mockTasks, mockTags } from '../utils/mockData';

const PAGE_SIZE = 6;

export const useTaskStore = create((set, get) => ({
  tasks: [],
  tags: [],
  isLoading: false,
  error: null,

  filters: { status: null, priority: null, tagId: null, assigneeId: null, search: '', onlyMine: false },
  sort: { field: 'updatedAt', dir: 'desc' },
  page: 1,

  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value }, page: 1 })),
  clearFilters: () => set({ filters: { status: null, priority: null, tagId: null, assigneeId: null, search: '', onlyMine: false }, page: 1 }),
  setSort: (field, dir) => set({ sort: { field, dir }, page: 1 }),
  setPage: (page) => set({ page }),

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    await new Promise((r) => setTimeout(r, 600));
    set({ tasks: mockTasks, tags: mockTags, isLoading: false });
  },

  getFilteredTasks: () => {
    const { tasks, filters, sort } = get();
    const PRIORITY_RANK = { low: 0, medium: 1, high: 2 };

    let result = tasks.filter((t) => {
      if (filters.status     && t.status !== filters.status) return false;
      if (filters.priority   && t.priority !== filters.priority) return false;
      if (filters.tagId      && !t.tags.some((tg) => tg.id === filters.tagId)) return false;
      if (filters.assigneeId && t.assignee?.id !== filters.assigneeId) return false;
      if (filters.onlyMine   && t.assignee?.id !== 4) return false;
      if (filters.search     && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let av, bv;
      if (sort.field === 'priority') { av = PRIORITY_RANK[a.priority]; bv = PRIORITY_RANK[b.priority]; }
      else if (sort.field === 'title') { av = a.title.toLowerCase(); bv = b.title.toLowerCase(); }
      else { av = new Date(a[sort.field]); bv = new Date(b[sort.field]); }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  },

  getPagedTasks: () => {
    const { page } = get();
    const all = get().getFilteredTasks();
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const items = all.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
    return { items, total, page: safePage, totalPages, pageSize: PAGE_SIZE };
  },

  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  addTask: (task) => set((s) => ({
    tasks: [{ ...task, id: Date.now(), blockedBy: task.blockedBy ?? [] }, ...s.tasks],
  })),

  updateTask: (id, patch) => set((s) => ({
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t)),
  })),

  addBlocker: (taskId, blockerId) => set((s) => ({
    tasks: s.tasks.map((t) =>
      t.id === taskId && !t.blockedBy.includes(blockerId)
        ? { ...t, blockedBy: [...t.blockedBy, blockerId] }
        : t
    ),
  })),

  removeBlocker: (taskId, blockerId) => set((s) => ({
    tasks: s.tasks.map((t) =>
      t.id === taskId ? { ...t, blockedBy: t.blockedBy.filter((id) => id !== blockerId) } : t
    ),
  })),

  moveTaskStatus: (taskId, newStatus) => set((s) => ({
    tasks: s.tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    ),
  })),

  assignTask: (taskId, user) => set((s) => ({
    tasks: s.tasks.map((t) =>
      t.id === taskId ? { ...t, assignee: user, updatedAt: new Date().toISOString() } : t
    ),
  })),

  selfAssign: (taskId) => {
    const CURRENT_USER = { id: 4, username: 'you' };
    get().assignTask(taskId, CURRENT_USER);
  },
}));

export const PAGE_SIZE_EXPORT = PAGE_SIZE;