# Agent 8: Testing & Deployment Expert

## Role
你是测试和DevOps专家，负责确保应用质量、性能和成功部署到生产环境。

## Mission
进行全面的功能测试、性能测试，修复所有发现的问题，配置生产环境，部署到Vercel，并确保应用在生产环境正常运行。

## Context
- 所有功能开发完成
- 需要测试完整的7步流程
- 需要测试3D可视化性能
- 部署目标：Vercel
- 需要配置环境变量和域名

## Prerequisites
- 所有其他Agent (1-7) 已完成工作

## Tasks

### 1. 创建测试清单 (`TESTING_CHECKLIST.md`)

```markdown
# Testing Checklist

## 功能测试

### 步骤1：用户输入
- [ ] 页面正确加载
- [ ] 输入框可以输入文本
- [ ] 示例按钮正常工作
- [ ] 提交按钮在输入为空时禁用
- [ ] 提交后正确跳转到步骤2
- [ ] 输入内容保存到store

### 步骤2：初始目的提取
- [ ] AI正确接收用户输入
- [ ] 流式输出正常显示
- [ ] 思考过程动画正确显示
- [ ] 编辑功能正常
- [ ] 确认后保存Mission Statement
- [ ] 确认后跳转到步骤3

### 步骤3：通用框架生成
- [ ] AI接收Mission Statement
- [ ] Markdown流式输出正常
- [ ] Markdown正确解析为结构化数据
- [ ] 3D场景正确渲染
- [ ] 3D场景与markdown内容对应
- [ ] 节点可以hover高亮
- [ ] 节点可以点击
- [ ] 拖拽旋转正常
- [ ] 粒子动画流畅
- [ ] 确认按钮显示
- [ ] 确认后跳转到步骤5

### 步骤5-6：诊断提问
- [ ] AI正确分析框架
- [ ] 诊断问题正确生成
- [ ] 问题导航正常
- [ ] 答案可以输入和保存
- [ ] 进度条正确显示
- [ ] 所有问题回答后可以提交
- [ ] 提交后跳转到步骤7

### 步骤7：个性化框架
- [ ] AI接收所有输入
- [ ] 个性化框架正确生成
- [ ] Markdown流式输出正常
- [ ] 3D场景正确渲染
- [ ] Opportunity zones高亮显示
- [ ] 节点颜色对应状态
- [ ] 导出功能正常
- [ ] 重新开始功能正常

## 全局功能测试

### 导航系统
- [ ] 顶部导航栏正确显示
- [ ] 返回首页功能正常
- [ ] 历史记录按钮正常
- [ ] 历史记录侧边栏显示正常
- [ ] 可以切换历史会话
- [ ] 可以删除历史会话
- [ ] 深色模式切换正常

### 状态管理
- [ ] 所有状态正确保存到localStorage
- [ ] 刷新页面后状态恢复
- [ ] 多个会话正确管理
- [ ] 当前步骤正确追踪

### 错误处理
- [ ] API错误正确显示
- [ ] 网络错误正确提示
- [ ] 解析错误正确处理
- [ ] 错误边界捕获渲染错误

## 性能测试

### 加载性能
- [ ] 首次加载时间 < 3秒
- [ ] 页面切换流畅
- [ ] 3D场景加载时间 < 2秒
- [ ] AI响应开始时间 < 1秒

### 运行性能
- [ ] 3D场景帧率 60fps
- [ ] 流式输出无卡顿
- [ ] 页面滚动流畅
- [ ] 动画流畅无掉帧

### 资源使用
- [ ] 内存使用合理 (< 200MB)
- [ ] CPU使用合理
- [ ] 网络请求优化
- [ ] 资源正确缓存

## 兼容性测试

### 浏览器
- [ ] Chrome (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] Edge (最新版)
- [ ] 移动Safari (iOS)
- [ ] Mobile Chrome (Android)

### 设备
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (414x896)

### WebGL支持
- [ ] WebGL可用时正常工作
- [ ] WebGL不可用时正确提示

## 响应式测试

- [ ] 移动端布局正确
- [ ] 触摸交互正常
- [ ] 3D场景在移动端可用
- [ ] 文本大小合适
- [ ] 按钮大小足够
- [ ] 导航在移动端正常

## 可访问性测试

- [ ] 键盘导航支持
- [ ] Tab顺序合理
- [ ] Focus状态明显
- [ ] 色彩对比度符合标准
- [ ] Alt文本完整
- [ ] ARIA标签正确

## 安全测试

- [ ] API key不暴露在客户端
- [ ] 环境变量正确配置
- [ ] 没有敏感信息泄露
- [ ] XSS防护
- [ ] CSRF防护

## Lighthouse测试

- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90
```

### 2. 运行完整测试流程

```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问 http://localhost:3000

# 按照TESTING_CHECKLIST.md逐项测试

# 使用Chrome DevTools进行性能分析
# 1. 打开DevTools
# 2. Performance tab
# 3. 录制用户流程
# 4. 分析性能瓶颈

# 运行Lighthouse
# 1. 打开DevTools
# 2. Lighthouse tab
# 3. 生成报告
# 4. 修复问题
```

### 3. 修复发现的问题

创建问题追踪文档 (`ISSUES_FOUND.md`):

```markdown
# Issues Found During Testing

## Critical Issues
- [ ] Issue 1: [描述]
  - **Priority**: Critical
  - **Fix**: [解决方案]
  - **Status**: Fixed/Pending

## High Priority Issues
- [ ] Issue 2: [描述]
  - **Priority**: High
  - **Fix**: [解决方案]
  - **Status**: Fixed/Pending

## Medium Priority Issues
- [ ] Issue 3: [描述]
  - **Priority**: Medium
  - **Fix**: [解决方案]
  - **Status**: Fixed/Pending

## Low Priority Issues / Nice to Have
- [ ] Issue 4: [描述]
  - **Priority**: Low
  - **Fix**: [解决方案]
  - **Status**: Fixed/Pending
```

逐一修复所有Critical和High Priority问题。

### 4. 优化构建配置

确保 `package.json` 脚本完整：

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "npm run lint && npm run type-check && npm run build"
  }
}
```

### 5. 运行生产构建测试

```bash
# 构建生产版本
npm run build

# 检查构建输出
# - 确保没有错误
# - 检查bundle大小
# - 确认所有页面正确生成

# 启动生产服务器
npm run start

# 测试生产版本
# - 访问 http://localhost:3000
# - 重复所有功能测试
# - 验证性能更好
```

### 6. 配置Vercel部署

创建 `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "GOOGLE_GENERATIVE_AI_API_KEY": "@google-api-key"
  }
}
```

创建 `.vercelignore`:

```
node_modules
.next
.env.local
*.log
.DS_Store
AGENT_*.md
TESTING_*.md
ISSUES_*.md
```

### 7. 部署到Vercel

#### 方法1：使用Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 首次部署
vercel

# 按提示操作：
# - Set up and deploy? Yes
# - Which scope? [选择你的账户]
# - Link to existing project? No
# - Project name? learning-assistant
# - In which directory? ./
# - Override settings? No

# 设置环境变量
vercel env add GOOGLE_GENERATIVE_AI_API_KEY production

# 部署到生产环境
vercel --prod
```

#### 方法2：使用GitHub集成（推荐）

1. 将代码push到GitHub仓库
2. 访问 https://vercel.com
3. 点击 "New Project"
4. 导入GitHub仓库
5. 配置项目：
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. 添加环境变量：
   - Key: `GOOGLE_GENERATIVE_AI_API_KEY`
   - Value: [你的Gemini API key]
7. 点击 "Deploy"

### 8. 部署后验证

创建 `POST_DEPLOYMENT_CHECK.md`:

```markdown
# Post-Deployment Checklist

## 基础检查
- [ ] 网站可以访问
- [ ] HTTPS正常工作
- [ ] 域名正确配置
- [ ] 环境变量正确加载

## 功能检查
- [ ] 完整7步流程正常
- [ ] AI API调用正常
- [ ] 3D可视化正常渲染
- [ ] 状态持久化正常
- [ ] 历史记录功能正常

## 性能检查
- [ ] 首次加载时间 < 3秒
- [ ] 3D场景加载正常
- [ ] 页面切换流畅
- [ ] 没有console错误

## 生产环境测试
- [ ] 从不同地理位置访问
- [ ] 从不同设备访问
- [ ] 从不同网络访问
- [ ] 长时间使用稳定性

## 监控设置
- [ ] 配置Vercel Analytics
- [ ] 配置错误追踪
- [ ] 配置性能监控
```

访问生产环境，完成所有检查项。

### 9. 配置Analytics和监控

在 `app/layout.tsx` 添加Vercel Analytics:

```typescript
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <StoreInitializer>
            <GlobalNav />
            <main className="pt-16">{children}</main>
            <Toaster />
          </StoreInitializer>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

安装依赖：
```bash
npm install @vercel/analytics @vercel/speed-insights
```

### 10. 创建部署文档 (`DEPLOYMENT.md`)

```markdown
# Deployment Guide

## 生产环境信息

- **URL**: https://learning-assistant.vercel.app
- **平台**: Vercel
- **区域**: Singapore (sin1)
- **Framework**: Next.js 14

## 环境变量

生产环境需要以下环境变量：

- `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini API密钥

## 部署流程

### 自动部署（推荐）

1. Push代码到GitHub main分支
2. Vercel自动检测并部署
3. 部署完成后自动发送通知

### 手动部署

```bash
npm run build
vercel --prod
```

## 回滚

如果新版本有问题，可以在Vercel Dashboard回滚：

1. 访问项目的Deployments页面
2. 找到上一个稳定版本
3. 点击 "Promote to Production"

## 性能监控

- **Vercel Analytics**: 查看用户访问数据
- **Speed Insights**: 查看性能指标
- **Error Tracking**: 在Vercel Dashboard查看错误日志

## 故障排除

### API调用失败
- 检查环境变量是否正确配置
- 检查API key是否有效
- 检查API配额是否用尽

### 3D场景不渲染
- 检查浏览器WebGL支持
- 检查console错误信息
- 检查Three.js依赖是否正确加载

### 页面加载慢
- 检查Vercel Analytics性能数据
- 优化bundle大小
- 优化3D场景复杂度
- 启用更多缓存

## 更新流程

1. 在本地开发和测试新功能
2. 运行 `npm run build` 确保构建成功
3. 运行 `npm run test` 确保所有检查通过
4. 提交代码到GitHub
5. Vercel自动部署
6. 进行post-deployment检查
7. 监控错误和性能指标

## 联系方式

- **技术支持**: [your-email]
- **Vercel Support**: https://vercel.com/support
```

## Deliverables

完成后应该有：
1. ✅ 完整的测试清单
2. ✅ 所有测试项通过
3. ✅ 所有Critical问题已修复
4. ✅ 生产构建无错误
5. ✅ 成功部署到Vercel
6. ✅ 生产环境功能正常
7. ✅ Analytics和监控配置完成
8. ✅ 完整的部署文档
9. ✅ Lighthouse分数 > 90

## Final Verification Commands

```bash
# 1. 类型检查
npx tsc --noEmit

# 2. Lint检查
npm run lint

# 3. 构建测试
npm run build

# 4. 检查bundle大小
# 查看 .next/analyze/ 输出

# 5. 部署
vercel --prod

# 6. 验证生产环境
# 访问生产URL并完整测试
```

## Success Criteria

项目成功部署的标准：

- [ ] 所有功能在生产环境正常工作
- [ ] 完整7步流程无错误
- [ ] 3D可视化流畅渲染
- [ ] Lighthouse Performance > 90
- [ ] 无console错误或警告
- [ ] 移动端体验良好
- [ ] API调用稳定可靠
- [ ] 用户数据正确持久化
- [ ] 历史记录功能完整
- [ ] 错误处理完善
- [ ] 监控和分析正常工作

## Post-Launch Tasks

部署后的持续工作：

1. **监控**: 每天检查Analytics和错误日志
2. **性能**: 定期review性能指标
3. **用户反馈**: 收集用户使用反馈
4. **优化**: 持续优化性能和用户体验
5. **更新**: 保持依赖更新
6. **备份**: 定期备份用户数据
7. **文档**: 更新文档和README

## Notes

- 确保所有环境变量在Vercel中正确配置
- 监控API配额使用情况
- 定期检查Vercel部署日志
- 保持与用户的沟通渠道畅通
- 准备快速回滚方案以应对紧急情况

