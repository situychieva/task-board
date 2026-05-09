import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskListPage } from './pages/TaskListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </BrowserRouter>
  );
}