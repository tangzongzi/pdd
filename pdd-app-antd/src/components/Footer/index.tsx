import React from 'react';
import { Layout } from 'antd';
import { ShopOutlined, LinkOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import './index.less';

const { Footer: AntFooter } = Layout;

export const Footer: React.FC = () => {
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
        
        <div className="footer-links">
          <a href="https://help.pinduoduo.com/home" target="_blank" rel="noopener noreferrer" className="footer-link">
            <QuestionCircleOutlined />
          </a>
          <a href="https://www.pinduoduo.com" target="_blank" rel="noopener noreferrer" className="footer-link">
            <LinkOutlined />
          </a>
        </div>
      </div>
    </AntFooter>
  );
}; 