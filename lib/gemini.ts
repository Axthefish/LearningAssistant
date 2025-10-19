import { GoogleGenerativeAI } from '@google/generative-ai'

function getGeminiClient() {
  if (!process.env.Gemini_API_KEY) {
    throw new Error('Missing Gemini_API_KEY environment variable')
  }
  
  const genAI = new GoogleGenerativeAI(
    process.env.Gemini_API_KEY
  )
  
  // Gemini 2.5 Pro 配置
  // 使用正确的gemini-2.5-pro模型
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

// 每次都创建新实例，避免Serverless环境的单例问题
export function getModel() {
  return getGeminiClient()
}

export interface StreamChunk {
  type: 'thinking' | 'content'
  text: string
}
