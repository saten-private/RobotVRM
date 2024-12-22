import {
  CameraPreview,
  CameraPreviewOptions,
  CameraPreviewPictureOptions,
} from '@capacitor-community/camera-preview'

type QueueTask = () => Promise<void>

interface CameraPreviewService {
  start: (options: CameraPreviewOptions) => Promise<void>
  stop: () => Promise<void>
  captureSample: (options: CameraPreviewPictureOptions) => Promise<string>
  isCameraActive: () => boolean
}

const createCameraPreviewService = (): CameraPreviewService => {
  let queue: QueueTask[] = []
  let isProcessing = false
  let isCameraRunning = false

  const processQueue = async () => {
    if (isProcessing) return
    isProcessing = true

    while (queue.length > 0) {
      const task = queue.shift()
      if (task) {
        await task()
      }
    }

    isProcessing = false
  }

  const addToQueue = (task: QueueTask) => {
    queue.push(task)
    processQueue()
  }

  const start = async (options: CameraPreviewOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
      addToQueue(async () => {
        try {
          await CameraPreview.start(options)
          isCameraRunning = true
          console.log('Camera started')
          resolve()
        } catch (error) {
          console.error('Failed to start camera:', error)
          isCameraRunning = false
          reject(error)
        }
      })
    })
  }

  const stop = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      addToQueue(async () => {
        try {
          await CameraPreview.stop()
          isCameraRunning = false
          console.log('Camera stopped')
          resolve()
        } catch (error) {
          console.error('Failed to stop camera:', error)
          reject(error)
        }
      })
    })
  }

  const captureSample = async (
    options: CameraPreviewPictureOptions
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isCameraRunning) {
        console.log('Camera is not running. Cannot capture sample.')
        reject(new Error('Camera is not running'))
        return
      }

      addToQueue(async () => {
        try {
          const result = await CameraPreview.captureSample(options)
          console.log('Sample captured')
          resolve(result.value)
        } catch (error) {
          console.error('Failed to capture sample:', error)
          reject(error)
        }
      })
    })
  }

  const isCameraActive = (): boolean => {
    return isCameraRunning
  }

  return {
    start,
    stop,
    captureSample,
    isCameraActive,
  }
}

export const CameraPreviewService = createCameraPreviewService()
