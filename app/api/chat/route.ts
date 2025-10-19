import { getModel } from '@/lib/gemini'
import { buildPrompt, getPromptTemplate, type PromptType } from '@/lib/prompts'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60秒超时（Vercel Pro支持）

export async function POST(req: Request) {
  try {
    const { promptType, variables } = await req.json()
    
    // 构建完整prompt
    const template = getPromptTemplate(promptType as PromptType)
    const fullPrompt = buildPrompt(template, variables)
    
    // 获取模型实例并创建流式响应
    const model = getModel()
    const result = await model.generateContentStream(fullPrompt)
    
    // 创建 ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            
            // 发送数据块
            const data = JSON.stringify({
              type: 'content',
              text: text,
            })
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
          }
          
          // 结束流
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream Error:', error)
          controller.error(error)
        }
      },
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}
