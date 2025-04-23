import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BasicLayout } from '@/layouts/BasicLayout';
import { Calculator } from '@/pages/Calculator';
import { BatchAnalysis } from '@/pages/BatchAnalysis';
import { History } from '@/pages/History';
import { DiscountActivity } from '@/pages/DiscountActivity';

// 抖音页面组件
import { Calculator as DyCalculator } from '@/pages/DyCalculator';
import { BatchAnalysis as DyBatchAnalysis } from '@/pages/DyBatchAnalysis';
import { DiscountActivity as DyDiscount } from '@/pages/DyDiscount';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BasicLayout />}>
          <Route index element={<Calculator />} />
          <Route path="batch" element={<BatchAnalysis />} />
          <Route path="history" element={<History />} />
          <Route path="discount" element={<DiscountActivity />} />
          
          {/* 抖音平台路由 */}
          <Route path="douyin" element={<DyCalculator />} />
          <Route path="douyin/batch" element={<DyBatchAnalysis />} />
          <Route path="douyin/discount" element={<DyDiscount />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}; 