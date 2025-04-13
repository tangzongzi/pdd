# 拼多多卖家工具

一个为拼多多卖家设计的价格计算和批量分析工具，基于 React + Ant Design。

## 功能特点

- **价格计算器**：快速计算拼单价和单买价，包含平台手续费
- **批量分析**：批量处理多规格商品的价格计算
- **现代UI**：基于 Ant Design Pro 的专业界面
- **响应式设计**：适配电脑和移动设备
- **数据即时处理**：所有计算在本地完成，无需服务器

## 技术栈

- **前端框架**：React 18 + TypeScript
- **UI组件**：Ant Design 5.x
- **样式方案**：Less
- **状态管理**：Zustand
- **路由管理**：React Router 6
- **构建工具**：Vite

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务
npm run dev

# 构建生产版本
npm run build
```

## 部署

这个项目配置为静态网站，可以轻松部署到任何静态托管服务，如 Netlify、Vercel、GitHub Pages 等。

### Netlify 部署步骤

1. 在 Netlify 上创建新站点
2. 关联你的 Git 仓库
3. 设置构建命令为 `npm run build`
4. 设置发布目录为 `dist`
5. 点击部署按钮

## 项目结构

```
src/
├── components/       # 公共组件
├── layouts/          # 布局组件
├── models/           # 数据模型
├── pages/            # 页面组件
├── utils/            # 工具函数
├── App.tsx           # 应用入口
├── main.tsx          # 渲染入口
├── global.less       # 全局样式
└── theme.less        # 主题变量
```

## 版权信息

拼多多 2025年 