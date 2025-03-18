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
  createPastBackgroundTool,
} from '@/features/tool/tool'
import { processSpeakContent } from '@/features/chat/handlers'
import { sendDataBle } from '@/services/bluetooth/bluetoothLeService'
import { getPrompt, setPrompt } from '@/features/stores/secureStorage'
import i18n from '@/lib/i18n'
import { truncateToMaxTokens } from '@/utils/maxToken'

export const startLlmProcessor = (): (() => void) => {
  let isProcessing = false
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

        try {
          let isEmotioned = false

          const hs = homeStore.getState()
          switch (emotion) {
            case toolPrompt(i18n.language as Language).Emotion.Normal:
              hs.viewer.model?.expression('neutral')
              isEmotioned = true
              break
            case toolPrompt(i18n.language as Language).Emotion.Joy:
              hs.viewer.model?.expression('happy')
              isEmotioned = true
              break
            case toolPrompt(i18n.language as Language).Emotion.Anger:
              hs.viewer.model?.expression('angry')
              isEmotioned = true
              break
            case toolPrompt(i18n.language as Language).Emotion.Sadness:
              hs.viewer.model?.expression('sad')
              isEmotioned = true
              break
            case toolPrompt(i18n.language as Language).Emotion.Calmness:
              hs.viewer.model?.expression('relaxed')
              isEmotioned = true
              break
            default:
              console.log('Invalid emotion:', emotion)
              break
          }

          if (!isEmotioned) {
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
          }

          return { result: 'success' }
        } catch (error) {
          console.error('Error expressing emotion', error)
          return { result: 'error', error: error }
        }
      }, language)

      const movementTool = createMovementTool(async (args) => {
        const { direction } = args
        console.log('execute movement direction=', direction)

        try {
          let isMoved = false

          switch (direction) {
            case toolPrompt(i18n.language as Language).Direction.Forward:
              await sendDataBle('M')
              isMoved = true
              break
            case toolPrompt(i18n.language as Language).Direction.Left:
              await sendDataBle('L')
              isMoved = true
              break
            case toolPrompt(i18n.language as Language).Direction.Right:
              await sendDataBle('R')
              isMoved = true
              break
            case toolPrompt(i18n.language as Language).Direction.Back:
              await sendDataBle('B')
              isMoved = true
              break
            default:
              console.log('Invalid direction:', direction)
              break
          }

          if (!isMoved) {
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
      processActionRequest(systemPrompt)
      console.error('Error processing LLM request:', error)
      // エラー処理（例：エラー状態の設定、エラーイベントの発火など）
      // 例: handleLlmError(error)
    }
  }

  const processMemoryRequest = async (systemPrompt: string) => {
    try {
      console.log('processMemoryRequest')

      let endProcess = false

      const ss = settingsStore.getState()
      const pastBackgroundPrompt = `# Past Background
${systemPrompt}`

      const language = i18n.language as Language

      const hs = homeStore.getState()
      const actionLog = hs.actionLog || []

      const pastBackgroundTool = createPastBackgroundTool((args) => {
        const { content } = args
        const truncatedContent = truncateToMaxTokens(
          content,
          ss.selectAIService as AIService,
          3500
        )

        console.log(
          'execute pastBackground truncatedContent=',
          truncatedContent
        )

        setPrompt('systemPrompt', truncatedContent)
        // clear actionLog
        homeStore.setState((state) => ({
          actionLog: [],
        }))
        endProcess = true
        processActionRequest(truncatedContent)
        return { result: 'success' }
      }, language)

      const tools = {
        past_background: pastBackgroundTool,
      }

      // メッセージの作成
      const messages: Action[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are a human being. From the following past background conditions, you have taken the following actions. The attached image is the viewpoint at the time of the action. Please update this human's past background to the new background from the following newly viewed perspective and actions taken. The updated background should be represented by a maximum of 3500 tokens.`,
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

      let count = 0
      while (!endProcess) {
        const response = await getAIChatResponse(
          ss.selectAIService as AIService,
          messages,
          tools,
          1,
          'required'
        )
        console.log('processMemoryRequest response.text=', response.text)
        if (!endProcess) {
          count++
          console.log('processMemoryRequest count=', count)
          if (count > 10) {
            throw new Error(
              'processMemoryRequest max error count=' +
                count +
                ' response.text=' +
                response.text
            )
          }
        }
      }
    } catch (e) {
      console.error('processMemoryRequest error=', e)
      processMemoryRequest(systemPrompt)
    }
  }

  // Define function to initialize and start processing
  const initialize = async () => {
    if (isProcessing) {
      return
    }
    isProcessing = true
    systemPrompt = await getPrompt('systemPrompt')
    processActionRequest(systemPrompt)
  }

  // イベントリスナーを登録し、クリーンアップ関数を取得
  const unsubscribe = appEventEmitter.on('llmRequest', initialize)

  // クリーンアップ関数を返す
  return unsubscribe
}
