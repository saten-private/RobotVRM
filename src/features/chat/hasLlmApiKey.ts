import { getAPIKey } from '@/features/stores/secureStorage'
import settingsStore from '@/features/stores/settings'
import homeStore from '@/features/stores/home'

export async function hasLlmApiKey(): Promise<boolean> {
  homeStore.setState({ validateApiKey: false })
  const selectAIService = settingsStore.getState().selectAIService
  switch (selectAIService) {
    case 'openai':
    case 'openrouter':
    case 'anthropic':
    case 'azure':
    case 'groq':
    case 'cohere':
    case 'mistralai':
    case 'perplexity':
    case 'fireworks':
    case 'google':
      try {
        const apiKey = await getAPIKey(`${selectAIService}Key`)
        const envKey =
          process.env[`NEXT_PUBLIC_${selectAIService.toUpperCase()}_KEY`]
        return !!(apiKey || envKey)
      } catch (error) {
        console.error('Failed to check API key:', error)
        return false
      }
    case 'googleVertexAI':
      return true
    default:
      console.error(`Unsupported AI service: ${selectAIService}`)
      return false
  }
}
