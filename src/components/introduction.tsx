import i18n from 'i18next'
import { useEffect, useState, useCallback } from 'react'
import { useTranslation, Trans } from 'react-i18next'

import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import { Link } from './link'
import {
  VoiceLanguage,
  isLanguageSupported,
} from '@/features/constants/settings'
import ModelProvider from './settings/modelProvider'
import Voice from './settings/voice'
import { hasLlmApiKey } from '@/features/chat/hasLlmApiKey'
import { TextButton } from './textButton'

export const Introduction = () => {
  const selectLanguage = settingsStore((s) => s.selectLanguage)

  const [displayIntroduction, setDisplayIntroduction] = useState(false)
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null)
  const validateApiKey = homeStore((s) => s.validateApiKey)
  const acceptedEula = homeStore((s) => s.acceptedEula)

  const { t } = useTranslation()

  const checkAPIKey = useCallback(async () => {
    const result = await hasLlmApiKey()
    if (hasApiKey === null) {
      setDisplayIntroduction(!result)
    }
    setHasApiKey(result)
  }, [hasApiKey])

  useEffect(() => {
    if (validateApiKey) {
      checkAPIKey()
    }
  }, [checkAPIKey, validateApiKey])

  const updateLanguage = () => {
    console.log('i18n.language', i18n.language)

    let languageCode = i18n.language

    const getVoiceLanguageCode = (selectLanguage: string): VoiceLanguage => {
      switch (selectLanguage) {
        case 'ja':
          return 'ja-JP'
        case 'en':
          return 'en-US'
        default:
          return 'en-US'
      }
    }

    settingsStore.setState({
      selectLanguage: isLanguageSupported(languageCode) ? languageCode : 'ja',
      selectVoiceLanguage: getVoiceLanguageCode(languageCode),
    })
  }

  const eulaUrl = process.env.NEXT_PUBLIC_ROBOTVRM_EULA_URL || ''

  return displayIntroduction ? (
    <div className="absolute z-40 w-full h-full px-24 py-40 bg-black/30 font-M_PLUS_2">
      <div className="relative mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white/80 backdrop-blur rounded-16">
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary ">
            {t('AboutThisApplication')}
          </div>
          <div>
            <Trans i18nKey="AboutThisApplicationDescription" />
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            {t('TechnologyIntroduction')}
          </div>
          <div>
            <Trans
              i18nKey="TechnologyIntroductionDescription1"
              components={{
                chatvrm: (
                  <b>
                    <Link
                      url="https://github.com/pixiv/ChatVRM"
                      label="ChatVRM"
                    />
                  </b>
                ),
                tegnike: (
                  <Link url="https://x.com/tegnike" label={t('tegnike')} />
                ),
                aituberkit: (
                  <b>
                    <Link
                      url="https://github.com/tegnike/aituber-kit/tree/5c1be3dae7e38871839f37857e550b8f7387f718"
                      label={t('TechnologyIntroductionAITuberKit')}
                    />
                  </b>
                ),
                b: <b />,
              }}
            />
          </div>
          <div className="my-16">
            {t('TechnologyIntroductionDescription3')}
            <Link
              url={'https://github.com/pixiv/three-vrm'}
              label={'@pixiv/three-vrm'}
            />
            {t('TechnologyIntroductionDescription4')}
            <Link
              url={'https://www.anthropic.com/api'}
              label={'Anthropic API'}
            />
            {t('TechnologyIntroductionDescription5')}
            <Link
              url={
                'https://developers.rinna.co.jp/product/#product=koeiromap-free'
              }
              label={'Koemotion'}
            />
            {t('TechnologyIntroductionDescription5-1')}
            <Link url={'https://voicevox.hiroshiba.jp/'} label={'VOICEVOX'} />
            {t('TechnologyIntroductionDescription6')}
          </div>
          <div className="my-16">
            {t('SourceCodeDescription1')}
            <br />
            {t('RepositoryURL')}
            <br />
            <Link
              url={'https://github.com/saten-private/RobotVRM'}
              label={'https://github.com/saten-private/RobotVRM'}
            />
            <br />
            {t('TechnologyIntroductionAuthor')}
            <br />
            <Link
              url={'https://x.com/saten_work'}
              label={'saten@RobotVRM博士'}
            />
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold typography-20 text-secondary">
            {t('Settings')}
          </div>
          <div className="space-y-16">
            <ModelProvider />
            <Voice />
          </div>

          <div className="my-8 font-bold typography-20 text-secondary">
            {t('RobotSettings')}({t('Option')})
          </div>

          <div className="my-40">
            <TextButton
              onClick={() =>
                window.open(
                  `${process.env.NEXT_PUBLIC_ROBOTVRM_ROBOT_STORE_URL}`,
                  '_blank'
                )
              }
            >
              {t('RobotStore')}
            </TextButton>
          </div>
        </div>

        <div className="my-24">
          {eulaUrl && (
            <div className="mb-16 flex items-center gap-16">
              <input
                type="checkbox"
                id="eula-checkbox"
                checked={acceptedEula}
                onChange={(e) => {
                  homeStore.setState({ acceptedEula: e.target.checked })
                }}
                className="w-16 h-16"
              />
              <label htmlFor="eula-checkbox" className="cursor-pointer ml-8">
                <Trans
                  i18nKey="AcceptEula"
                  components={{
                    eula: <Link url={eulaUrl} label={t('EulaLink')} />,
                  }}
                />
              </label>
            </div>
          )}

          <button
            onClick={() => {
              setDisplayIntroduction(false)
              updateLanguage()
            }}
            className="font-bold bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white px-24 py-8 rounded-oval"
            disabled={!hasApiKey || (!!eulaUrl && !acceptedEula)}
          >
            {t('StartWithAISettings')}
          </button>
        </div>

        {selectLanguage === 'ja' && (
          <div className="my-24">
            <p>
              You can select the language from the settings. English and
              Traditional Chinese are available.
            </p>
          </div>
        )}
      </div>
    </div>
  ) : null
}
