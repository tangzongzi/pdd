import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import { 
  CalculatorOutlined, 
  LineChartOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  PercentageOutlined,
  AppstoreOutlined,
  PlayCircleOutlined,
  DollarOutlined,
  TagOutlined,
  MoneyCollectOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Footer } from '@/components/Footer';
import './BasicLayout.less';

const { Content, Sider, Header } = Layout;
const { Title } = Typography;

export const BasicLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [collapsed, setCollapsed] = useState(false);
  
  // 获取当前路径对应的菜单项
  const getSelectedKeys = () => {
    const pathKey = currentPath.split('/')[1] || 'calculator';
    return [pathKey];
  };
  
  // 获取当前打开的子菜单
  const getOpenKeys = () => {
    if (currentPath.includes('/douyin-') || currentPath === '/dy-pricing') {
      return ['douyin'];
    }
    if (currentPath === '/calculator' || currentPath === '/batch' || currentPath === '/discount') {
      return ['pinduoduo'];
    }
    return [];
  };
  
  const [openKeys, setOpenKeys] = useState(getOpenKeys());
  
  // 处理子菜单打开状态
  const onOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  return (
    <Layout className="basic-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={220}
        className="sidebar"
        theme="light"
        trigger={null}
      >
        <div className="logo">
          <ShoppingOutlined className="logo-icon" />
          {!collapsed && <span className="logo-text">计算工具</span>}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          items={[
            {
              key: 'douyin',
              icon: <PlayCircleOutlined />,
              label: '抖音平台',
              children: [
                {
                  key: 'dy-pricing',
                  icon: <DollarOutlined />,
                  label: <Link to="/dy-pricing">抖音控价</Link>,
                },
                {
                  key: 'douyin-low-price',
                  icon: <ShoppingOutlined />,
                  label: <Link to="/douyin-low-price">低价起价</Link>,
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
                  key: 'profit-calculator',
                  icon: <MoneyCollectOutlined />,
                  label: <Link to="/profit-calculator">利润计算</Link>,
                }
              ]
            },
            {
              key: 'pinduoduo',
              icon: <AppstoreOutlined />,
              label: '拼多多平台',
              children: [
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
                }
              ]
            },
            {
              key: 'history',
              icon: <HistoryOutlined />,
              label: <Link to="/history">历史记录</Link>,
            }
          ]}
        />
      </Sider>
      
      <Layout className="site-layout">
        <Header className="site-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
            <Title level={4} className="page-title">
              {currentPath === '/calculator' && '拼单计算器'}
              {currentPath === '/batch' && '批量计算'}
              {currentPath === '/history' && '历史记录'}
              {currentPath === '/dy-pricing' && '抖音控价'}
              {currentPath === '/douyin-discount' && '抖音折扣价'}
              {currentPath === '/douyin-coupon' && '外漏优惠券'}
              {currentPath === '/douyin-low-price' && '低价起价'}
              {currentPath === '/profit-calculator' && '利润计算'}
              {currentPath === '/discount' && '7折计算'}
            </Title>
          </div>
        </Header>
        
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