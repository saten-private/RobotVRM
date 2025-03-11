import { tool } from 'ai'
import { z } from 'zod'

export type Language = 'ja' | 'en' | 'ko' | 'zh'

export const toolPrompt = (
  language: Language
): {
  Speak: string
  SpeakContent: string
  ExpressingEmotion: string
  ExpressingEmotionContent: string
  Emotion: {
    Normal: string
    Joy: string
    Anger: string
    Sadness: string
    Calmness: string
  }
  Movement: string
  MovementContent: string
  Direction: {
    Forward: string
    Left: string
    Right: string
    Back: string
  }
} => {
  switch (language) {
    case 'ja':
      return {
        Speak: '日本語を話す',
        SpeakContent: '話す日本語の内容',
        ExpressingEmotion: '感情を表現する',
        ExpressingEmotionContent: '表現する感情',
        Emotion: {
          Normal: '通常',
          Joy: '喜び',
          Anger: '怒り',
          Sadness: '悲しみ',
          Calmness: '安らぎ',
        },
        Movement: '移動する',
        MovementContent: '移動する方向',
        Direction: {
          Forward: '前',
          Left: '左',
          Right: '右',
          Back: '後ろ',
        },
      }
    case 'en':
      return {
        Speak: 'speak English',
        SpeakContent: 'Spoken English Content',
        ExpressingEmotion: 'Express an Emotion',
        ExpressingEmotionContent: 'An emotion expressed',
        Emotion: {
          Normal: 'neutral',
          Joy: 'pleasure',
          Anger: 'anger',
          Sadness: 'sadness',
          Calmness: 'peace',
        },
        Movement: 'Moving on.',
        MovementContent: 'Direction of movement',
        Direction: {
          Forward: 'forward',
          Left: 'left',
          Right: 'right',
          Back: 'backward',
        },
      }
    case 'ko':
      return {
        Speak: '한국어 말하기',
        SpeakContent: '말하는 한국어 내용',
        ExpressingEmotion: '감정 표현하기',
        ExpressingEmotionContent: '감정 표현',
        Emotion: {
          Normal: '중립',
          Joy: '즐거움',
          Anger: '분노',
          Sadness: '슬픔',
          Calmness: '편안함',
        },
        Movement: '이동하기',
        MovementContent: '이동 방향',
        Direction: {
          Forward: '앞으로',
          Left: '왼쪽',
          Right: '오른쪽',
          Back: '뒤로',
        },
      }
    case 'zh':
      return {
        Speak: '會說台語',
        SpeakContent: '台語口語內容',
        ExpressingEmotion: '表達情緒。',
        ExpressingEmotionContent: '表達的情感',
        Emotion: {
          Normal: '中立',
          Joy: '快樂',
          Anger: '憤怒',
          Sadness: '悲傷',
          Calmness: '安宁',
        },
        Movement: '繼續前進',
        MovementContent: '移動方向',
        Direction: {
          Forward: '前言',
          Left: '左邊',
          Right: '對',
          Back: '向後',
        },
      }
    default:
      throw new Error('Invalid language')
  }
}

export type ToolName = 'speak' | 'movement' | 'expressing_emotion'

export const createSpeakTool = (
  processSpeakContent: (args: any) => any,
  language: Language
) =>
  tool({
    description: toolPrompt(language).Speak,
    parameters: z.object({
      content: z.string().describe(toolPrompt(language).SpeakContent),
    }),
    execute: async (args) => processSpeakContent(args),
  })

export const createExpressingEmotionTool = (
  processExpressingEmotion: (args: any) => any,
  language: Language
) =>
  tool({
    description: toolPrompt(language).ExpressingEmotion,
    parameters: z.object({
      emotion: z
        .enum([
          toolPrompt(language).Emotion.Normal,
          toolPrompt(language).Emotion.Joy,
          toolPrompt(language).Emotion.Anger,
          toolPrompt(language).Emotion.Sadness,
          toolPrompt(language).Emotion.Calmness,
        ])
        .describe(toolPrompt(language).ExpressingEmotionContent),
    }),
    execute: async (args) => processExpressingEmotion(args),
  })

export const createMovementTool = (
  processMovement: (args: any) => any,
  language: Language
) =>
  tool({
    description: toolPrompt(language).Movement,
    parameters: z.object({
      direction: z
        .enum([
          toolPrompt(language).Direction.Forward,
          toolPrompt(language).Direction.Left,
          toolPrompt(language).Direction.Right,
          toolPrompt(language).Direction.Back,
        ])
        .describe(toolPrompt(language).MovementContent),
    }),
    execute: async (args) => processMovement(args),
  })

export const createPastBackgroundTool = (
  processSpeakContent: (args: any) => any,
  language: Language
) =>
  tool({
    description: "Output Past Background",
    parameters: z.object({
      content: z.string().describe("Past Background"),
    }),
    execute: async (args) => processSpeakContent(args),
  })

