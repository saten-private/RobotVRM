import { Message } from '@/features/messages/messages'
import { streamText, generateText, CoreMessage, CoreTool } from 'ai'

export async function getVercelAIChatResponseImplemention(
  messages: Message[],
  aiServiceInstance: any,
  aiService: string,
  model: string,
  stream: boolean,
  tools: Record<string, CoreTool> | undefined,
  maxSteps: number | undefined,
  toolChoice: 'auto' | 'none' | 'required' | undefined
) {
  const instance = aiServiceInstance()
  const modifiedMessages: Message[] = modifyMessages(aiService, messages)
  let modifiedModel = model
  if (aiService === 'azure') {
    modifiedModel =
      model.match(/\/deployments\/(.+?)\/completions/)?.[1] || model
  }

  if (stream) {
    try {
      const result = await streamText({
        model: instance(modifiedModel),
        messages: modifiedMessages as CoreMessage[],
        tools: tools,
        maxSteps: maxSteps,
        onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
          // console.log('onStepFinish stream=true')
          // console.log('text=', text)
          // console.log('toolCalls=', toolCalls)
          // console.log('toolResults=', toolResults)
          // console.log('finishReason=', finishReason)
          // console.log('usage=', usage)
        },
        toolChoice: toolChoice,
        headers: {
          'anthropic-dangerous-direct-browser-access': 'true', // Anthropicのブラウザからの直接アクセスを許可 https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/
        },
      })
      return result
    } catch (error: any) {
      console.error('Error in streamText:', error)
      throw new Error(error.message, {
        cause: { errorCode: 'AIAPIError', status: 500 },
      })
    }
  } else {
    try {
      const result = await generateText({
        model: instance(model),
        messages: modifiedMessages as CoreMessage[],
        tools: tools,
        maxSteps: maxSteps,
        onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
          console.log('onStepFinish stream=false')
          console.log('text=', text)
          console.log('toolCalls=', toolCalls)
          console.log('toolResults=', toolResults)
          console.log('finishReason=', finishReason)
          console.log('usage=', usage)
        },
        toolChoice: toolChoice,
        headers: {
          'anthropic-dangerous-direct-browser-access': 'true', // Anthropicのブラウザからの直接アクセスを許可 https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/
        },
      })

      return result
    } catch (error: any) {
      console.error('Error in generateText:', error)
      throw new Error(error.message, {
        cause: { errorCode: 'AIAPIError', status: 500 },
      })
    }
  }
}

function modifyMessages(aiService: string, messages: Message[]): Message[] {
  if (aiService === 'anthropic' || aiService === 'perplexity') {
    return modifyAnthropicMessages(messages)
  }
  return messages
}

// Anthropicのメッセージを修正する
function modifyAnthropicMessages(messages: Message[]): Message[] {
  const systemMessage: Message | undefined = messages.find(
    (message) => message.role === 'system'
  )
  let userMessages = messages
    .filter((message) => message.role !== 'system')
    .filter((message) => message.content !== '')

  userMessages = consolidateMessages(userMessages)

  while (userMessages.length > 0 && userMessages[0].role !== 'user') {
    userMessages.shift()
  }

  const result: Message[] = systemMessage
    ? [systemMessage, ...userMessages]
    : userMessages
  return result
}

// 同じroleのメッセージを結合する
function consolidateMessages(messages: Message[]) {
  const consolidated: Message[] = []
  let lastRole: string | null = null
  let combinedContent:
    | string
    | ({ type: 'text'; text: string } | { type: 'image'; image: string })[]

  messages.forEach((message, index) => {
    if (message.role === lastRole) {
      if (typeof combinedContent === 'string') {
        combinedContent += '\n' + message.content
      } else if (
        Array.isArray(combinedContent) &&
        combinedContent.length > 0 &&
        'text' in combinedContent[0]
      ) {
        combinedContent[0].text += '\n' + message.content
      }
    } else {
      if (lastRole !== null) {
        consolidated.push({ role: lastRole, content: combinedContent })
      }
      lastRole = message.role
      combinedContent = message.content
    }

    if (index === messages.length - 1) {
      consolidated.push({ role: lastRole, content: combinedContent })
    }
  })

  return consolidated
}
