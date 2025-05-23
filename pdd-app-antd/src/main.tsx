import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import './global.less';

// 自定义主题
const theme = {
  token: {
    colorPrimary: '#143d69',
    colorLink: '#143d69',
    colorSuccess: '#28a745',
    colorWarning: '#ffc107', 
    colorError: '#dc3545',
    colorTextBase: '#333',
    colorBgBase: '#f8f9fa',
    borderRadius: 4,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    // 减少内置尺寸
    sizeUnit: 4,
    sizeStep: 4,
    marginXS: 6,
    marginSM: 8,
    margin: 10,
    marginMD: 12,
    marginLG: 16,
    marginXL: 20,
    paddingXS: 6,
    paddingSM: 8,
    padding: 10,
    paddingMD: 12,
    paddingLG: 16,
    paddingXL: 20,
  },
  components: {
    Table: {
      headerBg: '#143d69',
      headerColor: '#ffffff',
      rowHoverBg: 'rgba(20, 61, 105, 0.05)',
    },
    Card: {
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      padding: 12,
      paddingSM: 8,
      paddingLG: 16, 
    },
    Button: {
      primaryColor: '#ffffff',
    },
    Divider: {
      marginLG: 12,
      margin: 10,
      marginSM: 8,
      marginXS: 6,
    },
    Form: {
      marginLG: 12,
      margin: 10, 
    },
  },
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={theme}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
); 