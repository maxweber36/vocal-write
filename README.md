# Vocal Write - 语音实时转写应用

这是一个基于 Next.js 和 Electron，并集成腾讯云实时语音识别服务构建的桌面应用。它能实时将用户的语音输入转换为文字，提供简洁、高效的本地化语音转写体验。

## 功能特性

- **实时语音识别**：基于 WebSocket，实现低延迟的语音到文本转换。
- **现代化 UI**：采用 Tailwind CSS 构建，界面简洁、响应式，并包含录音动画和音量指示。
- **组件化结构**：代码经过重构，UI 和功能被拆分为独立的 React 组件，提高了可维护性。
- **安全可靠**：API 密钥存储在后端，通过临时签名授权前端使用，保障密钥安全。
- **跨平台桌面应用**：使用 Electron 打包，可运行在 macOS、Windows 和 Linux 系统上。

## 技术栈

- **核心框架**: [Next.js](https://nextjs.org/) ^14.2.3, [Electron](https://www.electronjs.org/) ^31.0.0
- **UI**: [React](https://reactjs.org/) ^18.2.0, [Tailwind CSS](https://tailwindcss.com/) ^3.4.3
- **语音服务**: [腾讯云实时语音识别](https://cloud.tencent.com/product/asr)
- **音频处理**: Web Audio API (AudioWorklet)
- **代码规范**: [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)

## 项目结构

重构后的项目遵循更清晰的模块化结构：

```
src/
├── components/       # React 组件
│   ├── feature/      # 特定功能组件 (如：识别结果、音量可视化)
│   ├── layout/       # 布局组件 (如：页眉、页脚)
│   └── ui/           # 通用 UI 组件 (如：按钮)
├── main/             # Electron 主进程代码
└── preload/          # Electron 预加载脚本
lib/                  # 辅助模块
├── api.js            # 后端 API 请求
├── asr-service.js    # 封装 ASR 服务
└── utils.js          # 通用工具函数
pages/                # Next.js 页面
hooks/                # 自定义 React Hooks
public/               # 静态资源
styles/               # 全局样式
```

## 代码规范

项目引入了 ESLint 和 Prettier 以确保代码质量和风格的一致性。在提交代码前，建议运行以下命令来格式化代码：

```bash
npm run format
```

## 项目设置与启动

### 1. 克隆项目

```bash
git clone https://github.com/your-username/vocal-write.git
cd vocal-write
```

### 2. 安装依赖

```bash
npm install
# or
yarn install
```

### 3. 配置环境变量

在项目根目录下创建一个名为 `.env.local` 的文件，并填入您的腾讯云 API 密钥信息：

```
# .env.local

TENCENT_APP_ID=您的腾讯云 AppId
TENCENT_SECRET_ID=您的腾讯云 SecretId
TENCENT_SECRET_KEY=您的腾讯云 SecretKey
```

> **重要提示**：`.env.local` 文件已被添加到 `.gitignore` 中，以防止您的密钥被意外提交到代码仓库。

### 4. 启动开发服务器

```bash
npm run dev
# or
yarn dev
```

现在，在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可看到运行的应用。

## 如何使用

1. 打开应用页面。
2. 点击页面中央的麦克风图标，浏览器会请求麦克风权限，请允许。
3. 开始说话，您会看到识别的文字实时出现在文本框中。
4. 再次点击麦克风图标即可停止录音。
