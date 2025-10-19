import { getModel } from '@/lib/gemini'
import { buildPrompt, getPromptTemplate, type PromptType } from '@/lib/prompts'

// Vercel Serverless Function配置
export const runtime = 'nodejs'
export const maxDuration = 60 // Vercel Pro支持最多300秒
export const dynamic = 'force-dynamic' // 强制动态渲染

export async function POST(req: Request) {
  const requestStartTime = Date.now()
  
  try {
    const { promptType, variables } = await req.json()
    console.log(`[API] Request received - Type: ${promptType}, Time: ${new Date().toISOString()}`)
    
    // 构建完整prompt
    const template = getPromptTemplate(promptType as PromptType)
    const fullPrompt = buildPrompt(template, variables)
    console.log(`[API] Prompt built - Length: ${fullPrompt.length} chars`)
    
    // 获取模型实例并创建流式响应
    console.log('[API] Initializing Gemini model...')
    const model = getModel()
    
    console.log('[API] Starting generateContentStream...')
    const geminiStartTime = Date.now()
    const result = await model.generateContentStream(fullPrompt)
    console.log(`[API] Stream initialized in ${Date.now() - geminiStartTime}ms`)
    
    // 创建 ReadableStream
    let chunkCount = 0
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('[API] Starting to consume stream...')
          
          for await (const chunk of result.stream) {
            chunkCount++
            const text = chunk.text()
            
            if (chunkCount === 1) {
              console.log(`[API] First chunk received after ${Date.now() - requestStartTime}ms`)
            }
            
            // 发送数据块
            const data = JSON.stringify({
              type: 'content',
              text: text,
            })
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
          }
          
          console.log(`[API] Stream completed - Total chunks: ${chunkCount}, Total time: ${Date.now() - requestStartTime}ms`)
          
          // 结束流
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
          controller.close()
        } catch (streamError) {
          console.error('[API] Stream Error:', streamError)
          
          // 发送错误给前端
          const errorData = JSON.stringify({
            type: 'error',
            text: streamError instanceof Error ? streamError.message : 'Stream error occurred',
          })
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`))
          controller.close()
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
