import { Message } from '../messages/messages'
import settingsStore from '@/features/stores/settings'
import i18next from 'i18next'
import { getVercelAIChatResponseImplemention } from './vercelAIChatImplementation'
import { CoreTool, StreamTextResult } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createCohere } from '@ai-sdk/cohere'
import { createMistral } from '@ai-sdk/mistral'
import { createAzure } from '@ai-sdk/azure'

type AIServiceKey =
  | 'openai'
  | 'openrouter'
  | 'anthropic'
  | 'azure'
  | 'groq'
  | 'cohere'
  | 'mistralai'
  | 'perplexity'
  | 'fireworks'

type AIServiceConfig = Record<AIServiceKey, () => any>

function handleApiError(errorCode: string): string {
  const languageCode = settingsStore.getState().selectLanguage
  i18next.changeLanguage(languageCode)
  return i18next.t(`Errors.${errorCode || 'AIAPIError'}`)
}

export async function getVercelAIChatResponse(
  messages: Message[],
  apiKey: string,
  aiService: string,
  model: string,
  tools: Record<string, CoreTool> | undefined,
  maxSteps: number | undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined
) {
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

    const text = getVercelAIChatResponseImplemention(
      messages,
      aiServiceInstance,
      aiService,
      model,
      false,
      tools,
      maxSteps,
      toolChoice
    )
    return { text: text }
  } catch (error: any) {
    console.error(`Error fetching ${aiService} API response:`, error)
    return { text: handleApiError(error.cause.errorCode) }
  }
}

export async function getVercelAIChatResponseStream(
  messages: Message[],
  apiKey: string,
  aiService: string,
  model: string,
  tools: Record<string, CoreTool> | undefined,
  maxSteps: number | undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined
): Promise<ReadableStream<string>> {
  return new ReadableStream({
    async start(controller) {
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

        const result = await getVercelAIChatResponseImplemention(
          messages,
          aiServiceInstance,
          aiService,
          model,
          true,
          tools,
          maxSteps,
          toolChoice
        )

        if (!result) {
          throw new Error(`API response from ${aiService} is empty`)
        }

        const newResult = result as StreamTextResult<
          Record<string, CoreTool<any, any>>
        >

        for await (const value of newResult.textStream) {
          controller.enqueue(value)
        }
      } catch (error: any) {
        console.error('getVercelAIChatResponseStream error', error)
        const errorMessage = handleApiError(error.cause.errorCode)
        controller.enqueue(errorMessage)
      } finally {
        controller.close()
      }
    },
  })
}
