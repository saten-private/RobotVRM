import { SecureStorage } from '@aparajita/capacitor-secure-storage'
import i18n from '@/lib/i18n'
import homeStore from '@/features/stores/home'
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()
export const multiModalAIServices = [
  'openai',
  'openrouter',
  'anthropic',
  'google',
  'azure',
] as const
export type multiModalAIServiceKey = (typeof multiModalAIServices)[number]

type multiModalAPIKeys = {
  [K in multiModalAIServiceKey as `${K}Key`]: string
}

export const hasAPIKeyAIServices = [
  'openai',
  'openrouter',
  'anthropic',
  'google',
  'azure',
  'groq',
  'dify',
  'cohere',
  'mistralai',
  'perplexity',
  'fireworks',
  'koeiromap',
  'youtubeApi',
  'elevenlabsApi',
] as const
export type hasAPIKeyAIServiceKey = (typeof hasAPIKeyAIServices)[number]

type APIKeys = {
  [K in hasAPIKeyAIServiceKey as `${K}Key`]: string
}

type APIKey = keyof APIKeys

export const getAPIKey = async (key: APIKey): Promise<string> => {
  try {
    const result = await SecureStorage.getItem(key)
    if (result) {
      return result
    }
    switch (key) {
      case 'koeiromapKey':
        return process.env.NEXT_PUBLIC_ROBOTVRM_KOEIROMAP_KEY ?? ''
      case 'youtubeApiKey':
        return process.env.NEXT_PUBLIC_YOUTUBE_API_KEY ?? ''
      default:
        break
    }
    return ''
  } catch (error) {
    console.error('getAPIKey error', error)
    return ''
  }
}

export const setAPIKey = async (key: APIKey, value: string) => {
  const result = await SecureStorage.setItem(key, value)
  homeStore.setState({ validateApiKey: true })
  return result
}

export const promptTypes = ['systemPrompt'] as const
export type PromptType = (typeof promptTypes)[number]

export const getPrompt = async (key: PromptType): Promise<string> => {
  try {
    const result = await SecureStorage.getItem(
      `${publicRuntimeConfig.appId}-${key}`
    )
    if (result) {
      return result
    }
    switch (key) {
      case 'systemPrompt':
        return i18n.t('SystemPrompt')
      default:
        break
    }
    return ''
  } catch (error) {
    console.error('getPrompt error', error)
    return ''
  }
}

export const setPrompt = async (key: PromptType, value: string) => {
  return await SecureStorage.setItem(
    `${publicRuntimeConfig.appId}-${key}`,
    value
  )
}

export const clearThisRobotVRM = async () => {
  // Delete all API keys from secure storage
  const apiKeys = hasAPIKeyAIServices.map(
    (service) => `${service}Key` as APIKey
  )
  for (const key of apiKeys) {
    await SecureStorage.removeItem(key)
  }
  for (const key of promptTypes) {
    await SecureStorage.removeItem(`${publicRuntimeConfig.appId}-${key}`)
  }
  homeStore.setState({ validateApiKey: true })
}
