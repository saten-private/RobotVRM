import React, { useCallback, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import homeStore from '@/features/stores/home'
import menuStore from '@/features/stores/menu'
import settingsStore from '@/features/stores/settings'
import {
  multiModalAIServices,
  multiModalAIServiceKey,
} from '@/features/stores/secureStorage'
import slideStore from '@/features/stores/slide'
import { AssistantText } from './assistantText'
import { ChatLog } from './chatLog'
import { IconButton } from './iconButton'
import Settings from './settings'
import { Webcam } from './webcam'
import { Bluetooth } from './bluetooth'
import Slides from './slides'
import Capture from './capture'
import { writeNodeTypeFile, deleteFile } from '@/utils/fileSystem'
import { Directory } from '@capacitor/filesystem'
import { hasLlmApiKey } from '@/features/chat/hasLlmApiKey'

export const Menu = () => {
  const validateApiKey = homeStore((s) => s.validateApiKey)
  const selectAIService = settingsStore((s) => s.selectAIService)
  const youtubeMode = settingsStore((s) => s.youtubeMode)
  const youtubePlaying = settingsStore((s) => s.youtubePlaying)
  const webSocketMode = settingsStore((s) => s.webSocketMode)
  const slideMode = settingsStore((s) => s.slideMode)
  const slideVisible = menuStore((s) => s.slideVisible)
  const chatLog = homeStore((s) => s.actionLog)
  const assistantMessage = homeStore((s) => s.assistantMessage)
  const showWebcam = menuStore((s) => s.showWebcam)
  const showControlPanel = settingsStore((s) => s.showControlPanel)
  const showCapture = menuStore((s) => s.showCapture)
  const slidePlaying = slideStore((s) => s.isPlaying)
  const showAssistantText = settingsStore((s) => s.showAssistantText)

  const [showSettings, setShowSettings] = useState(false)
  const [showChatLog, setShowChatLog] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const imageFileInputRef = useRef<HTMLInputElement>(null)

  const selectedSlideDocs = slideStore((state) => state.selectedSlideDocs)
  const { t } = useTranslation()

  const [markdownContent, setMarkdownContent] = useState('')

  const [hasApiKey, setHasApiKey] = useState(false)

  useEffect(() => {
    if (!selectedSlideDocs) return

    fetch(`/slides/${selectedSlideDocs}/slides.md`)
      .then((response) => response.text())
      .then((text) => setMarkdownContent(text))
      .catch((error) =>
        console.error('Failed to fetch markdown content:', error)
      )
  }, [selectedSlideDocs])

  const checkAPIKey = useCallback(async () => {
    setHasApiKey(await hasLlmApiKey())
  }, [])

  useEffect(() => {
    if (validateApiKey) {
      checkAPIKey()
    }
  }, [checkAPIKey, validateApiKey])

  const handleChangeVrmFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      const file = files[0]
      if (!file) return

      const file_type = file.name.split('.').pop()

      if (file_type === 'vrm') {
        try {
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
          const blob = new Blob([file], { type: 'application/octet-stream' })
          const url = window.URL.createObjectURL(blob)
          const hs = homeStore.getState()
          hs.viewer.loadVrm(url)
        } catch (error) {
          console.error('Failed to change VRM file:', error)
        }
      }

      event.target.value = ''
    },
    []
  )

  const handleChangeBgImageFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return

      const file = files[0]
      if (!file) return

      try {
        try {
          const fileName = settingsStore.getState().savedBackgroundImageFileName
          settingsStore.setState({ savedBackgroundImageFileName: '' })
          await deleteFile(Directory.Documents, fileName)
          console.log('resetBackgroundImage success')
        } catch (error) {
          console.error(error)
        }
        // 同じファイル名が使えなくなることがあるため日付のサフィックスをつける
        // https://stackoverflow.com/a/70322500
        const currentDate = new Date()
          .toLocaleString()
          .replace(/[,:\s\/]/g, '-')
        const fileName = `bgImage-${currentDate}`
        await writeNodeTypeFile(file, Directory.Documents, fileName)
        settingsStore.setState({ savedBackgroundImageFileName: fileName })
        const blob = new Blob([file], { type: 'image/*' })
        const url = window.URL.createObjectURL(blob)
        homeStore.setState({ backgroundImageUrl: url })
      } catch (error) {
        console.error('Failed to change VRM file:', error)
      }

      event.target.value = ''
    },
    []
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === '.') {
        setShowSettings((prevState) => !prevState)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    console.log('onChangeWebcamStatus')
    homeStore.setState({ webcamStatus: showWebcam })

    if (showWebcam) {
      // navigator.mediaDevices
      //   .getUserMedia({ video: true })
      //   .then(() => {
      //     setShowPermissionModal(false)
      //   })
      //   .catch(() => {
      //     setShowPermissionModal(true)
      //   })
    }
  }, [showWebcam])

  useEffect(() => {
    console.log('onChangeCaptureStatus')
    homeStore.setState({ captureStatus: showCapture })
  }, [showCapture])

  useEffect(() => {
    if (!youtubePlaying) {
      settingsStore.setState({
        youtubeContinuationCount: 0,
        youtubeNoCommentCount: 0,
        youtubeSleepMode: false,
      })
    }
  }, [youtubePlaying])

  const toggleCapture = useCallback(() => {
    console.log('toggleCapture')
    menuStore.setState(({ showCapture }) => ({ showCapture: !showCapture }))
    menuStore.setState({ showWebcam: false }) // Captureを表示するときWebcamを非表示にする
  }, [])

  const toggleWebcam = useCallback(() => {
    console.log('toggleWebcam')
    menuStore.setState(({ showWebcam }) => ({ showWebcam: !showWebcam }))
    menuStore.setState({ showCapture: false }) // Webcamを表示するときCaptureを非表示にする
  }, [])

  return (
    <>
      <div className="absolute z-15 m-24 fixed-top">
        <div
          className="grid md:grid-flow-col gap-[8px] mb-40"
          style={{ width: 'max-content' }}
        >
          {showControlPanel && (
            <>
              <div className="md:order-1 order-2">
                <IconButton
                  iconName="24/Settings"
                  isProcessing={false}
                  onClick={() => setShowSettings(true)}
                ></IconButton>
              </div>
              <div className="md:order-2 order-1">
                {showChatLog ? (
                  <IconButton
                    iconName="24/CommentOutline"
                    label={t('ChatLog')}
                    isProcessing={false}
                    onClick={() => setShowChatLog(false)}
                  />
                ) : (
                  <IconButton
                    iconName="24/CommentFill"
                    label={t('ChatLog')}
                    isProcessing={false}
                    disabled={chatLog.length <= 0}
                    onClick={() => setShowChatLog(true)}
                  />
                )}
              </div>
              {!youtubeMode &&
                multiModalAIServices.includes(
                  selectAIService as multiModalAIServiceKey
                ) && (
                  <>
                    <div className="order-3">
                      <Bluetooth />
                    </div>
                    <div className="order-4">
                      <IconButton
                        iconName="24/Camera"
                        className={
                          showWebcam
                            ? 'bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled'
                            : ''
                        }
                        isProcessing={false}
                        disabled={!hasApiKey}
                        onClick={toggleWebcam}
                      />
                    </div>
                    {/* メンテナンスしていない機能を無効化<div className="order-4">
                      <IconButton
                        iconName="24/AddImage"
                        isProcessing={false}
                        onClick={() => imageFileInputRef.current?.click()}
                      />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        ref={imageFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (e) => {
                              const imageUrl = e.target?.result as string
                              homeStore.setState({ modalImage: imageUrl })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                    </div> */}
                  </>
                )}
              {youtubeMode && (
                <div className="order-5">
                  <IconButton
                    iconName={youtubePlaying ? '24/PauseAlt' : '24/Video'}
                    isProcessing={false}
                    onClick={() =>
                      settingsStore.setState({
                        youtubePlaying: !youtubePlaying,
                      })
                    }
                  />
                </div>
              )}
              {slideMode && (
                <div className="order-5">
                  <IconButton
                    iconName="24/FrameEffect"
                    isProcessing={false}
                    onClick={() =>
                      menuStore.setState({ slideVisible: !slideVisible })
                    }
                    disabled={slidePlaying}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <div className="relative">
        {slideMode && slideVisible && <Slides markdown={markdownContent} />}
      </div>
      {webSocketMode ? showChatLog && <ChatLog /> : showChatLog && <ChatLog />}
      {showSettings && <Settings onClickClose={() => setShowSettings(false)} />}
      {!showChatLog &&
        assistantMessage &&
        (!slideMode || !slideVisible) &&
        showAssistantText && <AssistantText message={assistantMessage} />}
      {showWebcam && <Webcam />}
      {showCapture && <Capture />}
      {showPermissionModal && (
        <div className="modal">
          <div className="modal-content">
            <p>カメラの使用を許可してください。</p>
            <button onClick={() => setShowPermissionModal(false)}>
              閉じる
            </button>
          </div>
        </div>
      )}
      <input
        type="file"
        className="hidden"
        accept={
          /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent)
            ? 'application/octet-stream,.vrm'
            : '.vrm'
        }
        ref={(fileInput) => {
          if (!fileInput) {
            menuStore.setState({ fileInput: null })
            return
          }

          menuStore.setState({ fileInput })
        }}
        onChange={handleChangeVrmFile}
      />
      <input
        type="file"
        className="hidden"
        accept="image/*"
        ref={(bgFileInput) => {
          if (!bgFileInput) {
            menuStore.setState({ bgFileInput: null })
            return
          }

          menuStore.setState({ bgFileInput })
        }}
        onChange={handleChangeBgImageFile}
      />
    </>
  )
}
