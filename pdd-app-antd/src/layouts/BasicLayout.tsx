import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { Footer } from '@/components/Footer';
import { 
  CalculatorOutlined, 
  LineChartOutlined,
  ShoppingOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import './BasicLayout.less';

const { Content } = Layout;

export const BasicLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Layout className="basic-layout">
      <div className="top-nav">
        <div className="app-logo">
          <ShoppingOutlined className="logo-icon" />
          拼多多助手
        </div>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-item ${currentPath === '/' ? 'active' : ''}`}
          >
            <CalculatorOutlined />
            价格计算器
          </Link>
          <Link 
            to="/batch" 
            className={`nav-item ${currentPath === '/batch' ? 'active' : ''}`}
          >
            <LineChartOutlined />
            批量计算
          </Link>
          <Link 
            to="/history" 
            className={`nav-item ${currentPath === '/history' ? 'active' : ''}`}
          >
            <HistoryOutlined />
            历史记录
          </Link>
        </div>
      </div>
      <Layout className="site-layout">
        <Content className="main-content">
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
}; 