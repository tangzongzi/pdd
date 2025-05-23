import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Calculator } from '@/pages/Calculator';
import { BatchAnalysis } from '@/pages/BatchAnalysis';
import { History } from '@/pages/History';
import { DyPricing } from '@/pages/DyPricing';
import DouyinDiscount from '@/pages/DouyinDiscount';
import DouyinCouponCalculator from '@/pages/DouyinCoupon';
import DouyinLowPrice from '@/pages/DouyinLowPrice';
import { BasicLayout } from '@/layouts/BasicLayout';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<BasicLayout />}>
          <Route path="/" element={<Navigate to="/calculator" replace />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/batch" element={<BatchAnalysis />} />
          <Route path="/history" element={<History />} />
          <Route path="/dy-pricing" element={<DyPricing />} />
          <Route path="/douyin-discount" element={<DouyinDiscount />} />
          <Route path="/douyin-coupon" element={<DouyinCouponCalculator />} />
          <Route path="/douyin-low-price" element={<DouyinLowPrice />} />
        </Route>
      </Routes>
    </Router>
  );
}; 

export default App; 