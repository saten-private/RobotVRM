import { Action } from '@/features/tool/action'
import settingsStore from '@/features/stores/settings'
import i18next from 'i18next'
import { CoreTool } from 'ai'
import i18n from '@/lib/i18n'
import { ZodObject, ZodString, ZodTypeAny, ZodEnum } from 'zod'
import { ToolName } from '../tool/tool'

function handleApiError(errorCode: string): string {
  const languageCode = settingsStore.getState().selectLanguage
  i18next.changeLanguage(languageCode)
  return i18next.t(`Errors.${errorCode || 'AIAPIError'}`)
}

export async function getVercelAIChatResponseServer(
  isMiddleware: boolean,
  messages: Action[],
  apiKey: string,
  aiService: string,
  model: string,
  tools: Record<string, CoreTool<any, any>> | undefined,
  maxSteps: number | undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined,
  temperature: number | undefined
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
          temperature,
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
  messages: Action[],
  apiKey: string,
  aiService: string,
  model: string,
  tools: Record<ToolName, CoreTool<any, any>> | undefined,
  maxSteps: number | undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined,
  temperature: number | undefined
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
        temperature,
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
                  const toolTypeName = toolName as ToolName
                  console.log('toolName=', toolName)
                  console.log('arg=', args)
                  if (tools[toolTypeName]) {
                    switch (toolTypeName) {
                      case 'speak':
                        const speakTool = tools[toolTypeName] as CoreTool<
                          ZodObject<
                            {
                              content: ZodString
                            },
                            'strip',
                            ZodTypeAny,
                            {
                              content: string
                            },
                            {
                              content: string
                            }
                          >,
                          any
                        > & {
                          execute: (args: {
                            content: string
                          }) => PromiseLike<any>
                        }
                        if (speakTool.execute) {
                          speakTool.execute(args)
                        }
                        break
                      case 'expressing_emotion':
                        const expressingEmotionTool = tools[
                          toolTypeName
                        ] as CoreTool<
                          ZodObject<
                            {
                              emotion: ZodEnum<
                                [string, string, string, string, string]
                              >
                            },
                            'strip',
                            ZodTypeAny,
                            {
                              emotion: string
                            },
                            {
                              emotion: string
                            }
                          >,
                          any
                        > & {
                          execute: (args: {
                            emotion: string
                          }) => PromiseLike<any>
                        }
                        if (expressingEmotionTool.execute) {
                          expressingEmotionTool.execute(args)
                        }
                        break
                      case 'movement':
                        const movementTool = tools[toolTypeName] as CoreTool<
                          ZodObject<
                            {
                              direction: ZodEnum<
                                [string, string, string, string]
                              >
                            },
                            'strip',
                            ZodTypeAny,
                            {
                              direction: string
                            },
                            {
                              direction: string
                            }
                          >,
                          any
                        > & {
                          execute: (args: {
                            direction: string
                          }) => PromiseLike<any>
                        }
                        if (movementTool.execute) {
                          movementTool.execute(args)
                        }
                        break
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
