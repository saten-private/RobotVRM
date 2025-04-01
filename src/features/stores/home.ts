import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Action } from '@/features/tool/action'
import { Viewer } from '../vrmViewer/viewer'
export interface PersistedState {
  userOnboarded: boolean
  acceptedEula: boolean
  initialLaunchCompleted: boolean
  doNotShowBluetoothPopup: boolean
}

export interface TransientState {
  validateApiKey: boolean
  viewer: Viewer
  actionLog: Action[]
  maxActionLogSize: number
  addToActionLog: (action: Action) => void
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
      acceptedEula: false,
      initialLaunchCompleted: false,
      doNotShowBluetoothPopup: false,

      // transient states
      validateApiKey: true,
      viewer: new Viewer(),
      actionLog: [],
      maxActionLogSize: 60,
      addToActionLog: (action: Action) => {
        set((state) => {
          const newActionLog = [...state.actionLog, action]
          if (newActionLog.length > state.maxActionLogSize) {
            return { actionLog: newActionLog.slice(-state.maxActionLogSize) }
          }
          return { actionLog: newActionLog }
        })
      },
      assistantMessage: '',
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
        acceptedEula,
        initialLaunchCompleted,
        doNotShowBluetoothPopup,
      }) => ({
        acceptedEula,
        initialLaunchCompleted,
        doNotShowBluetoothPopup,
      }),
    }
  )
)

export default homeStore
