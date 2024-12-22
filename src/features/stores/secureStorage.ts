import { SecureStorage } from '@aparajita/capacitor-secure-storage'
import i18n from '@/lib/i18n'
import homeStore from '@/features/stores/home'

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

type APIKey =
  | 'openaiKey'
  | 'openrouterKey'
  | 'anthropicKey'
  | 'googleKey'
  | 'azureKey'
  | 'groqKey'
  | 'difyKey'
  | 'cohereKey'
  | 'mistralaiKey'
  | 'perplexityKey'
  | 'fireworksKey'
  | 'koeiromapKey'
  | 'youtubeApiKey'
  | 'elevenlabsApiKey'

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

type PromptType = 'systemPrompt'

export const getPrompt = async (key: PromptType): Promise<string> => {
  try {
    const result = await SecureStorage.getItem(key)
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
  return await SecureStorage.setItem(key, value)
}
