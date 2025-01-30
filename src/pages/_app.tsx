import '@charcoal-ui/icons'
import type { AppProps } from 'next/app'
import React, { useEffect } from 'react'

import { isLanguageSupported } from '@/features/constants/settings'
import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import '@/styles/globals.css'
import migrateStore from '@/utils/migrateStore'
import i18n from '../lib/i18n'
import { AppsFlyer, AFInit } from 'appsflyer-capacitor-plugin'

// Initialize AppsFlyer in the module scope
const initializeAppsFlyer = () => {
  const appId = process.env.NEXT_PUBLIC_ROBOTVRM_APPSFLYER_APP_ID
  const devKey = process.env.NEXT_PUBLIC_ROBOTVRM_APPSFLYER_DEV_KEY

  if (devKey && appId) {
    const isDebug = process.env.NODE_ENV !== 'production'

    const afConfig: AFInit = {
      appID: appId,
      devKey: devKey,
      isDebug: isDebug,
    }

    AppsFlyer.initSDK(afConfig)
      .then((res) => {
        console.log('AppsFlyer initSDK response:', res)
      })
      .catch((err) => {
        console.error('AppsFlyer initSDK error:', err)
      })
  }
}

// Call initialization immediately
initializeAppsFlyer()

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

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const hs = homeStore.getState()
    const ss = settingsStore.getState()

    if (hs.userOnboarded) {
      i18n.changeLanguage(ss.selectLanguage)
      return
    }

    migrateStore()

    const browserLanguage = navigator.language
    const languageCode = browserLanguage.match(/^zh/i)
      ? 'zh'
      : browserLanguage.split('-')[0].toLowerCase()

    const language = isLanguageSupported(languageCode) ? languageCode : 'ja'
    i18n.changeLanguage(language)
    settingsStore.setState({ selectLanguage: language })

    homeStore.setState({ userOnboarded: true })
  }, [])

  return (
    <>
      <Component {...pageProps} />
    </>
  )
}
