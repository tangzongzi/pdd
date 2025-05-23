import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Dropdown, Space, Menu } from 'antd';
import { Footer } from '@/components/Footer';
import { 
  CalculatorOutlined, 
  LineChartOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  PercentageOutlined,
  DownOutlined,
  AppstoreOutlined,
  PlayCircleOutlined,
  DollarOutlined,
  TagOutlined
} from '@ant-design/icons';
import './BasicLayout.less';

const { Content } = Layout;

export const BasicLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 判断当前路径是否是平台工具之一
  const isPlatformTool = ['/', '/batch', '/discount'].includes(currentPath);
  
  // 判断当前路径是否是抖音平台工具之一
  const isDouyinTool = ['/dy-pricing', '/douyin-discount', '/douyin-coupon', '/douyin-low-price'].includes(currentPath);

  // 创建拼多多平台下拉菜单
  const platformItems = [
    {
      key: 'calculator',
      icon: <CalculatorOutlined />,
      label: <Link to="/">拼单计算</Link>,
    },
    {
      key: 'batch',
      icon: <LineChartOutlined />,
      label: <Link to="/batch">批量计算</Link>,
    },
    {
      key: 'discount',
      icon: <PercentageOutlined />,
      label: <Link to="/discount">7折计算</Link>,
    },
  ];
  
  // 创建抖音平台下拉菜单
  const douyinItems = [
    {
      key: 'dy-pricing',
      icon: <DollarOutlined />,
      label: <Link to="/dy-pricing">抖音定价</Link>,
    },
    {
      key: 'douyin-discount',
      icon: <PercentageOutlined />,
      label: <Link to="/douyin-discount">抖音折扣价</Link>,
    },
    {
      key: 'douyin-coupon',
      icon: <TagOutlined />,
      label: <Link to="/douyin-coupon">外漏优惠券</Link>,
    },
    {
      key: 'douyin-low-price',
      icon: <ShoppingOutlined />,
      label: <Link to="/douyin-low-price">低价起价</Link>,
    },
    // 可以在此添加更多抖音相关功能子菜单
  ];

  return (
    <Layout className="basic-layout">
      <div className="top-nav">
        <div className="app-logo">
          <ShoppingOutlined className="logo-icon" />
          拼多多助手
        </div>
        <div className="nav-links">
          <Dropdown 
            menu={{ items: platformItems }}
            placement="bottomCenter"
            trigger={['hover']}
          >
            <div className={`nav-item dropdown-nav-item ${isPlatformTool ? 'active' : ''}`}>
              <Space>
                <AppstoreOutlined />
                拼多多平台
                <DownOutlined />
              </Space>
            </div>
          </Dropdown>
          
          <Dropdown 
            menu={{ items: douyinItems }}
            placement="bottomCenter"
            trigger={['hover']}
          >
            <div className={`nav-item dropdown-nav-item ${isDouyinTool ? 'active' : ''}`}>
              <Space>
                <PlayCircleOutlined />
                抖音平台
                <DownOutlined />
              </Space>
            </div>
          </Dropdown>
          
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