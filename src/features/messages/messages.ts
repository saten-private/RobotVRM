import { VRMExpression, VRMExpressionPresetName } from '@pixiv/three-vrm'
import { KoeiroParam } from '../constants/koeiroParam'

// ChatGPT API
export type Message = {
  role: string // "assistant" | "system" | "user";
  content:
    | string
    | ({ type: 'text'; text: string } | { type: 'image'; image: string })[] // マルチモーダル拡張
}

const talkStyles = [
  'talk',
  'happy',
  'sad',
  'angry',
  'fear',
  'surprised',
] as const
export type TalkStyle = (typeof talkStyles)[number]

export type Talk = {
  style: TalkStyle
  speakerX: number
  speakerY: number
  message: string
}

export type TalkNoEmotion = {
  speakerX: number
  speakerY: number
  message: string
}

export const createTalk = (
  taleNoEmotion: TalkNoEmotion,
  emotion: EmotionType
): Talk => {
  return {
    style: emotionToTalkStyle(emotion),
    speakerX: taleNoEmotion.speakerX,
    speakerY: taleNoEmotion.speakerY,
    message: taleNoEmotion.message,
  }
}

const emotions = ['neutral', 'happy', 'angry', 'sad', 'relaxed'] as const
export type EmotionType = (typeof emotions)[number] & VRMExpressionPresetName

/**
 * 発話文と音声の感情と、モデルの感情表現がセットになった物
 */
export type Screenplay = {
  expression: EmotionType
  talk: Talk
}

export const splitSentence = (text: string): string[] => {
  const splitMessages = text.split(/(?<=[。．！？\n])/g)
  return splitMessages.filter((msg) => msg !== '')
}

export const textsToScreenplay = (
  texts: string[],
  koeiroParam: KoeiroParam
): Screenplay[] => {
  const screenplays: Screenplay[] = []
  let prevExpression = 'neutral'
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]

    const match = text.match(/\[(.*?)\]/)

    const tag = (match && match[1]) || prevExpression

    const message = text.replace(/\[(.*?)\]/g, '')

    let expression = prevExpression
    if (emotions.includes(tag as any)) {
      expression = tag
      prevExpression = tag
    }

    screenplays.push({
      expression: expression as EmotionType,
      talk: {
        style: emotionToTalkStyle(expression as EmotionType),
        speakerX: koeiroParam.speakerX,
        speakerY: koeiroParam.speakerY,
        message: message,
      },
    })
  }

  return screenplays
}

export const textsToTalkNoEmotions = (
  texts: string[],
  koeiroParam: KoeiroParam
): TalkNoEmotion[] => {
  const results: TalkNoEmotion[] = []
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i]

    const message = text.replace(/\[(.*?)\]/g, '')

    results.push({
      speakerX: koeiroParam.speakerX,
      speakerY: koeiroParam.speakerY,
      message: message,
    })
  }
  return results
}

export const expressionToEmotion = (
  expression: VRMExpressionPresetName
): EmotionType => {
  switch (expression) {
    case 'neutral':
      return 'neutral'
    case 'happy':
      return 'happy'
    case 'angry':
      return 'angry'
    case 'sad':
      return 'sad'
    case 'relaxed':
      return 'relaxed'
    default:
      return 'neutral'
  }
}

const emotionToTalkStyle = (emotion: EmotionType): TalkStyle => {
  switch (emotion) {
    case 'angry':
      return 'angry'
    case 'happy':
      return 'happy'
    case 'sad':
      return 'sad'
    default:
      return 'talk'
  }
}
