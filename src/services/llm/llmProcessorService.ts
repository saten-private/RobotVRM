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
  let isLlmProcessing = false
  let hasSpokeInCurrentRequest = false
  let systemPrompt = ''
  let memoryPromptMaxToken = 1500

  const processActionRequest = async (systemPrompt: string) => {
    if (!isLlmProcessing) {
      console.log(
        'processActionRequest: aborted at start as isProcessing is false.'
      )
      return
    }
    try {
      const ss = settingsStore.getState()

      // Retrieve actions from homeStore
      const hs = homeStore.getState()
      const actionLog = hs.actionLog || []

      const pastBackgroundPrompt = `# My Past Background
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
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `From my past background state above I took the above action. The attached image is my viewpoint at the time of the action. Please output the predictions of my subsequent actions.`,
            },
          ],
        },
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

          homeStore.getState().addToActionLog(action)
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
            homeStore.getState().addToActionLog(action)
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
            homeStore.getState().addToActionLog(action)
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

      if (!isLlmProcessing) {
        console.log(
          'processActionRequest: aborted before LLM stream call as isProcessing is false.'
        )
        return
      }

      let stream
      try {
        stream = await getAIChatResponseStream(
          ss.selectAIService as AIService,
          messages,
          tools,
          20,
          'required'
        )
      } catch (e) {
        console.error(e)
        stream = null
      }

      if (!isLlmProcessing) {
        console.log(
          'processActionRequest: aborted after LLM stream call (or error) as isProcessing is false.'
        )
        // If stream was created and needs explicit cancel, it would be done here.
        // For now, just ensuring no further processing.
        return
      }

      if (stream == null) {
        console.log('stream is null')
        if (isLlmProcessing) {
          processActionRequest(systemPrompt)
        }
        return
      }
      const reader = stream.getReader()
      try {
        while (isLlmProcessing) {
          // Check isProcessing in loop condition
          const { done, value } = await reader.read()
          if (!isLlmProcessing) {
            // Check again after await
            if (!done)
              console.log(
                'processActionRequest: LLM stream reading interrupted by isProcessing flag.'
              )
            break
          }
          console.log('llmProcessorService response=', value)
          if (done) break
        }
      } catch (e) {
        console.error(e)
      } finally {
        reader.releaseLock()
        stream = null
      }

      if (isLlmProcessing) {
        processMemoryRequest(systemPrompt)
      } else {
        console.log(
          'processActionRequest: aborted after stream processing, before calling processMemoryRequest, as isProcessing is false.'
        )
      }
    } catch (error) {
      console.error('Error processing LLM request:', error)
      if (isLlmProcessing) {
        processActionRequest(systemPrompt)
      } else {
        console.log(
          'processActionRequest: error caught, but not retrying as isProcessing is false.'
        )
      }
      // エラー処理（例：エラー状態の設定、エラーイベントの発火など）
      // 例: handleLlmError(error)
    }
  }

  const processMemoryRequest = async (systemPrompt: string) => {
    if (!isLlmProcessing) {
      console.log(
        'processMemoryRequest: aborted at start as isProcessing is false.'
      )
      return
    }
    console.log('processMemoryRequest')

    let endProcess = false

    const pastBackgroundPrompt = `# Past Background
${systemPrompt}`

    let count = 0
    while (!endProcess && isLlmProcessing) {
      // Check isProcessing in loop condition
      const ss = settingsStore.getState()
      const language = i18n.language as Language

      const hs = homeStore.getState()
      const actionLog = hs.actionLog || []

      const pastBackgroundTool = createPastBackgroundTool(async (args) => {
        const { content } = args
        if (!isLlmProcessing) {
          console.log('pastBackgroundTool: aborted as isProcessing is false.')
          return { result: 'aborted' }
        }
        const truncatedContent = await truncateToMaxTokens(
          content,
          ss.selectAIService as AIService,
          memoryPromptMaxToken
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
        if (isLlmProcessing) {
          processActionRequest(truncatedContent)
        } else {
          console.log(
            'pastBackgroundTool: processing was stopped before calling processActionRequest.'
          )
        }
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
              text: pastBackgroundPrompt,
            },
          ],
        },
        ...actionLog,
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `I am a human being. From my past background state above I took the above action. The attached image is my viewpoint at the time of the action. Please update and output my past background to my new background from my new perspective and actions taken above. The output should be organized and expressed in a maximum of ${memoryPromptMaxToken} tokens. Please output my updated new background in some absolute way, even if it is difficult to output.`,
            },
          ],
        },
      ]

      if (!isLlmProcessing) {
        console.log(
          'processMemoryRequest: aborted before LLM stream call as isProcessing is false.'
        )
        break // Exit while loop
      }

      let stream
      try {
        stream = await getAIChatResponseStream(
          ss.selectAIService as AIService,
          messages,
          tools,
          1,
          'required',
          1
        )
      } catch (e) {
        console.error(e)
        stream = null
      }

      if (!isLlmProcessing) {
        console.log(
          'processMemoryRequest: aborted after LLM stream call (or error) as isProcessing is false.'
        )
        // If stream was created and needs explicit cancel, it would be done here.
        break // Exit while loop
      }

      if (stream != null) {
        const reader = stream.getReader()
        try {
          while (isLlmProcessing) {
            // Check isProcessing in loop condition
            const { done, value } = await reader.read()
            if (!isLlmProcessing) {
              // Check again after await
              if (!done)
                console.log(
                  'processMemoryRequest: LLM stream reading interrupted by isProcessing flag.'
                )
              break
            }
            console.log('llmProcessorService response=', value)
            if (done) break
          }
        } catch (e) {
          console.error(e)
        } finally {
          reader.releaseLock()
          stream = null
        }
      }
      if (!isLlmProcessing) {
        // Double check before retry logic
        console.log(
          'processMemoryRequest: loop terminating due to isProcessing false before retry logic.'
        )
        break
      }

      if (!endProcess) {
        count++
        console.log('processMemoryRequest count=', count)
        if (count >= 1) {
          console.log('processMemoryRequest max error count=' + count)
          if (isLlmProcessing) {
            processActionRequest(systemPrompt)
          } else {
            console.log(
              'processMemoryRequest: not retrying action request as isProcessing is false.'
            )
          }
          break
        }
      }
    }
    if (!isLlmProcessing) {
      console.log(
        'processMemoryRequest: exited main while loop as isProcessing is false.'
      )
    }
  }

  // Define function to initialize and start processing
  const initialize = async () => {
    if (isLlmProcessing) {
      console.log(
        'LLM processing already in progress. Ignoring llmStart event.'
      )
      return
    }
    console.log('LLM processing start requested by event.')
    isLlmProcessing = true
    systemPrompt = await getPrompt('systemPrompt')
    if (!isLlmProcessing) {
      // Check if stopped during await getPrompt
      console.log('LLM initialization aborted as processing was stopped.')
      return
    }
    processActionRequest(systemPrompt)
  }

  // Define function to stop processing
  const terminate = () => {
    if (!isLlmProcessing) {
      console.log('LLM processing already stopped. Ignoring llmStop event.')
      return
    }
    console.log('LLM processing stop requested by event.')
    isLlmProcessing = false
  }

  // イベントリスナーを登録し、クリーンアップ関数を取得
  const unsubscribeStart = appEventEmitter.on('llmStart', initialize)
  const unsubscribeStop = appEventEmitter.on('llmStop', terminate)

  // クリーンアップ関数を返す
  return () => {
    unsubscribeStart()
    unsubscribeStop()
    isLlmProcessing = false // Ensure flag is false on cleanup
    console.log('LLM processor event listeners removed and processing stopped.')
  }
}
