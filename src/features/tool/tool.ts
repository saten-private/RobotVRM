import { tool } from 'ai'
import { z } from 'zod'

export type Language = 'ja' | 'en'

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
  processPastBackgroundContent: (args: any) => any,
  language: Language
) =>
  tool({
    description: 'Output my updated background.',
    parameters: z.object({
      content: z.string().describe('My updated background'),
    }),
    execute: async (args) => processPastBackgroundContent(args),
  })
