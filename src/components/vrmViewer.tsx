import { useCallback, useState, useEffect } from 'react'
import { buildUrl } from '@/utils/buildUrl'

import homeStore from '@/features/stores/home'
import {
  readFileToBlob,
  writeNodeTypeFile,
  deleteFile,
} from '@/utils/fileSystem'
import { Directory } from '@capacitor/filesystem'
import settingsStore from '@/features/stores/settings'

export default function VrmViewer() {
  const [vrmUrl, setVrmUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVrm = async () => {
      try {
        const fileName = settingsStore.getState().savedVRMFileName
        if (fileName === '') {
          throw new Error('No VRM file name')
        }
        const blob = await readFileToBlob(Directory.Documents, fileName)
        const url = window.URL.createObjectURL(blob)
        setVrmUrl(url)
      } catch {
        const defaultUrl = buildUrl('/AvatarSample_B.vrm')
        setVrmUrl(defaultUrl)
      }
    }

    loadVrm()
  }, [])

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas && vrmUrl) {
        const { viewer } = homeStore.getState()
        try {
          setIsLoading(true)
          viewer.setup(canvas)

          viewer.loadVrm(vrmUrl)
        } catch (error) {
          console.error('Failed to load VRM:', error)
        } finally {
          setIsLoading(false)
        }

        // Drag and DropでVRMを差し替え
        canvas.addEventListener('dragover', function (event) {
          event.preventDefault()
        })

        canvas.addEventListener('drop', async function (event) {
          event.preventDefault()
          try {
            const files = event.dataTransfer?.files
            if (!files) {
              return
            }

            const file = files[0]
            if (!file) {
              return
            }
            const file_type = file.name.split('.').pop()
            if (file_type === 'vrm') {
              try {
                const fileName = settingsStore.getState().savedVRMFileName
                settingsStore.setState({ savedVRMFileName: '' })
                await deleteFile(Directory.Documents, fileName)
                console.log('resetVRM success')
              } catch (error) {
                console.error(error)
              }
              // 同じファイル名が使えなくなることがあるため日付のサフィックスをつける
              // https://stackoverflow.com/a/70322500
              const currentDate = new Date()
                .toLocaleString()
                .replace(/[,:\s\/]/g, '-')
              const fileName = `avatar-${currentDate}.vrm`
              await writeNodeTypeFile(file, Directory.Documents, fileName)
              settingsStore.setState({ savedVRMFileName: fileName })
              const blob = new Blob([file], {
                type: 'application/octet-stream',
              })
              const url = window.URL.createObjectURL(blob)
              viewer.loadVrm(url)
            } else if (file.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.readAsDataURL(file)
              reader.onload = function () {
                const image = reader.result as string
                image !== '' && homeStore.setState({ modalImage: image })
              }
            }
          } catch (error) {
            console.error('Failed to change VRM file:', error)
          }
        })
      }
    },
    [vrmUrl]
  )

  return (
    <div className={'absolute top-0 left-0 w-screen h-[100svh] z-5'}>
      {isLoading ? (
        <div>
          <div className="flex items-center justify-center h-screen">
            VRM model is loading...
          </div>
          <canvas ref={canvasRef} className={'h-full w-full'} />
        </div>
      ) : (
        <canvas ref={canvasRef} className={'h-full w-full'} />
      )}
    </div>
  )
}
