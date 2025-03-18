import React, { useEffect, useCallback } from 'react'
import { CameraPreviewOptions } from '@capacitor-community/camera-preview'
import { CameraPreviewService } from '@/services/camera/cameraPreviewService'
import { captureStart } from '@/services/camera/captureService'
import settingsStore from '@/features/stores/settings'
import menuStore from '@/features/stores/menu'

export const Webcam = () => {
  let captureComplete: Promise<() => void> | null = null

  const initializeCamera = useCallback(async () => {
    console.log('initializeCamera start')
    try {
      const hiddenCameraPreview = settingsStore.getState().hiddenCameraPreview
      const cameraPreviewOptions: CameraPreviewOptions = {
        position: 'front',
        height: hiddenCameraPreview ? 1 : 120,
        width: hiddenCameraPreview ? 1 : 120,
        x: window.innerWidth - (hiddenCameraPreview ? 1 : 120), // 画面の右端から120px左に配置
        y: window.navigator.userAgent.includes('iPhone') ? 44 : 0, // SafeAreaがある場合は44pxずらす
        disableAudio: true,
      }
      await CameraPreviewService.start(cameraPreviewOptions)
      console.log('initializeCamera cameraPreviewService.start done')
      const complete = captureStart({
        captureIntervalSeconds: 0.5,
        maxCaptureSeconds: 60,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
      captureComplete = complete
      console.log('initializeCamera end complete=', complete)
      console.log('initializeCamera end captureComplete=', captureComplete)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    } catch (error) {
      console.error('initializeCamera error:', error)
      menuStore.setState({ showWebcam: false })
    }
  }, [])

  const endCamera = useCallback(async () => {
    console.log('endCamera start')
    try {
      await CameraPreviewService.stop()
      console.log('endCamera CameraPreviewService.stop done')
      if (captureComplete) {
        const stopCapture = await captureComplete
        stopCapture()
        console.log('endCamera captureComplete done')
      } else {
        console.log('endCamera captureComplete is null')
      }
      console.log('endCamera end')
    } catch (error) {
      console.error('endCamera error:', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    console.log('webcam will start')
    initializeCamera()
    console.log('webcam did start')
    return () => {
      console.log('webcam will end')
      endCamera()
      console.log('webcam did end')
    }
  }, [initializeCamera, endCamera])

  return <div />
}

export const captureImage = async (): Promise<string> => {
  const result = await CameraPreviewService.captureSample({})
  console.log('captureImage result.length=', result.length)
  return result
}
