import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import {
  getAIChatResponseStream,
  getAIChatResponse,
} from '@/features/chat/aiChatFactory'
import { AIService } from '@/features/constants/settings'
import { Action } from '@/features/tool/action'
import { appEventEmitter } from '@/utils/eventEmitter'
import { isConnectedBle } from '@/services/bluetooth/bluetoothLeService'
import {
  Language,
  toolPrompt,
  createSpeakTool,
  createExpressingEmotionTool,
  createMovementTool,
} from '@/features/tool/tool'
import { processSpeakContent } from '@/features/chat/handlers'
import { sendDataBle } from '@/services/bluetooth/bluetoothLeService'
import { getPrompt, setPrompt } from '@/features/stores/secureStorage'
import i18n from '@/lib/i18n'

export const startLlmProcessor = (): (() => void) => {
  let hasSpokeInCurrentRequest = false
  let systemPrompt = ''

  const processActionRequest = async (systemPrompt: string) => {
    try {
      const ss = settingsStore.getState()

      // Retrieve actions from homeStore
      const hs = homeStore.getState()
      const actionLog = hs.actionLog || []

      const pastBackgroundPrompt = `# Past Background
${systemPrompt}`

      // メッセージの作成
      const messages: Action[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: pastBackgroundPrompt,
            },
          ],
        },
        // Add remaining actions from homeStore actionLog
        ...actionLog,
      ]

      console.log('message count=', messages.length)

      const language = i18n.language as Language

      const speakTool = createSpeakTool((args) => {
        const { content } = args
        console.log('execute speak content=', content)
        console.log(
          'processSpeakContent hasSpokeInCurrentRequest=',
          hasSpokeInCurrentRequest
        )
        if (!hasSpokeInCurrentRequest) {
          const result = `${toolPrompt(language).Speak}
\`\`\`
${content}
\`\`\``
          const action: Action = {
            role: 'user',
            content: [{ type: 'text', text: result }],
          }

          homeStore.setState((state) => ({
            actionLog: [...state.actionLog, action],
          }))
          processSpeakContent(content)
          hasSpokeInCurrentRequest = true
          return { result: 'success' }
        }
      }, language)

      const expressingEmotionTool = createExpressingEmotionTool((args) => {
        const { emotion } = args
        console.log('execute expressing_emotion emotion=', emotion)

        const result = `${toolPrompt(language).ExpressingEmotion}
\`\`\`
${emotion}
\`\`\``
        const action: Action = {
          role: 'user',
          content: [{ type: 'text', text: result }],
        }
        homeStore.setState((state) => ({
          actionLog: [...state.actionLog, action],
        }))

        const hs = homeStore.getState()
        switch (emotion) {
          case toolPrompt(i18n.language as Language).Emotion.Normal:
            hs.viewer.model?.expression('neutral')
            break
          case toolPrompt(i18n.language as Language).Emotion.Joy:
            hs.viewer.model?.expression('happy')
            break
          case toolPrompt(i18n.language as Language).Emotion.Anger:
            hs.viewer.model?.expression('angry')
            break
          case toolPrompt(i18n.language as Language).Emotion.Sadness:
            hs.viewer.model?.expression('sad')
            break
          case toolPrompt(i18n.language as Language).Emotion.Calmness:
            hs.viewer.model?.expression('relaxed')
            break
        }
        return { result: 'success' }
      }, language)

      const movementTool = createMovementTool(async (args) => {
        const { direction } = args
        console.log('execute movement direction=', direction)

        const result = `${toolPrompt(language).Movement}
        \`\`\`
        ${direction}
        \`\`\``
        const action: Action = {
          role: 'user',
          content: [{ type: 'text', text: result }],
        }
        homeStore.setState((state) => ({
          actionLog: [...state.actionLog, action],
        }))

        try {
          switch (direction) {
            case toolPrompt(i18n.language as Language).Direction.Forward:
              await sendDataBle('M')
              break
            case toolPrompt(i18n.language as Language).Direction.Left:
              await sendDataBle('L')
              break
            case toolPrompt(i18n.language as Language).Direction.Right:
              await sendDataBle('R')
              break
            case toolPrompt(i18n.language as Language).Direction.Back:
              await sendDataBle('B')
              break
          }
          return { result: 'success' }
        } catch (error) {
          console.error('Error sending data', error)
          return { result: 'error', error: error }
        }
      }, language)

      let tools
      if (isConnectedBle()) {
        console.log('isConnectedBle true')
        tools = {
          movement: movementTool,
          speak: speakTool,
          expressing_emotion: expressingEmotionTool,
        }
      } else {
        console.log('isConnectedBle false')
        tools = {
          speak: speakTool,
          expressing_emotion: expressingEmotionTool,
        }
      }

      console.log('messages', messages)

      // LLMのリクエスト時にhasSpokeInCurrentRequestをfalseにする
      console.log(
        'processSpeakContent request hasSpokeInCurrentRequest=',
        hasSpokeInCurrentRequest
      )
      hasSpokeInCurrentRequest = false

      let stream
      try {
        stream = await getAIChatResponseStream(
          ss.selectAIService as AIService,
          messages,
          tools,
          5,
          'required'
        )
      } catch (e) {
        console.error(e)
        stream = null
      }
      if (stream == null) {
        console.log('stream is null')
        return
      }
      const reader = stream.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          console.log('llmProcessorService response=', value)
          if (done) break
        }
      } catch (e) {
        console.error(e)
      } finally {
        reader.releaseLock()
        stream = null
      }
      processMemoryRequest(systemPrompt)
    } catch (error) {
      console.error('Error processing LLM request:', error)
      // エラー処理（例：エラー状態の設定、エラーイベントの発火など）
      // 例: handleLlmError(error)
    }
  }

  const processMemoryRequest = async (systemPrompt: string) => {
    console.log('processMemoryRequest')

    const ss = settingsStore.getState()
    const pastBackgroundPrompt = `# Past Background
${systemPrompt}`

    const hs = homeStore.getState()
    const actionLog = hs.actionLog || []

    // メッセージの作成
    const messages: Action[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'You are a robot. You have performed the following actions in the following past background. The attached image shows your point of view at that time. Please create a new background of this robot within 100K tokens.',
          },
        ],
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: pastBackgroundPrompt,
          },
        ],
      },
      ...actionLog,
    ]

    try {
      const response = await getAIChatResponse(
        ss.selectAIService as AIService,
        messages
      )
      console.log('systemPrompt=', response.text)
      setPrompt('systemPrompt', response.text)
      processActionRequest(response.text)
    } catch (e) {
      console.error(e)
    }
  }

  // Define function to initialize and start processing
  const initialize = async () => {
    systemPrompt = await getPrompt('systemPrompt')
    // Now register event listener with the loaded prompt
    processActionRequest(systemPrompt)

    // const unsubscribe = appEventEmitter.on('llmRequest', () =>
    //   processActionRequest(systemPrompt)
    // )
    // return unsubscribe
  }

  // Start initialization
  initialize()

  // Return cleanup function
  return () => {} // Empty function to satisfy the return type
}
