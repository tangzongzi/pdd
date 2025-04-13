import React from 'react';
import { Layout } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import './index.less';

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        <div className="footer-logo">
          <ShopOutlined className="footer-icon" />
          <span className="footer-app-name">拼多多卖家工具</span>
        </div>
        
        <div className="footer-copyright">
          © {currentYear} 拼多多卖家助手 | 专业电商数据分析工具
        </div>
      </div>
    </AntFooter>
  );
}; 