import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Message } from '@/features/messages/messages'
import { Viewer } from '../vrmViewer/viewer'

export interface PersistedState {
  userOnboarded: boolean
  chatLog: Message[]
  acceptedEula: boolean
  initialLaunchCompleted: boolean
  doNotShowBluetoothPopup: boolean
}

export interface TransientState {
  validateApiKey: boolean
  viewer: Viewer
  assistantMessage: string
  slideMessages: string[]
  chatProcessing: boolean
  chatProcessingCount: number
  incrementChatProcessingCount: () => void
  decrementChatProcessingCount: () => void
  backgroundImageUrl: string
  modalImage: string
  triggerShutter: boolean
  webcamStatus: boolean
  captureStatus: boolean
  ws: WebSocket | null
  wsStreaming: boolean
}

export type HomeState = PersistedState & TransientState

const homeStore = create<HomeState>()(
  persist(
    (set, get) => ({
      // persisted states
      userOnboarded: false,
      chatLog: [],
      acceptedEula: false,
      initialLaunchCompleted: false,
      doNotShowBluetoothPopup: false,
      assistantMessage: '',

      // transient states
      validateApiKey: true,
      viewer: new Viewer(),
      slideMessages: [],
      chatProcessing: false,
      chatProcessingCount: 0,
      incrementChatProcessingCount: () => {
        set(({ chatProcessingCount }) => ({
          chatProcessingCount: chatProcessingCount + 1,
        }))
      },
      decrementChatProcessingCount: () => {
        set(({ chatProcessingCount }) => ({
          chatProcessingCount: chatProcessingCount - 1,
        }))
      },
      backgroundImageUrl:
        process.env.NEXT_PUBLIC_ROBOTVRM_BACKGROUND_IMAGE_PATH ?? '/bg-c.png',
      modalImage: '',
      triggerShutter: false,
      webcamStatus: false,
      captureStatus: false,
      ws: null,
      wsStreaming: false,
    }),
    {
      name: 'robotvrm-home',
      partialize: ({
        chatLog,
        acceptedEula,
        initialLaunchCompleted,
        doNotShowBluetoothPopup,
      }) => ({
        chatLog: chatLog.map((message: Message) => ({
          ...message,
          content:
            typeof message.content === 'string'
              ? message.content
              : message.content
                  .map((item) => ('text' in item ? item.text : ''))
                  .join('\n'),
        })),
        acceptedEula,
        initialLaunchCompleted,
        doNotShowBluetoothPopup,
      }),
    }
  )
)

export default homeStore
