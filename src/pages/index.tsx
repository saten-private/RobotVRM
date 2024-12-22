import { Form } from '@/components/form'
import { Introduction } from '@/components/introduction'
import { Menu } from '@/components/menu'
import { Meta } from '@/components/meta'
import ModalImage from '@/components/modalImage'
import VrmViewer from '@/components/vrmViewer'
import homeStore from '@/features/stores/home'
import '@/lib/i18n'
import { buildUrl } from '@/utils/buildUrl'
import { useState, useEffect, useCallback } from 'react'
import { startLlmProcessor } from '@/services/llm/llmProcessorService'
import {
  SecureStorage,
  KeychainAccess,
} from '@aparajita/capacitor-secure-storage'
import { readFileToBlob } from '@/utils/fileSystem'
import { Directory } from '@capacitor/filesystem'
import settingsStore from '@/features/stores/settings'
// ネイティブ以外からアクセスされた場合はアクセス拒否
export async function getServerSideProps(context: any) {
  if (!/RobotVRM/.test(context.req.headers['user-agent'])) {
    return {
      redirect: {
        destination: '/access-denied',
        permanent: false,
      },
    }
  }

  return {
    props: {}, // 通常のプロップスを返す
  }
}

const Home = () => {
  const [isInitialized, setIsInitialized] = useState(false)
  const bgUrl = homeStore((s) => `url(${buildUrl(s.backgroundImageUrl)})`)
  const initalizeSecureStorage = useCallback(async () => {
    try {
      const fileName = settingsStore.getState().savedBackgroundImageFileName
      if (fileName === '') {
        throw new Error('No background image file name')
      }
      const blob = await readFileToBlob(Directory.Documents, fileName)
      const url = window.URL.createObjectURL(blob)
      homeStore.setState({ backgroundImageUrl: url })
    } catch {
      console.log('bgImage not found')
    }
    try {
      console.log('Application initialization SecureStorage start')
      await SecureStorage.setSynchronize(true)
      await SecureStorage.setDefaultKeychainAccess(KeychainAccess.whenUnlocked)
      await SecureStorage.setKeyPrefix('delete_uninstall')

      const hs = homeStore.getState()
      if (!hs.initialLaunchCompleted) {
        await SecureStorage.clear() // 設定したPrefixのだけ削除されるよう
        console.log('First launch detected, cleaning up SecureStorage')
        homeStore.setState({ initialLaunchCompleted: true })
      }
      setIsInitialized(true)
      console.log('Application initialization SecureStorage end')
    } catch (error) {
      console.error('Application initialization SecureStorage error', error)
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    console.log('Home start')
    initalizeSecureStorage()
    const unsubscribe = startLlmProcessor()
    return () => {
      console.log('Home end')
      unsubscribe()
    }
  }, [initalizeSecureStorage])

  return (
    <div className="min-h-screen bg-cover" style={{ backgroundImage: bgUrl }}>
      <Meta />
      {isInitialized ? (
        <>
          <Introduction />
          <VrmViewer />
          <Form />
          <Menu />
          <ModalImage />
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default Home
