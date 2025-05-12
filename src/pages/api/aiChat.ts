import { NextRequest } from 'next/server'
import { getVercelAIChatResponseImplemention } from '@/features/chat/vercelAIChatImplementation'
import {
  CoreTool,
  StreamTextResult,
  GenerateTextResult,
  NoSuchToolError,
  InvalidToolArgumentsError,
} from 'ai'
import {
  Language,
  ToolName,
  createSpeakTool,
  createExpressingEmotionTool,
  createMovementTool,
} from '@/features/tool/tool'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createCohere } from '@ai-sdk/cohere'
import { createMistral } from '@ai-sdk/mistral'
import { createAzure } from '@ai-sdk/azure'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export const config = {
  runtime: 'edge',
}

type AIServiceKey =
  | 'openai'
  | 'openrouter'
  | 'anthropic'
  | 'google'
  | 'azure'
  | 'groq'
  | 'cohere'
  | 'mistralai'
  | 'perplexity'
  | 'fireworks'

type AIServiceConfig = Record<AIServiceKey, () => any>

export default async function handler(req: NextRequest) {
  if (!/RobotVRM/.test(req.headers.get('user-agent') ?? '')) {
    return new Response(
      JSON.stringify({
        error: 'This page could not be found.',
        errorCode: 'PAGE_NOT_FOUND',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method Not Allowed',
        errorCode: 'METHOD_NOT_ALLOWED',
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // ストア版でNEXT_PUBLIC_ROBOTVRM_USE_SERVERが"true"以外の場合はサーバー負荷軽減のためLLMではエラーを返却する
  if (
    process.env.NEXT_PUBLIC_ENV === 'store' &&
    process.env.NEXT_PUBLIC_ROBOTVRM_USE_SERVER !== 'true'
  ) {
    return new Response(
      JSON.stringify({
        error: 'Server is not available',
        errorCode: 'SERVER_NOT_AVAILABLE',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const {
    messages,
    apiKey,
    aiService,
    model,
    stream,
    tools,
    maxSteps,
    toolChoice,
    language,
    temperature,
  } = await req.json()

  try {
    let aiApiKey = apiKey
    if (!aiApiKey) {
      throw new Error('Empty API Key', {
        cause: { errorCode: 'EmptyAPIKey', status: 400 },
      })
    }

    if (!aiService || !model) {
      throw new Error('Invalid AI service or model', {
        cause: { errorCode: 'AIInvalidProperty', status: 400 },
      })
    }

    const aiServiceConfig: AIServiceConfig = {
      openai: () => createOpenAI({ apiKey }),
      openrouter: () => createOpenRouter({ apiKey }),
      anthropic: () => createAnthropic({ apiKey }),
      google: () => createGoogleGenerativeAI({ apiKey }),
      azure: () =>
        createAzure({
          resourceName:
            model.match(/https:\/\/(.+?)\.openai\.azure\.com/)?.[1] || '',
          apiKey,
        }),
      groq: () =>
        createOpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey }),
      cohere: () => createCohere({ apiKey }),
      mistralai: () => createMistral({ apiKey }),
      perplexity: () =>
        createOpenAI({ baseURL: 'https://api.perplexity.ai/', apiKey }),
      fireworks: () =>
        createOpenAI({
          baseURL: 'https://api.fireworks.ai/inference/v1',
          apiKey,
        }),
    }

    const aiServiceInstance = aiServiceConfig[aiService as AIServiceKey]

    if (!aiServiceInstance) {
      throw new Error(`Invalid AI service: ${aiService}`, {
        cause: { errorCode: 'InvalidAIService', status: 400 },
      })
    }

    if (tools) {
      const encoder = new TextEncoder()
      const stream = new TransformStream()
      const writer = stream.writable.getWriter()

      // 新しいtoolsオブジェクトを作成
      const newTools: Record<string, CoreTool> = Object.fromEntries(
        Object.entries(tools).map(([key, value]) => {
          const toolName = key as ToolName
          let tool
          switch (toolName) {
            case 'speak':
              tool = createSpeakTool(async (args) => {
                console.log('key=', key)
                console.log('args=', args)
                const toolCallData = JSON.stringify({
                  toolName: key,
                  args: args,
                })
                await writer.write(encoder.encode(`0:${toolCallData}\n`))
                return { result: 'success' }
              }, language as Language)
              break
            case 'expressing_emotion':
              tool = createExpressingEmotionTool(async (args) => {
                console.log('key=', key)
                console.log('args=', args)
                const toolCallData = JSON.stringify({
                  toolName: key,
                  args: args,
                })
                await writer.write(encoder.encode(`0:${toolCallData}\n`))
                return { result: 'success' }
              }, language as Language)
              break
            case 'movement':
              tool = createMovementTool(async (args) => {
                console.log('key=', key)
                console.log('args=', args)
                const toolCallData = JSON.stringify({
                  toolName: key,
                  args: args,
                })
                await writer.write(encoder.encode(`0:${toolCallData}\n`))
                return { result: 'success' }
              }, language as Language)
              break
          }
          return [key, tool]
        })
      )

      console.log('getVercelAIChatResponseImplemention start')

      const promise = getVercelAIChatResponseImplemention(
        messages,
        aiServiceInstance,
        aiService,
        model,
        true,
        newTools,
        maxSteps,
        toolChoice,
        temperature
      )

      // Ensure the promise is handled without blocking the response
      promise.then(async (result) => {
        const newResult = result as StreamTextResult<
          Record<string, CoreTool<any, any>>,
          string
        >

        for await (const value of newResult.textStream) {
          console.log('value=', value)
        }

        console.log('getVercelAIChatResponseImplemention end')
        await writer.close()
      })

      console.log('getVercelAIChatResponseImplemention response')
      return new Response(stream.readable, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    } else {
      // toolsが存在しない場合の処理
      const result = await getVercelAIChatResponseImplemention(
        messages,
        aiServiceInstance,
        aiService,
        model,
        stream,
        undefined,
        maxSteps,
        toolChoice,
        temperature
      )

      if (stream) {
        const newResult = result as StreamTextResult<
          Record<string, CoreTool<any, any>>,
          string
        >
        return newResult.toDataStreamResponse()
      } else {
        const newResult = result as unknown as GenerateTextResult<
          Record<string, CoreTool<any, any>>,
          string
        >
        return new Response(JSON.stringify({ text: newResult.text }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }
  } catch (error: any) {
    if (NoSuchToolError.isInstance(error)) {
      // handle the no such tool error
      console.log('NoSuchToolError=', error)
    } else if (InvalidToolArgumentsError.isInstance(error)) {
      // handle the invalid tool arguments error
      console.log('InvalidToolArgumentsError=', error)
    } else {
      console.error('Error in AI API call:', error)
      console.error('errorCode=', error.cause.errorCode)
      return new Response(
        JSON.stringify({
          error: error.message,
          errorCode: error.cause.errorCode,
        }),
        {
          status: error.cause.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }
}
