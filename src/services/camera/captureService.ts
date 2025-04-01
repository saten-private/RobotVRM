import { captureImage } from '@/components/webcam'
import homeStore from '@/features/stores/home'
import { Action } from '@/features/tool/action'
import { appEventEmitter } from '@/utils/eventEmitter'

interface CaptureOptions {
  captureIntervalSeconds: number
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
}: CaptureOptions): Promise<() => void> => {
  return new Promise(async (resolve) => {
    let captureIntervalId: NodeJS.Timeout

    const addCapture = (data: string) => {
      const captureAction: Action = {
        role: 'user',
        content: [{ type: 'image', image: data }],
      }

      homeStore.getState().addToActionLog(captureAction)
    }

    const captureAndProcessLLM = async () => {
      await performCapture(addCapture)
    }

    // Perform initial capture immediately
    await performCapture(addCapture)

    appEventEmitter.emit('llmRequest')

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
