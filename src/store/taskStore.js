import { create } from 'zustand';
import { mockTasks, mockTags } from '../utils/mockData';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  tags: [],
  isLoading: false,
  error: null,

  // Filters
  filters: {
    status: null,
    priority: null,
    tagId: null,
    search: '',
  },

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  clearFilters: () =>
    set({ filters: { status: null, priority: null, tagId: null, search: '' } }),

  // Simulated fetch
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    await new Promise((r) => setTimeout(r, 800));
    set({ tasks: mockTasks, tags: mockTags, isLoading: false });
  },

  // Derived: filtered tasks
  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.tagId && !t.tags.some((tg) => tg.id === filters.tagId)) return false;
      if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  },

  deleteTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  addTask: (task) =>
    set((s) => ({ tasks: [{ ...task, id: Date.now() }, ...s.tasks] })),

  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
}));
