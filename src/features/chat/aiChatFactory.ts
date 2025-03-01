import { Action } from '@/features/messages/messages'
import { AIService } from '@/features/constants/settings'
import { getLocalLLMChatResponseStream } from './localLLMChat'
import { getDifyChatResponseStream } from './difyChatClient'
import { getDifyChatResponseMiddlewareStream } from './difyChat'
import { getVercelAIChatResponse } from './vercelAIChatClient'
import { getVercelAIChatResponseStream } from './vercelAIChatClient'
import { getVercelAIChatResponseServer } from './vercelAIChatServer'
import { getVercelAIChatResponseServerStream } from './vercelAIChatServer'
import settingsStore from '@/features/stores/settings'
import { CoreTool } from 'ai'
import { getAPIKey } from '@/features/stores/secureStorage'

export async function getAIChatResponseStream(
  service: AIService,
  messages: Action[],
  tools: Record<string, CoreTool> | undefined = undefined,
  maxSteps: number | undefined = undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined = undefined
): Promise<ReadableStream<string> | null> {
  const NEXT_PUBLIC_ROBOTVRM_USE_SERVER =
    process.env.NEXT_PUBLIC_ROBOTVRM_USE_SERVER === 'true'
  const ss = settingsStore.getState()

  switch (service) {
    case 'openai':
    case 'anthropic':
    case 'azure':
    case 'groq':
    case 'cohere':
    case 'mistralai':
    case 'perplexity':
    case 'fireworks':
      if (NEXT_PUBLIC_ROBOTVRM_USE_SERVER) {
        console.log('use middleware')
        return getVercelAIChatResponseServerStream(
          true,
          messages,
          (await getAPIKey(`${service}Key`)) ||
            process.env[`NEXT_PUBLIC_${service.toUpperCase()}_KEY`] ||
            '',
          service,
          ss.selectAIModel,
          tools,
          maxSteps,
          toolChoice
        )
      } else {
        console.log('use client')
        return getVercelAIChatResponseStream(
          messages,
          (await getAPIKey(`${service}Key`)) ||
            process.env[`NEXT_PUBLIC_${service.toUpperCase()}_KEY`] ||
            '',
          service,
          ss.selectAIModel,
          tools,
          maxSteps,
          toolChoice
        )
      }
    case 'openrouter':
    case 'google':
      console.log('use middleware')
      return getVercelAIChatResponseServerStream(
        true,
        messages,
        (await getAPIKey(`${service}Key`)) ||
          process.env[`NEXT_PUBLIC_${service.toUpperCase()}_KEY`] ||
          '',
        service,
        ss.selectAIModel,
        tools,
        maxSteps,
        toolChoice
      )
    case 'googleVertexAI':
      console.log('use server')
      return getVercelAIChatResponseServerStream(
        false,
        messages,
        '',
        service,
        ss.selectAIModel,
        tools,
        maxSteps,
        toolChoice
      )
    case 'localLlm':
      return getLocalLLMChatResponseStream(
        messages,
        ss.localLlmUrl,
        ss.selectAIModel
      )
    case 'dify':
      if (NEXT_PUBLIC_ROBOTVRM_USE_SERVER) {
        return getDifyChatResponseMiddlewareStream(
          messages,
          (await getAPIKey('difyKey')) || '',
          ss.difyUrl || '',
          ss.difyConversationId
        )
      } else {
        return getDifyChatResponseStream(
          messages,
          (await getAPIKey('difyKey')) || '',
          ss.difyUrl || '',
          ss.difyConversationId
        )
      }
    default:
      throw new Error(`Unsupported AI service: ${service}`)
  }
}

export async function getAIChatResponse(
  service: AIService,
  messages: Action[],
  tools: Record<string, CoreTool> | undefined = undefined,
  maxSteps: number | undefined = undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined = undefined
): Promise<{ text: any }> {
  const NEXT_PUBLIC_ROBOTVRM_USE_SERVER =
    process.env.NEXT_PUBLIC_ROBOTVRM_USE_SERVER === 'true'
  const ss = settingsStore.getState()

  switch (service) {
    case 'openai':
    case 'anthropic':
    case 'azure':
    case 'groq':
    case 'cohere':
    case 'mistralai':
    case 'perplexity':
    case 'fireworks':
      if (NEXT_PUBLIC_ROBOTVRM_USE_SERVER) {
        console.log('use middleware')
        return getVercelAIChatResponseServer(
          true,
          messages,
          (await getAPIKey(`${service}Key`)) ||
            process.env[`NEXT_PUBLIC_${service.toUpperCase()}_KEY`] ||
            '',
          service,
          ss.selectAIModel,
          tools,
          maxSteps,
          toolChoice
        )
      } else {
        console.log('use client')
        return getVercelAIChatResponse(
          messages,
          (await getAPIKey(`${service}Key`)) ||
            process.env[`NEXT_PUBLIC_${service.toUpperCase()}_KEY`] ||
            '',
          service,
          ss.selectAIModel,
          tools,
          maxSteps,
          toolChoice
        )
      }
    case 'openrouter':
    case 'google':
      console.log('use middleware')
      return getVercelAIChatResponseServer(
        true,
        messages,
        (await getAPIKey(`${service}Key`)) ||
          process.env[`NEXT_PUBLIC_${service.toUpperCase()}_KEY`] ||
          '',
        service,
        ss.selectAIModel,
        tools,
        maxSteps,
        toolChoice
      )
    case 'googleVertexAI':
      return getVercelAIChatResponseServer(
        false,
        messages,
        '',
        service,
        ss.selectAIModel,
        tools,
        maxSteps,
        toolChoice
      )
    default:
      throw new Error(`Unsupported AI service: ${service}`)
  }
}
