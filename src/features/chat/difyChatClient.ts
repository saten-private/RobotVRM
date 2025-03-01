import settingsStore from '@/features/stores/settings'
import { Action } from '../messages/messages'
import { getDifyChatResponseImplemention } from './difyChatClientImplementation'

export async function getDifyChatResponseStream(
  messages: Action[],
  apiKey: string,
  url: string,
  conversationId: string
): Promise<ReadableStream<string>> {
  const response = await getDifyChatResponseImplemention(
    messages[messages.length - 1].content as string,
    apiKey,
    url,
    conversationId,
    true
  )

  try {
    if (!response.ok) {
      const responseBody = await response.json()
      throw new Error(
        `API request to Dify failed with status ${response.status} and body ${responseBody.error}`,
        { cause: { errorCode: responseBody.errorCode } }
      )
    }

    return new ReadableStream({
      async start(controller) {
        if (!response.body) {
          throw new Error('API response from Dify is empty', {
            cause: { errorCode: 'AIAPIError' },
          })
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const textChunk = decoder.decode(value, { stream: true })
            const messages = textChunk
              .split('\n')
              .filter((line) => line.startsWith('data:'))
            messages.forEach((message) => {
              const data = JSON.parse(message.slice(5)) // Remove 'data:' prefix
              if (data.event === 'agent_message' || data.event === 'message') {
                controller.enqueue(data.answer)
                settingsStore.setState({
                  difyConversationId: data.conversation_id,
                })
              }
            })
          }
        } catch (error) {
          console.error(`Error fetching Dify API response:`, error)

          return new ReadableStream({
            start(controller) {
              const errorMessage = error
              controller.enqueue(errorMessage)
              controller.close()
            },
          })
        } finally {
          controller.close()
          reader.releaseLock()
        }
      },
    })
  } catch (error: any) {
    const errorMessage = error
    return new ReadableStream({
      start(controller) {
        controller.enqueue(errorMessage)
        controller.close()
      },
    })
  }
}
