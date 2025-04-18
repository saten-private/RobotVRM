import React from 'react'
import { useTranslation } from 'react-i18next'

import settingsStore from '@/features/stores/settings'
import { GitHubLink } from '../githubLink'
import { IconButton } from '../iconButton'
import AdvancedSettings from './advancedSettings'
import Character from './character'
import Environment from './environment'
import LanguageSetting from './language'
import Log from './log'
import ModelProvider from './modelProvider'
import Voice from './voice'
import WebSocket from './websocket'
import YouTube from './youtube'
import Slide from './slide'
import Licenses from './licenses'
import { TextButton } from '../textButton'

type Props = {
  onClickClose: () => void
}
const Settings = (props: Props) => {
  return (
    <div className="absolute z-40 w-full h-full bg-white/80 backdrop-blur ">
      <Header {...props} />
      <Main />
      <Footer />
    </div>
  )
}
export default Settings

const Header = ({ onClickClose }: Pick<Props, 'onClickClose'>) => {
  return (
    <>
      <GitHubLink />
      <div className="absolute m-24 fixed-top">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}
        ></IconButton>
      </div>
    </>
  )
}

const Main = () => {
  const { t } = useTranslation()
  const eulaUrl = process.env.NEXT_PUBLIC_ROBOTVRM_EULA_URL

  return (
    <main className="max-h-full overflow-auto">
      <div className="text-text1 max-w-3xl mx-auto px-24 py-64 ">
        <div className="my-24 typography-32 font-bold fixed-top">
          {t('Settings')}
        </div>

        <div className="my-40">
          {/* 言語設定 */}
          <LanguageSetting />

          {/* キャラクター設定 */}
          <Character />

          {/* 背景画像の設定 */}
          <Environment />
        </div>

        <div className="my-24 typography-32 font-bold">{t('AISettings')}</div>

        <div className="my-40">
          {/* 外部接続モードの設定 */}
          {/* メンテナンスしていない機能は無効化する<WebSocket /> */}

          {/* AI設定 */}
          <ModelProvider />
        </div>

        {/* メンテナンスしていない機能は無効化する<div className="my-24 typography-32 font-bold">
          {t('YoutubeSettings')}
        </div>

        <div className="my-40"> */}
        {/* YouTube設定 */}
        {/* <YouTube />
        </div> */}

        <div className="my-24 typography-32 font-bold">
          {t('VoiceSettings')}
        </div>

        <div className="my-40">
          {/* 音声エンジンの選択 */}
          <Voice />
        </div>

        {/* メンテナンスしていない機能は無効化する<div className="my-24 typography-32 font-bold">
          {t('SlideSettings')}
        </div>

        <div className="my-40"> */}
        {/* スライド設定 */}
        {/* <Slide />
        </div> */}

        <div className="my-24 typography-32 font-bold">
          {t('RobotSettings')}
        </div>

        <div className="my-40">
          <TextButton
            onClick={() =>
              window.open(
                `${process.env.NEXT_PUBLIC_ROBOTVRM_DOCS_URL}/docs/make_robot.md`,
                '_blank'
              )
            }
          >
            {t('HowToMakeRobot')}
          </TextButton>
        </div>

        <div className="my-24 typography-32 font-bold">
          {t('OtherSettings')}
        </div>

        <AdvancedSettings />

        {/* チャットログの設定 */}
        <Log />

        {/* ライセンス表示 */}
        <Licenses />

        {eulaUrl && (
          <div className="mt-2">
            <a
              href={eulaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              {t('EulaLink')}
            </a>
          </div>
        )}
      </div>
    </main>
  )
}

const Footer = () => {
  return (
    <footer className="absolute py-4 bg-[#413D43] text-center text-white font-Montserrat bottom-0 w-full">
      RobotVRM - Based on ChatVRM and aituber-kit
    </footer>
  )
}
