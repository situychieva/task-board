export const mockTags = [
  { id: 1, name: 'frontend', color: '#007aff' },
  { id: 2, name: 'backend',  color: '#af52de' },
  { id: 3, name: 'bug',      color: '#ff3b30' },
  { id: 4, name: 'feature',  color: '#34c759' },
  { id: 5, name: 'design',   color: '#ff9500' },
  { id: 6, name: 'docs',     color: '#8e8e93' },
];

export const mockUsers = [
  { id: 1, username: 'alex_k',  avatar: null },
  { id: 2, username: 'maria_t', avatar: null },
  { id: 3, username: 'john_d',  avatar: null },
  { id: 4, username: 'you',     avatar: null },
];

export const mockTasks = [
  {
    id: 1, title: 'Set up authentication flow',
    description: 'Implement JWT-based login and register endpoints, integrate with frontend auth store.',
    status: 'done', priority: 'high',
    assignee: mockUsers[3], tags: [mockTags[1], mockTags[3]],
    createdAt: '2025-04-28T09:00:00Z', updatedAt: '2025-05-01T14:22:00Z',
  },
  {
    id: 2, title: 'Design task card component',
    description: 'Create a reusable task card with status badge, priority indicator, tags and assignee avatar.',
    status: 'in_progress', priority: 'medium',
    assignee: mockUsers[3], tags: [mockTags[0], mockTags[4]],
    createdAt: '2025-05-02T10:00:00Z', updatedAt: '2025-05-07T16:00:00Z',
  },
  {
    id: 3, title: 'Fix pagination bug on task list',
    description: 'Tasks beyond page 2 return 500. Investigate query offset handling in the API.',
    status: 'blocked', priority: 'high',
    assignee: mockUsers[1], tags: [mockTags[2], mockTags[1]],
    createdAt: '2025-05-03T08:30:00Z', updatedAt: '2025-05-06T11:00:00Z',
  },
  {
    id: 4, title: 'Write API documentation',
    description: 'Document all REST endpoints with request/response examples using Swagger.',
    status: 'review', priority: 'low',
    assignee: mockUsers[0], tags: [mockTags[5]],
    createdAt: '2025-05-04T13:00:00Z', updatedAt: '2025-05-07T09:00:00Z',
  },
  {
    id: 5, title: 'Implement Kanban board view',
    description: 'Add drag-and-drop Kanban view as an alternative to the list view.',
    status: 'todo', priority: 'medium',
    assignee: mockUsers[2], tags: [mockTags[0], mockTags[3]],
    createdAt: '2025-05-05T11:00:00Z', updatedAt: '2025-05-05T11:00:00Z',
  },
  {
    id: 6, title: 'Add tag filtering to task list',
    description: 'Allow users to filter tasks by one or multiple tags. Persist filter state in URL.',
    status: 'todo', priority: 'low',
    assignee: mockUsers[3], tags: [mockTags[0], mockTags[3]],
    createdAt: '2025-05-06T09:00:00Z', updatedAt: '2025-05-06T09:00:00Z',
  },
  {
    id: 7, title: 'Performance audit — reduce bundle size',
    description: 'Run Lighthouse audit, identify heavy chunks, apply code splitting and lazy loading.',
    status: 'in_progress', priority: 'medium',
    assignee: mockUsers[0], tags: [mockTags[0]],
    createdAt: '2025-05-07T08:00:00Z', updatedAt: '2025-05-08T10:00:00Z',
  },
];