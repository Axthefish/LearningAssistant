import { GoogleGenerativeAI } from '@google/generative-ai'

function getGeminiClient() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
  }
  
  const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  )
  
  // Gemini 2.5 Pro 配置
  // 基于官方文档：支持大规模上下文窗口和流式输出
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
    generationConfig: {
      temperature: 0.7, // 平衡创造性和一致性
      topP: 0.9,        // 核采样
      topK: 40,         // Top-K 采样
      maxOutputTokens: 8192, // 最大输出 token 数
    },
  })
}

// Lazy initialization
let modelInstance: ReturnType<typeof getGeminiClient> | null = null

export function getModel() {
  if (!modelInstance) {
    modelInstance = getGeminiClient()
  }
  return modelInstance
}

export interface StreamChunk {
  type: 'thinking' | 'content'
  text: string
}
