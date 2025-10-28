# 🎓 Learning Assistant

将模糊需求转化为个性化行动蓝图的AI辅助学习产品。

## ✨ 特性

- 🤖 **AI驱动**: 基于Gemini 2.5 Pro的智能分析
- 📊 **7步流程**: 从模糊想法到清晰行动方案
- 🎨 **3D可视化**: 精美的Three.js框架展示
- 💾 **自动保存**: 会话自动持久化，随时可恢复
- 🌓 **深色模式**: 支持深色/浅色主题切换
- 📱 **响应式设计**: 完美适配桌面和移动设备

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+
- npm 或 pnpm

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 并添加你的 Gemini API Key
# GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

**获取Gemini API Key**:
1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 创建或登录Google账号
3. 生成API密钥
4. 复制密钥到 `.env.local`

### 4. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

### 5. 生产构建

```bash
npm run build
npm run start
```

## 📖 使用流程

### 步骤 1: 输入需求
在首页输入你的模糊想法或需求，可以是：
- "我想提升职场影响力"
- "如何更好地管理团队"
- "想要系统地学习AI技术"

### 步骤 2: 确认目标
AI会将你的想法提炼成清晰的使命陈述（Mission Statement），你可以：
- 直接确认
- 编辑修改
- 重新生成

### 步骤 3: 查看通用框架
系统生成通用行动框架，包含：
- 核心模块
- 关键行动
- 系统动态
- **3D可视化展示**（可交互）

### 步骤 4: 选择个性化
决定是否需要为你量身定制的行动建议。

### 步骤 5-6: 诊断分析
回答几个精准的问题，帮助系统了解：
- 你的当前状况
- 优势和机会区域
- 个人特点

### 步骤 7: 获取个性化方案
查看为你定制的行动框架：
- 🟢 **优势区域**: 继续保持
- 🟠 **机会区域**: 重点突破
- 🟡 **维护区域**: 保持稳定
- 具体的下一步行动建议
- **个性化3D可视化**

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **AI**: Gemini 2.5 Pro
- **3D**: Three.js
- **状态管理**: Zustand
- **样式**: Tailwind CSS + shadcn/ui
- **动画**: Framer Motion
- **部署**: Vercel

## 📁 项目结构

```
├── app/                      # Next.js App Router页面
│   ├── page.tsx             # 步骤1: 用户输入
│   ├── initial/             # 步骤2: 目的提取
│   ├── universal/           # 步骤3: 通用框架
│   ├── diagnosis/           # 步骤5-6: 诊断提问
│   ├── personalized/        # 步骤7: 个性化方案
│   └── api/chat/            # AI API端点
├── components/              # React组件
│   ├── 3d/                 # 3D可视化组件
│   ├── chat/               # AI对话组件
│   └── ui/                 # UI组件库
├── lib/                    # 核心逻辑
│   ├── prompts.ts          # AI Prompt模板
│   ├── gemini.ts           # Gemini配置
│   ├── store.ts            # 状态管理
│   ├── 3d-mapper.ts        # 3D数据映射
│   └── markdown-parser.ts  # Markdown解析
└── public/                 # 静态资源
```

## 🧪 开发命令

```bash
# 开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 生产构建
npm run build

# 生产服务器
npm run start

# 完整测试（lint + type-check + build）
npm run test
```

## 🚢 部署

### Vercel（推荐）

1. 推送代码到GitHub
2. 在 [Vercel](https://vercel.com) 导入仓库
3. 配置环境变量：
   - `Gemini_API_KEY`
4. 部署完成！

### 其他平台

确保配置：
- Node.js 18+
- 环境变量
- 构建命令: `npm run build`
- 启动命令: `npm run start`

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `Gemini_API_KEY` | Gemini API密钥 | ✅ |

### Gemini配置

在 `lib/gemini.ts` 中可以调整：
- 模型名称（默认：`gemini-2.5-pro`）
- Temperature（默认：0.7）
- 最大输出Token（默认：8192）

## 💡 使用提示

1. **输入尽可能具体**: 虽然系统能处理模糊输入，但更具体的描述能获得更好的结果
2. **充分利用3D视图**: 拖拽旋转、点击节点，深入了解框架结构
3. **诚实回答问题**: 诊断阶段的答案质量直接影响个性化建议的准确性
4. **保存进度**: 系统自动保存，可以随时中断和继续
5. **查看历史**: 点击顶部导航的历史按钮查看之前的会话

## 🐛 故障排除

### API调用失败
- 检查 `.env.local` 中的API key是否正确
- 确认API key有效且未超配额
- 检查网络连接

### 3D场景不显示
- 确认浏览器支持WebGL
- 尝试刷新页面
- 检查浏览器控制台是否有错误

### 页面加载慢
- 首次加载需要下载3D资源
- 检查网络速度
- 清除浏览器缓存

## 📊 性能指标

- ✅ 首次加载: 137 KB
- ✅ Lighthouse Performance: 90+
- ✅ 3D场景: 60fps
- ✅ 移动端友好

## 🤝 贡献

这是一个个人项目，主要由LLM Coding Agent维护。

## 📄 许可证

MIT License

## 📮 联系方式

如有问题或建议，欢迎提出Issue。

---

**享受你的学习之旅！** 🎉

