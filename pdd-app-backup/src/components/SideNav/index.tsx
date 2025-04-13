import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { CalculatorOutlined, LineChartOutlined, HistoryOutlined } from '@ant-design/icons';
import './index.less';

export const SideNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 生成菜单项
  const menuItems = [
    {
      key: '/',
      icon: <CalculatorOutlined />,
      label: <Link to="/">价格计算器</Link>,
    },
    {
      key: '/batch',
      icon: <LineChartOutlined />,
      label: <Link to="/batch">批量计算</Link>,
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: <Link to="/history">历史记录</Link>,
    },
  ];

  return (
    <div className="side-nav">
      <div className="logo">PDD</div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentPath]}
        items={menuItems}
      />
    </div>
  );
}; 