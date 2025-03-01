import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import { useCaptureStore } from '@/features/stores/capture'
import { getAIChatResponseStream } from '@/features/chat/aiChatFactory'
import { AIService } from '@/features/constants/settings'
import { Action } from '@/features/messages/messages'
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
import { getPrompt } from '@/features/stores/secureStorage'
import i18n from '@/lib/i18n'

export const startLlmProcessor = (): (() => void) => {
  let hasSpokeInCurrentRequest = false

  const processLlmRequest = async () => {
    try {
      const ss = settingsStore.getState()
      let systemPrompt = await getPrompt('systemPrompt')

      // キャプチャした画像をBase64形式で取得
      const captures = useCaptureStore.getState().captures // captureStoreから直接状態を取得

      if (captures.length === 0) {
        console.log('captures.length === 0')
        return
      }

      // キャプチャした画像をBase64形式で取得
      const imageData = captures.map((capture) => capture.data)
      // LLMは古い画像から新しい画像の順番で時系列を認識するようなため、取得したキューの順番を逆にする
      // 参考:https://cookbook.openai.com/examples/gpt4o/introduction_to_gpt4o#video-processing
      const imageDataForLLM = imageData.reverse()

      // メッセージの作成
      const messages: Action[] = [
        {
          role: 'system',
          content: systemPrompt, // システムプロンプトは文字列
        },
        {
          role: 'user',
          content: [
            ...imageDataForLLM.map((image: string) => ({
              type: 'image' as const,
              image: image,
            })),
          ],
        },
      ]

      // 耳の実装はRobotVRM-Firstでは行わない、別シリーズで実装する
      // const messages: Message[] = [
      //   {
      //     role: 'system',
      //     content: systemPrompt, // システムプロンプトは文字列
      //   },
      //   {
      //     // 耳の実装はRobotVRM-Firstでは行わない、別シリーズで実装する
      //     // {
      //     //   type: 'text',
      //     //   text: '以下の画像を分析し、状況を説明してください。',
      //     // } as const,
      //     role: 'user',
      //     content: [
      //       ...imageDataForLLM.map((image: string) => ({
      //         type: 'image' as const,
      //         image: image,
      //       })),
      //     ],
      //   },
      // ]

      console.log('image count=', messages[1].content.length)

      const speakTool = createSpeakTool((args) => {
        const { content } = args
        console.log('execute speak content=', content)
        console.log(
          'processSpeakContent hasSpokeInCurrentRequest=',
          hasSpokeInCurrentRequest
        )
        if (!hasSpokeInCurrentRequest) {
          processSpeakContent(content)
          hasSpokeInCurrentRequest = true
          return { result: 'success' }
        }
      }, i18n.language as Language)

      const expressingEmotionTool = createExpressingEmotionTool((args) => {
        const { emotion } = args
        console.log('execute expressing_emotion emotion=', emotion)
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
      }, i18n.language as Language)

      const movementTool = createMovementTool(async (args) => {
        const { direction } = args
        console.log('execute movement direction=', direction)
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
      }, i18n.language as Language)

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
    } catch (error) {
      console.error('Error processing LLM request:', error)
      // エラー処理（例：エラー状態の設定、エラーイベントの発火など）
      // 例: handleLlmError(error)
    }
  }

  // イベントリスナーを登録し、クリーンアップ関数を取得
  const unsubscribe = appEventEmitter.on('llmRequest', processLlmRequest)

  // クリーンアップ関数を返す
  return unsubscribe
}
