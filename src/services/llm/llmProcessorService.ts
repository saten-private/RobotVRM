import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import { useCaptureStore } from '@/features/stores/capture'
import { getAIChatResponseStream } from '@/features/chat/aiChatFactory'
import { AIService } from '@/features/constants/settings'
import { Message } from '@/features/messages/messages'
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
      // キャプチャした画像をBase64形式で取得
      const imageData = captures.map((capture) => capture.data)
      // LLMは古い画像から新しい画像の順番で時系列を認識するようなため、取得したキューの順番を逆にする
      // 参考:https://cookbook.openai.com/examples/gpt4o/introduction_to_gpt4o#video-processing
      const imageDataForLLM = imageData.reverse()

      // メッセージの作成
      const messages: Message[] = [
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

// export const completeLlmRequest = async (
//   messages: Message[]
// ): Promise<string> => {
//   let stream

//   const ss = settingsStore.getState()
//   const hs = homeStore.getState()

//   try {
//     stream = await getAIChatResponseStream(
//       ss.selectAIService as AIService,
//       messages
//     )
//   } catch (e) {
//     console.error(e)
//     stream = null
//   }

//   return stream

//   // if (stream == null) {
//   //   return
//   // }

//   // const reader = stream.getReader()
//   // let receivedMessage = ''
//   // let aiTextLog: Message[] = [] // 会話ログ欄で使用
//   // let tag = ''
//   // let isCodeBlock = false
//   // let codeBlockText = ''
//   // const sentences = new Array<string>() // AssistantMessage欄で使用
//   // try {
//   //   while (true) {
//   //     const { done, value } = await reader.read()
//   //     if (done && receivedMessage.length === 0) break

//   //     if (value) receivedMessage += value

//   //     // 返答内容のタグ部分と返答部分を分離
//   //     const tagMatch = receivedMessage.match(/^\[(.*?)\]/)
//   //     if (tagMatch && tagMatch[0]) {
//   //       tag = tagMatch[0]
//   //       receivedMessage = receivedMessage.slice(tag.length)
//   //     }

//   //     // 返答を一文単位で切り出して処理する
//   //     while (receivedMessage.length > 0) {
//   //       const sentenceMatch = receivedMessage.match(
//   //         /^(.+?[。．.!?！？\n]|.{20,}[、,])/
//   //       )
//   //       if (sentenceMatch?.[0]) {
//   //         let sentence = sentenceMatch[0]
//   //         // 区切った文字をsentencesに追加
//   //         sentences.push(sentence)
//   //         // 区切った文字の残りでreceivedMessageを更新
//   //         receivedMessage = receivedMessage.slice(sentence.length).trimStart()

//   //         // 発話不要/不可能な文字列だった場合はスキップ
//   //         if (
//   //           !sentence.includes('```') &&
//   //           !sentence.replace(
//   //             /^[\s\u3000\t\n\r\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]'"''""・、。,.!?！？:：;；\-_=+~～*＊@＠#＃$＄%％^＾&＆|｜\\＼/／`｀]+$/gu,
//   //             ''
//   //           )
//   //         ) {
//   //           continue
//   //         }

//   //         // タグと返答を結合（音声再生で使用される）
//   //         let aiText = `${tag} ${sentence}`
//   //         console.log('aiText', aiText)

//   //         if (isCodeBlock && !sentence.includes('```')) {
//   //           codeBlockText += sentence
//   //           continue
//   //         }

//   //         if (sentence.includes('```')) {
//   //           if (isCodeBlock) {
//   //             // コードブロックの終了処理
//   //             const [codeEnd, ...restOfSentence] = sentence.split('```')
//   //             aiTextLog.push({
//   //               role: 'code',
//   //               content: codeBlockText + codeEnd,
//   //             })
//   //             aiText += `${tag} ${restOfSentence.join('```') || ''}`

//   //             // AssistantMessage欄の更新
//   //             homeStore.setState({ assistantMessage: sentences.join(' ') })

//   //             codeBlockText = ''
//   //             isCodeBlock = false
//   //           } else {
//   //             // コードブロックの開始処理
//   //             isCodeBlock = true
//   //             ;[aiText, codeBlockText] = aiText.split('```')
//   //           }

//   //           sentence = sentence.replace(/```/g, '')
//   //         }

//   //         const aiTalks = textsToScreenplay([aiText], ss.koeiroParam)
//   //         aiTextLog.push({ role: 'assistant', content: sentence })

//   //         // 文ごとに音声を生成 & 再生、返答を表示
//   //         const currentAssistantMessage = sentences.join(' ')

//   //         speakCharacter(
//   //           aiTalks[0],
//   //           () => {
//   //             homeStore.setState({
//   //               assistantMessage: currentAssistantMessage,
//   //             })
//   //             hs.incrementChatProcessingCount()
//   //           },
//   //           () => {
//   //             hs.decrementChatProcessingCount()
//   //           }
//   //         )
//   //       } else {
//   //         // マッチする文がない場合、ループを抜ける
//   //         break
//   //       }
//   //     }

//   //     // ストリームが終了し、receivedMessageが空でない場合の処理
//   //     if (done && receivedMessage.length > 0) {
//   //       // 残りのメッセージを処理
//   //       let aiText = `${tag} ${receivedMessage}`
//   //       const aiTalks = textsToScreenplay([aiText], ss.koeiroParam)
//   //       aiTextLog.push({ role: 'assistant', content: receivedMessage })
//   //       sentences.push(receivedMessage)

//   //       const currentAssistantMessage = sentences.join(' ')

//   //       speakCharacter(
//   //         aiTalks[0],
//   //         () => {
//   //           homeStore.setState({
//   //             assistantMessage: currentAssistantMessage,
//   //           })
//   //           hs.incrementChatProcessingCount()
//   //         },
//   //         () => {
//   //           hs.decrementChatProcessingCount()
//   //         }
//   //       )

//   //       receivedMessage = ''
//   //     }
//   //   }
//   // } catch (e) {
//   //   console.error(e)
//   // } finally {
//   //   reader.releaseLock()
//   // }

//   // // 直前のroleとじゃらば、contentを結合し、空のcontentを除外する
//   // let lastImageUrl = ''
//   // aiTextLog = aiTextLog
//   //   .reduce((acc: Message[], item: Message) => {
//   //     if (
//   //       typeof item.content != 'string' &&
//   //       item.content[0] &&
//   //       item.content[1]
//   //     ) {
//   //       lastImageUrl = item.content[1].image
//   //     }

//   //     const lastItem = acc[acc.length - 1]
//   //     if (lastItem && lastItem.role === item.role) {
//   //       if (typeof item.content != 'string') {
//   //         lastItem.content += ' ' + item.content[0].text
//   //       } else {
//   //         lastItem.content += ' ' + item.content
//   //       }
//   //     } else {
//   //       const text =
//   //         typeof item.content != 'string' ? item.content[0].text : item.content
//   //       if (lastImageUrl != '') {
//   //         acc.push({
//   //           ...item,
//   //           content: [
//   //             { type: 'text', text: text.trim() },
//   //             { type: 'image', image: lastImageUrl },
//   //           ],
//   //         })
//   //         lastImageUrl = ''
//   //       } else {
//   //         acc.push({ ...item, content: text.trim() })
//   //       }
//   //     }
//   //     return acc
//   //   }, [])
//   //   .filter((item) => item.content !== '')

//   // homeStore.setState({
//   //   chatLog: [...currentChatLog, ...aiTextLog],
//   //   chatProcessing: false,
//   // })
// }

// オプション: 結果処理やエラー処理の関数
// export const handleLlmResult = (result: string): void => { ... }
// export const handleLlmError = (error: any): void => { ... }
