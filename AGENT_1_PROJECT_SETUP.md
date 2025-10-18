# Agent 1: Project Setup Expert

## Role
你是一位资深的Next.js项目架构师，负责搭建高质量的项目基础架构。

## Mission
初始化Learning Assistant项目的基础设施，包括Next.js配置、依赖安装、基础文件结构和开发环境配置。

## Context
- 项目位置: `/Users/apple/Desktop/Project/Context engineer/LearningAssistant`
- 技术栈: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- 部署目标: Vercel
- AI模型: Gemini 2.5 Pro

## Tasks

### 1. 初始化Next.js项目
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

选择配置:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Turbopack: Yes
- Import alias: Yes (@/*)

### 2. 安装核心依赖

```bash
npm install ai @google/generative-ai zustand three @types/three framer-motion lucide-react clsx tailwind-merge
```

### 3. 安装shadcn/ui

```bash
npx shadcn-ui@latest init -d
```

安装需要的组件:
```bash
npx shadcn-ui@latest add button card input textarea label progress separator tabs
```

### 4. 创建项目目录结构

```
/app
  /api
    /chat
      route.ts (空文件，留给Agent 2)
  /initial
    page.tsx (空文件，留给Agent 5)
  /universal
    page.tsx (空文件，留给Agent 6)
  /diagnosis
    page.tsx (空文件，留给Agent 5)
  /personalized
    page.tsx (空文件，留给Agent 6)
  layout.tsx
  page.tsx (空文件，留给Agent 5)
  globals.css

/components
  /3d
    (留给Agent 3)
  /chat
    (留给Agent 2)
  /ui
    (shadcn组件)

/lib
  prompts.ts (空文件，留给Agent 2)
  gemini.ts (空文件，留给Agent 2)
  store.ts (空文件，留给Agent 4)
  3d-mapper.ts (空文件，留给Agent 3)
  utils.ts

/public
  (保留默认)
```

### 5. 配置环境变量

创建 `.env.example`:
```env
# Gemini API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

创建 `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=
```

添加到 `.gitignore`:
```
.env.local
```

### 6. 配置 Next.js

更新 `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    return config
  },
}

module.exports = nextConfig
```

### 7. 配置 Tailwind

更新 `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### 8. 创建 lib/utils.ts

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 9. 更新 app/layout.tsx

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Learning Assistant",
  description: "将模糊需求转化为个性化行动蓝图",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

### 10. 创建空的占位文件

为其他Agent创建空文件（带注释说明责任人）：

`app/api/chat/route.ts`:
```typescript
// Agent 2: AI Integration Expert 负责实现
export async function POST(req: Request) {
  return new Response('Agent 2 TODO', { status: 501 })
}
```

`lib/prompts.ts`:
```typescript
// Agent 2: AI Integration Expert 负责实现
export const PROMPTS = {}
```

`lib/store.ts`:
```typescript
// Agent 4: State Management Expert 负责实现
```

`lib/3d-mapper.ts`:
```typescript
// Agent 3: 3D Visualization Expert 负责实现
```

## Deliverables

完成后应该有：
1. ✅ 可运行的Next.js项目（`npm run dev`成功启动）
2. ✅ 所有依赖正确安装
3. ✅ 目录结构完整
4. ✅ 配置文件正确
5. ✅ shadcn/ui组件可用
6. ✅ 没有TypeScript错误

## Verification Commands

```bash
# 检查依赖
npm list --depth=0

# 启动开发服务器
npm run dev

# TypeScript检查
npx tsc --noEmit

# ESLint检查
npm run lint
```

## Hand-off to Next Agents

完成后通知：
- **Agent 2** (AI Integration): 可以开始实现 `/api/chat/route.ts` 和 prompt 系统
- **Agent 3** (3D Visualization): 可以开始实现 3D 组件
- **Agent 4** (State Management): 可以开始实现全局状态管理

## Notes
- 确保 `.env.local` 在 `.gitignore` 中
- 不要提交 API keys
- 保持项目结构清晰，为后续Agent留好接口

