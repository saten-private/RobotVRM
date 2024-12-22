import { captureImage } from '@/components/webcam'
import {
  useCaptureStore,
  getCaptureStoreState,
} from '@/features/stores/capture'
import { appEventEmitter } from '@/utils/eventEmitter'

interface CaptureOptions {
  captureIntervalSeconds: number
  llmIntervalSeconds: number
  maxCaptureSeconds: number // Changed from maxCaptures to maxCaptureSeconds
}

const performCapture = async (addCapture: (data: string) => void) => {
  try {
    const base64PictureData = await captureImage()
    addCapture(base64PictureData)
    return true
  } catch (error) {
    console.error('Error capturing image:', error)
    return false
  }
}

export const captureStart = async ({
  captureIntervalSeconds,
  llmIntervalSeconds,
  maxCaptureSeconds,
}: CaptureOptions): Promise<() => void> => {
  return new Promise(async (resolve) => {
    const { addCapture, setMaxCaptures } = useCaptureStore.getState()

    // Calculate maxCaptures based on maxCaptureSeconds and captureIntervalSeconds
    const maxCaptures = Math.floor(maxCaptureSeconds / captureIntervalSeconds)
    setMaxCaptures(maxCaptures)

    const llmTriggerCount = Math.floor(
      llmIntervalSeconds / captureIntervalSeconds
    )
    let captureCount = 0
    let captureIntervalId: NodeJS.Timeout

    const captureAndProcessLLM = async () => {
      const captureSuccess = await performCapture(addCapture)

      if (captureSuccess) {
        captureCount++

        if (captureCount >= llmTriggerCount) {
          appEventEmitter.emit('llmRequest')
          captureCount = 0 // Reset the count after triggering LLM request
        }
      }
    }

    // Perform initial capture immediately
    await performCapture(addCapture)

    // Set up interval for repeated captures
    console.log(
      'captureStart setInterval captureIntervalSeconds=',
      captureIntervalSeconds
    )
    captureIntervalId = setInterval(
      captureAndProcessLLM,
      captureIntervalSeconds * 1000
    )

    resolve(() => {
      console.log('captureStart clearInterval')
      clearInterval(captureIntervalId)
    })
  })
}

export const getCaptureStore = () => {
  const { captures, maxCaptures } = getCaptureStoreState()
  return {
    captures: [...captures],
    maxCaptures,
  }
}
