# 一起赛事

一起赛事是一个专为 Minecraft 运动会设计的综合赛事直播后台管理系统。该系统集成了赛事管理、数据可视化、实时直播包装设计与发布等功能，为赛事运营团队提供一站式解决方案。

## 功能特性

### 1. 赛事管理
- **赛事概览**: 查看当前进行中的赛事、即将开始的比赛和历史记录
- **日程安排**: 管理赛事时间表，支持拖拽调整
- **运动员管理**: 维护运动员信息，包括国籍、参赛项目、历史成绩等
- **成员管理**: 角色权限管理（管理员、导播、解说、设计师、赛事运营）

### 2. 数据管理
- **数据表格**: 支持创建和管理赛事数据表
- **Excel 导入**: 集成 Luckysheet，支持 Excel 文件导入导出
- **MediaWiki 导入**: 支持从 Minecraft Wiki 导入运动员数据
- **实时数据绑定**: 直播包装组件与数据表实时关联

### 3. 直播包装编辑器
- **可视化画布**: 1920x1080 画布，支持拖拽、缩放、平移
- **组件系统**: 文本、图片、数据绑定文本、容器等多种组件
- **节点编辑器**: 可视化逻辑编排，支持条件判断、数据转换、动画触发
- **实时预览**: 支持预览模式查看最终效果
- **资源管理**: 图片资源上传和管理

### 4. 主题切换
- **现代主题**: 默认的 Ant Design 风格
- **OreUI 主题**: Minecraft 风格的深色主题，点击头像即可切换

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 组件库**: Ant Design 5
- **状态管理**: Zustand
- **路由**: React Router
- **电子表格**: Luckysheet
- **图标**: Ant Design Icons

## 快速开始

### 环境要求
- Node.js 18+
- npm 9+ 或 yarn 1.22+

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 启动生产服务器
```bash
npm run preview
```

## 项目结构

```
mob-broadcast-system/
├── docs/                   # 项目文档
├── public/                 # 静态资源
│   ├── fonts/             # OreUI 字体文件
│   ├── images/            # 图片资源
│   └── sounds/            # 音效文件
├── src/
│   ├── components/        # 组件
│   │   ├── Layout/        # 布局组件
│   │   ├── PackageEditor/ # 直播包装编辑器组件
│   │   └── ThemeProvider.tsx # 主题提供者
│   ├── pages/             # 页面
│   ├── stores/            # 状态管理 (Zustand)
│   ├── styles/            # 样式文件
│   │   └── oreui-theme.css # OreUI 主题样式
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 使用说明

### 登录系统
1. 打开应用后进入登录页面
2. 使用默认账号登录：
   - 管理员: admin / admin
   - 其他角色: 见登录页面提示

### 切换主题
1. 点击右上角头像
2. 选择"切换主题"选项
3. 或在头像下拉菜单中点击"切换主题"

### 创建直播包装
1. 进入"直播包装"页面
2. 点击"新建包装"
3. 在编辑器中拖拽组件到画布
4. 配置组件属性和数据绑定
5. 保存并预览

### 导入数据
1. 进入"数据表格"页面
2. 创建新表格或选择现有表格
3. 点击"导入"按钮
4. 选择 Excel 文件或从 MediaWiki 导入

## 角色权限

| 角色 | 权限 |
|------|------|
| 管理员 | 所有功能 |
| 导播 | 赛事控制、直播包装预览 |
| 解说 | 查看赛事信息、数据表格 |
| 设计师 | 直播包装编辑、资源管理 |
| 赛事运营 | 赛事管理、数据录入 |

## 开发计划

- [x] 基础架构搭建
- [x] 用户认证系统
- [x] 赛事管理模块
- [x] 运动员管理
- [x] 数据表格管理
- [x] 直播包装编辑器
- [x] 主题切换功能
- [ ] 实时数据推送
- [ ] 多语言支持
- [ ] 移动端适配

## 贡献指南

欢迎提交 Issue 和 Pull Request。在贡献代码前，请确保：

1. 代码符合 TypeScript 类型规范
2. 通过 ESLint 检查
3. 遵循现有的代码风格

## 许可证

MIT License

## 致谢

- [Ant Design](https://ant.design/)
- [Luckysheet](https://mengshukeji.github.io/Luckysheet/)
- [OreUI](https://github.com/Spectrollay/OreUI) - Minecraft 风格 UI 参考
