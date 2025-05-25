import React from 'react';
import { Layout } from 'antd';
import './index.less';

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        {/* 底部内容已移除 */}
      </div>
    </AntFooter>
  );
}; 