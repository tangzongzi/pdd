import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BasicLayout } from '@/layouts/BasicLayout';
import { Calculator } from '@/pages/Calculator';
import { BatchAnalysis } from '@/pages/BatchAnalysis';
import { History } from '@/pages/History';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<Calculator />} />
          <Route path="batch" element={<BatchAnalysis />} />
          <Route path="history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}; 