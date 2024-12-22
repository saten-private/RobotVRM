import { Message } from '../messages/messages'
import settingsStore from '@/features/stores/settings'
import i18next from 'i18next'
import { CoreTool } from 'ai'
import i18n from '@/lib/i18n'

function handleApiError(errorCode: string): string {
  const languageCode = settingsStore.getState().selectLanguage
  i18next.changeLanguage(languageCode)
  return i18next.t(`Errors.${errorCode || 'AIAPIError'}`)
}

export async function getVercelAIChatResponseServer(
  isMiddleware: boolean,
  messages: Message[],
  apiKey: string,
  aiService: string,
  model: string,
  tools: Record<string, CoreTool<any, any>> | undefined,
  maxSteps: number | undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined
) {
  try {
    const response = await fetch(
      isMiddleware ? '/api/aiChat' : '/api/aiChatServer',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          apiKey,
          aiService,
          model,
          stream: false,
          tools,
          maxSteps,
          toolChoice,
          language: i18n.language,
        }),
      }
    )

    if (!response.ok) {
      const responseBody = await response.json()
      throw new Error(
        `API request to ${aiService} failed with status ${response.status} and body ${responseBody.error}`,
        { cause: { errorCode: responseBody.errorCode } }
      )
    }

    const data = await response.json()
    return { text: data.text }
  } catch (error: any) {
    console.error(`Error fetching ${aiService} API response:`, error)
    return { text: handleApiError(error.cause.errorCode) }
  }
}

export async function getVercelAIChatResponseServerStream(
  isMiddleware: boolean,
  messages: Message[],
  apiKey: string,
  aiService: string,
  model: string,
  tools: Record<string, CoreTool<any, any>> | undefined,
  maxSteps: number | undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined
): Promise<ReadableStream<string>> {
  const response = await fetch(
    isMiddleware ? '/api/aiChat' : '/api/aiChatServer',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        apiKey,
        aiService,
        model,
        stream: true,
        tools,
        maxSteps,
        toolChoice,
        language: i18n.language,
      }),
    }
  )

  try {
    if (!response.ok) {
      const responseBody = await response.json()
      console.log(responseBody)
      throw new Error(
        `API request to ${aiService} failed with status ${response.status} and body ${responseBody.error}`,
        { cause: { errorCode: responseBody.errorCode } }
      )
    }

    console.log('response=', response)

    return new ReadableStream({
      async start(controller) {
        console.log('response.body=', response.body)
        if (!response.body) {
          throw new Error(
            `API response from ${aiService} is empty, status ${response.status}`,
            { cause: { errorCode: 'AIAPIError' } }
          )
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        try {
          while (true) {
            console.log('response while true')
            const { done, value } = await reader.read()
            console.log('response done=', done)
            console.log('response value=', value)
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              console.log('line=', line)
              if (line.startsWith('0:')) {
                const content = line.substring(2).trim()
                const decodedContent = JSON.parse(content)
                console.log('decodedContent=', decodedContent)
                if (tools) {
                  const { toolName, args } = decodedContent
                  console.log('toolName=', toolName)
                  console.log('arg=', args)
                  if (tools[toolName]) {
                    const coreTool = tools[toolName] as CoreTool<any, any>
                    if (coreTool.execute) {
                      coreTool.execute(args)
                    }
                  }
                } else {
                  controller.enqueue(decodedContent)
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching ${aiService} API response:`, error)

          return new ReadableStream({
            start(controller) {
              const errorMessage = handleApiError('AIAPIError')
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
    const errorMessage = handleApiError(error.cause.errorCode)
    return new ReadableStream({
      start(controller) {
        controller.enqueue(errorMessage)
        controller.close()
      },
    })
  }
}
