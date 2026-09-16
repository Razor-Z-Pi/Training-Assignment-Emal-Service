import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Settings from './pages/Settings';
import Compose from './pages/Compose';
import Login from './pages/Login';

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={qc}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/compose" element={<Compose />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);