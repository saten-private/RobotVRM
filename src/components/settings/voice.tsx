import React, { useState, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'

import {
  PRESET_A,
  PRESET_B,
  PRESET_C,
  PRESET_D,
} from '@/features/constants/koeiroParam'
import { AIVoice } from '@/features/constants/settings'
import { testVoice } from '@/features/messages/speakCharacter'
import settingsStore from '@/features/stores/settings'
import { Link } from '../link'
import { TextButton } from '../textButton'
import speakers from '../speakers.json'
import { getAPIKey, setAPIKey } from '@/features/stores/secureStorage'
import { fetchAudioAivisSpeechSpeakerJson } from '@/features/messages/aivisSpeechSpeaker'

// スピーカースタイルの型定義
interface SpeakerStyle {
  name: string
  id: number
  type: string
}

interface Speaker {
  name: string
  speaker_uuid: string
  styles: SpeakerStyle[]
}

const Voice = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [koeiromapKey, setKoeiromapKey] = useState('')
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState('')

  const selectVoice = settingsStore((s) => s.selectVoice)
  const koeiroParam = settingsStore((s) => s.koeiroParam)
  const googleTtsType = settingsStore((s) => s.googleTtsType)
  const voicevoxSpeaker = settingsStore((s) => s.voicevoxSpeaker)
  const voicevoxSpeed = settingsStore((s) => s.voicevoxSpeed)
  const voicevoxPitch = settingsStore((s) => s.voicevoxPitch)
  const voicevoxIntonation = settingsStore((s) => s.voicevoxIntonation)
  const voicevoxStoreServerUrl = settingsStore((s) => s.voicevoxStoreServerUrl)
  const voicevoxStoreSpeaker = settingsStore((s) => s.voicevoxStoreSpeaker)
  const voicevoxStoreSpeed = settingsStore((s) => s.voicevoxStoreSpeed)
  const voicevoxStorePitch = settingsStore((s) => s.voicevoxStorePitch)
  const voicevoxStoreIntonation = settingsStore(
    (s) => s.voicevoxStoreIntonation
  )
  const aivisSpeechSpeaker = settingsStore((s) => s.aivisSpeechSpeaker)
  const aivisSpeechSpeed = settingsStore((s) => s.aivisSpeechSpeed)
  const aivisSpeechPitch = settingsStore((s) => s.aivisSpeechPitch)
  const aivisSpeechIntonation = settingsStore((s) => s.aivisSpeechIntonation)
  const aivisSpeechStoreServerUrl = settingsStore(
    (s) => s.aivisSpeechStoreServerUrl
  )
  const aivisSpeechStoreSpeaker = settingsStore(
    (s) => s.aivisSpeechStoreSpeaker
  )
  const aivisSpeechStoreSpeed = settingsStore((s) => s.aivisSpeechStoreSpeed)
  const aivisSpeechStorePitch = settingsStore((s) => s.aivisSpeechStorePitch)
  const aivisSpeechStoreIntonation = settingsStore(
    (s) => s.aivisSpeechStoreIntonation
  )
  const stylebertvits2ServerUrl = settingsStore(
    (s) => s.stylebertvits2ServerUrl
  )
  const stylebertvits2ApiKey = settingsStore((s) => s.stylebertvits2ApiKey)
  const stylebertvits2ModelId = settingsStore((s) => s.stylebertvits2ModelId)
  const stylebertvits2Style = settingsStore((s) => s.stylebertvits2Style)
  const stylebertvits2SdpRatio = settingsStore((s) => s.stylebertvits2SdpRatio)
  const stylebertvits2Length = settingsStore((s) => s.stylebertvits2Length)
  const gsviTtsServerUrl = settingsStore((s) => s.gsviTtsServerUrl)
  const gsviTtsModelId = settingsStore((s) => s.gsviTtsModelId)
  const gsviTtsBatchSize = settingsStore((s) => s.gsviTtsBatchSize)
  const gsviTtsSpeechRate = settingsStore((s) => s.gsviTtsSpeechRate)
  const elevenlabsVoiceId = settingsStore((s) => s.elevenlabsVoiceId)

  const { t } = useTranslation()

  // スピーカーJSONを管理するstate
  const aivisSpeechOSSSpeakerJson = settingsStore(
    (s) => s.aivisSpeechOSSSpeakerJson
  )
  const aivisSpeechStoreSpeakerJson = settingsStore(
    (s) => s.aivisSpeechStoreSpeakerJson
  )

  // コンポーネントマウント時とselectVoiceが変更された時にJSONを取得
  useEffect(() => {
    const fetchSpeakerJson = async () => {
      if (selectVoice === 'aivis_speech_oss') {
        try {
          const json = await fetchAudioAivisSpeechSpeakerJson(false, null)
          settingsStore.setState({
            aivisSpeechOSSSpeakerJson: JSON.stringify(json),
          })
        } catch (error) {
          console.error('Error fetching AivisSpeech speaker JSON init OSS')
        }
      }
    }
    fetchSpeakerJson()
  }, [selectVoice])

  // スピーカーリストを生成(OSS版)
  const getAivisSpeechOSSSpeakerOptions = () => {
    if (!aivisSpeechOSSSpeakerJson) return []

    const speakers = JSON.parse(aivisSpeechOSSSpeakerJson) as Speaker[]
    const options: { label: string; value: string }[] = []

    speakers.forEach((speaker) => {
      speaker.styles
        .filter((style) => style.type === 'talk')
        .forEach((style) => {
          options.push({
            label: `${speaker.name}/${style.name}`,
            value: style.id.toString(),
          })
        })
    })

    return options
  }

  // スピーカーリストを生成(ストア版)
  const getAivisSpeechStoreSpeakerOptions = () => {
    if (!aivisSpeechStoreSpeakerJson) return []

    const speakers = JSON.parse(aivisSpeechStoreSpeakerJson) as Speaker[]
    const options: { label: string; value: string }[] = []

    speakers.forEach((speaker) => {
      speaker.styles
        .filter((style) => style.type === 'talk')
        .forEach((style) => {
          options.push({
            label: `${speaker.name}/${style.name}`,
            value: style.id.toString(),
          })
        })
    })

    return options
  }

  useEffect(() => {
    const fetchAPIKeys = async () => {
      setIsLoading(true)
      const koeiromapKeyValue = await getAPIKey('koeiromapKey')
      const elevenlabsApiKeyValue = await getAPIKey('elevenlabsApiKey')
      setKoeiromapKey(koeiromapKeyValue)
      setElevenlabsApiKey(elevenlabsApiKeyValue)
      setIsLoading(false)
    }

    fetchAPIKeys()
  }, [])

  if (isLoading) {
    return <div>{t('Loading')}</div> // ローディング中のメッセージを表示
  }

  return (
    <div className="my-40">
      <div className="my-16 typography-20 font-bold">
        {t('SyntheticVoiceEngineChoice')}
      </div>
      <div>{t('VoiceEngineInstruction')}</div>
      <div className="my-8">
        <select
          value={selectVoice}
          onChange={(e) =>
            settingsStore.setState({ selectVoice: e.target.value as AIVoice })
          }
          className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
        >
          {process.env.NEXT_PUBLIC_ENV === 'store' ? (
            <>
              <option value="elevenlabs">{t('UsingElevenLabs')}</option>
              <option value="stylebertvits2">{t('UsingStyleBertVITS2')}</option>
              <option value="koeiromap">{t('UsingKoeiromap')}</option>
              <option value="voicevox_store">{t('UsingVoiceVox')}</option>
              <option value="aivis_speech_store">
                {t('UsingAivisSpeech')}
              </option>
              {/* 検証できていないかつ検証予定でないため無効化<option value="gsvitts">{t('UsingGSVITTS')}</option> */}
            </>
          ) : (
            <>
              <option value="stylebertvits2">{t('UsingStyleBertVITS2')}</option>
              <option value="elevenlabs">{t('UsingElevenLabs')}</option>
              <option value="google">{t('UsingGoogleTTS')}</option>
              <option value="voicevox_oss">
                {t('UsingVoiceVox')}({t('OSSVersion')})
              </option>
              <option value="voicevox_store">
                {t('UsingVoiceVox')}({t('StoreVersion')})
              </option>
              <option value="aivis_speech_oss">
                {t('UsingAivisSpeech')}({t('OSSVersion')})
              </option>
              <option value="aivis_speech_store">
                {t('UsingAivisSpeech')}({t('StoreVersion')})
              </option>
              <option value="koeiromap">{t('UsingKoeiromap')}</option>
              {/* 検証できていないかつ検証予定でないため無効化<option value="gsvitts">{t('UsingGSVITTS')}</option> */}
            </>
          )}
        </select>
      </div>
      <div className="my-40">
        <div className="my-16 typography-20 font-bold">
          {t('VoiceAdjustment')}
        </div>
        {(() => {
          if (selectVoice === 'koeiromap') {
            return (
              <>
                <div>
                  {t('KoeiromapInfo')}
                  <br />
                  <Link
                    url="https://koemotion.rinna.co.jp"
                    label="https://koemotion.rinna.co.jp"
                  />
                </div>
                <div className="mt-16 font-bold">API キー</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={koeiromapKey}
                    onChange={async (e) => {
                      setKoeiromapKey(e.target.value)
                      await setAPIKey('koeiromapKey', e.target.value)
                    }}
                  />
                </div>
                <div className="mt-16 font-bold">プリセット</div>
                <div className="my-8 grid grid-cols-2 gap-[8px]">
                  <TextButton
                    onClick={() =>
                      settingsStore.setState({
                        koeiroParam: {
                          speakerX: PRESET_A.speakerX,
                          speakerY: PRESET_A.speakerY,
                        },
                      })
                    }
                  >
                    かわいい
                  </TextButton>
                  <TextButton
                    onClick={() =>
                      settingsStore.setState({
                        koeiroParam: {
                          speakerX: PRESET_B.speakerX,
                          speakerY: PRESET_B.speakerY,
                        },
                      })
                    }
                  >
                    元気
                  </TextButton>
                  <TextButton
                    onClick={() =>
                      settingsStore.setState({
                        koeiroParam: {
                          speakerX: PRESET_C.speakerX,
                          speakerY: PRESET_C.speakerY,
                        },
                      })
                    }
                  >
                    かっこいい
                  </TextButton>
                  <TextButton
                    onClick={() =>
                      settingsStore.setState({
                        koeiroParam: {
                          speakerX: PRESET_D.speakerX,
                          speakerY: PRESET_D.speakerY,
                        },
                      })
                    }
                  >
                    渋い
                  </TextButton>
                </div>
                <div className="my-24">
                  <div className="select-none">x : {koeiroParam.speakerX}</div>
                  <input
                    type="range"
                    min={-10}
                    max={10}
                    step={0.001}
                    value={koeiroParam.speakerX}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        koeiroParam: {
                          speakerX: Number(e.target.value),
                          speakerY: koeiroParam.speakerY,
                        },
                      })
                    }}
                  ></input>
                  <div className="select-none">y : {koeiroParam.speakerY}</div>
                  <input
                    type="range"
                    min={-10}
                    max={10}
                    step={0.001}
                    value={koeiroParam.speakerY}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        koeiroParam: {
                          speakerX: koeiroParam.speakerX,
                          speakerY: Number(e.target.value),
                        },
                      })
                    }}
                  ></input>
                </div>
              </>
            )
          } else if (selectVoice === 'voicevox_oss') {
            return (
              <>
                <div>
                  {t('VoiceVoxInfo')}
                  <br />
                  <Link
                    url="https://voicevox.hiroshiba.jp/"
                    label="https://voicevox.hiroshiba.jp/"
                  />
                </div>
                <div className="mt-16 font-bold">{t('SpeakerSelection')}</div>
                <div className="flex items-center">
                  <select
                    value={voicevoxSpeaker}
                    onChange={(e) =>
                      settingsStore.setState({
                        voicevoxSpeaker: e.target.value,
                      })
                    }
                    className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
                  >
                    <option value="">{t('Select')}</option>
                    {speakers.map((speaker) => (
                      <option key={speaker.id} value={speaker.id}>
                        {speaker.speaker}
                      </option>
                    ))}
                  </select>
                  <TextButton onClick={() => testVoice()} className="ml-16">
                    {t('TestVoice')}
                  </TextButton>
                </div>
                <div className="my-24">
                  <div className="select-none">
                    {t('VoicevoxSpeed')}: {voicevoxSpeed}
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.01}
                    value={voicevoxSpeed}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        voicevoxSpeed: Number(e.target.value),
                      })
                    }}
                  ></input>
                  <div className="select-none">
                    {t('VoicevoxPitch')}: {voicevoxPitch}
                  </div>
                  <input
                    type="range"
                    min={-0.15}
                    max={0.15}
                    step={0.01}
                    value={voicevoxPitch}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        voicevoxPitch: Number(e.target.value),
                      })
                    }}
                  ></input>
                  <div className="select-none">
                    {t('VoicevoxIntonation')}: {voicevoxIntonation}
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.01}
                    value={voicevoxIntonation}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        voicevoxIntonation: Number(e.target.value),
                      })
                    }}
                  ></input>
                </div>
              </>
            )
          } else if (selectVoice === 'voicevox_store') {
            return (
              <>
                <div>
                  <Trans
                    i18nKey="VoiceVoxInfoStore"
                    components={{
                      voicevox_server_setup: (
                        <b>
                          <Link
                            url={`${process.env.NEXT_PUBLIC_ROBOTVRM_DOCS_URL}/docs/voicevox_server.md`}
                            label={t('VoiceVoxInfoStoreLink')}
                          />
                        </b>
                      ),
                    }}
                  />
                  <div className="mt-8">
                    <code className="text-ellipsis px-16 py-4 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8">
                      ./run --host localhost --allow_origin{' '}
                      {window.location.origin}
                    </code>
                  </div>
                </div>
                <div className="mt-16 font-bold">
                  {t('VoiceVoxInfoStoreServerURL')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-3 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="https://192.168.1.1"
                    value={voicevoxStoreServerUrl}
                    onChange={(e) =>
                      settingsStore.setState({
                        voicevoxStoreServerUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('SpeakerSelection')}</div>
                <div className="flex items-center">
                  <select
                    value={voicevoxStoreSpeaker}
                    onChange={(e) =>
                      settingsStore.setState({
                        voicevoxStoreSpeaker: e.target.value,
                      })
                    }
                    className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
                  >
                    <option value="">{t('Select')}</option>
                    {speakers.map((speaker) => (
                      <option key={speaker.id} value={speaker.id}>
                        {speaker.speaker}
                      </option>
                    ))}
                  </select>
                  <TextButton onClick={() => testVoice()} className="ml-16">
                    {t('TestVoice')}
                  </TextButton>
                </div>
                <div className="my-24">
                  <div className="select-none">
                    {t('VoicevoxSpeed')}: {voicevoxStoreSpeed}
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.01}
                    value={voicevoxStoreSpeed}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        voicevoxStoreSpeed: Number(e.target.value),
                      })
                    }}
                  ></input>
                  <div className="select-none">
                    {t('VoicevoxPitch')}: {voicevoxStorePitch}
                  </div>
                  <input
                    type="range"
                    min={-0.15}
                    max={0.15}
                    step={0.01}
                    value={voicevoxStorePitch}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        voicevoxStorePitch: Number(e.target.value),
                      })
                    }}
                  ></input>
                  <div className="select-none">
                    {t('VoicevoxIntonation')}: {voicevoxStoreIntonation}
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.01}
                    value={voicevoxStoreIntonation}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        voicevoxStoreIntonation: Number(e.target.value),
                      })
                    }}
                  ></input>
                </div>
              </>
            )
          } else if (selectVoice === 'aivis_speech_oss') {
            const speakerOptions = getAivisSpeechOSSSpeakerOptions()

            return (
              <>
                <div>
                  {t('AivisSpeechInfo')}
                  <br />
                  <Link
                    url="https://aivis-project.com/"
                    label="https://aivis-project.com/"
                  />
                </div>
                <div className="mt-16 font-bold">{t('SpeakerSelection')}</div>
                <div className="flex items-center">
                  <select
                    value={aivisSpeechSpeaker}
                    onChange={(e) =>
                      settingsStore.setState({
                        aivisSpeechSpeaker: e.target.value,
                      })
                    }
                    className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
                  >
                    <option value="">{t('Select')}</option>
                    {speakerOptions.map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <TextButton onClick={() => testVoice()} className="ml-16">
                    {t('TestVoice')}
                  </TextButton>
                  <TextButton
                    onClick={async () => {
                      try {
                        const json = await fetchAudioAivisSpeechSpeakerJson(
                          false,
                          null
                        )
                        settingsStore.setState({
                          aivisSpeechOSSSpeakerJson: JSON.stringify(json),
                        })
                      } catch (error) {
                        console.error(
                          'Error fetching AivisSpeech speaker JSON OSS'
                        )
                      }
                    }}
                    className="ml-16"
                  >
                    {t('AivisSpeechGetSpeakers')}
                  </TextButton>
                </div>
                <div className="my-24">
                  <div className="select-none">
                    {t('AivisSpeechSpeed')}: {aivisSpeechSpeed}
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.01}
                    value={aivisSpeechSpeed}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        aivisSpeechSpeed: Number(e.target.value),
                      })
                    }}
                  ></input>
                  <div className="select-none">
                    {t('AivisSpeechPitch')}: {aivisSpeechPitch}
                  </div>
                  <input
                    type="range"
                    min={-0.15}
                    max={0.15}
                    step={0.01}
                    value={aivisSpeechPitch}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        aivisSpeechPitch: Number(e.target.value),
                      })
                    }}
                  ></input>
                  <div className="select-none">
                    {t('AivisSpeechIntonation')}: {aivisSpeechIntonation}
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.01}
                    value={aivisSpeechIntonation}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        aivisSpeechIntonation: Number(e.target.value),
                      })
                    }}
                  ></input>
                </div>
              </>
            )
          } else if (selectVoice === 'aivis_speech_store') {
            const speakerOptions = getAivisSpeechStoreSpeakerOptions()

            return (
              <>
                <div>
                  <Trans
                    i18nKey="AivisSpeechInfoStore"
                    components={{
                      aivis_speech_server_setup: (
                        <b>
                          <Link
                            url={`${process.env.NEXT_PUBLIC_ROBOTVRM_DOCS_URL}/docs/aivis_speech_server.md`}
                            label={t('AivisSpeechInfoStoreLink')}
                          />
                        </b>
                      ),
                    }}
                  />
                  <div className="mt-8">
                    <code className="text-ellipsis px-16 py-4 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8">
                      ./run --host localhost --allow_origin{' '}
                      {window.location.origin}
                    </code>
                  </div>
                </div>
                <div className="mt-16 font-bold">
                  {t('AivisSpeechInfoStoreServerURL')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-3 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="https://192.168.1.1"
                    value={aivisSpeechStoreServerUrl}
                    onChange={(e) =>
                      settingsStore.setState({
                        aivisSpeechStoreServerUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('SpeakerSelection')}</div>
                <div className="flex items-center">
                  <select
                    value={aivisSpeechStoreSpeaker}
                    onChange={(e) =>
                      settingsStore.setState({
                        aivisSpeechStoreSpeaker: e.target.value,
                      })
                    }
                    className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
                  >
                    <option value="">{t('Select')}</option>
                    {speakerOptions.map(({ label, value }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <TextButton onClick={() => testVoice()} className="ml-16">
                    {t('TestVoice')}
                  </TextButton>
                  <TextButton
                    onClick={async () => {
                      try {
                        const json = await fetchAudioAivisSpeechSpeakerJson(
                          true,
                          aivisSpeechStoreServerUrl
                        )
                        settingsStore.setState({
                          aivisSpeechStoreSpeakerJson: JSON.stringify(json),
                        })
                      } catch (error) {
                        console.error(
                          'Error fetching AivisSpeech speaker JSON Store'
                        )
                      }
                    }}
                    className="ml-16"
                    disabled={!aivisSpeechStoreServerUrl}
                  >
                    {t('AivisSpeechGetSpeakers')}
                  </TextButton>
                </div>
                <div className="my-24">
                  <div className="select-none">
                    {t('AivisSpeechSpeed')}: {aivisSpeechStoreSpeed}
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.01}
                    value={aivisSpeechStoreSpeed}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        aivisSpeechStoreSpeed: Number(e.target.value),
                      })
                    }}
                  ></input>
                  <div className="select-none">
                    {t('AivisSpeechPitch')}: {aivisSpeechStorePitch}
                  </div>
                  <input
                    type="range"
                    min={-0.15}
                    max={0.15}
                    step={0.01}
                    value={aivisSpeechStorePitch}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        aivisSpeechStorePitch: Number(e.target.value),
                      })
                    }}
                  ></input>
                  <div className="select-none">
                    {t('AivisSpeechIntonation')}: {aivisSpeechStoreIntonation}
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.0}
                    step={0.01}
                    value={aivisSpeechStoreIntonation}
                    className="mt-8 mb-16 input-range"
                    onChange={(e) => {
                      settingsStore.setState({
                        aivisSpeechStoreIntonation: Number(e.target.value),
                      })
                    }}
                  ></input>
                </div>
              </>
            )
          } else if (selectVoice === 'google') {
            return (
              <>
                <div>
                  {t('GoogleTTSInfo')}
                  <br />
                  {t('AuthFileInstruction')}
                  <br />
                  <Link
                    url="https://developers.google.com/workspace/guides/create-credentials?#create_credentials_for_a_service_account"
                    label="https://developers.google.com/workspace/guides/create-credentials?#create_credentials_for_a_service_account"
                  />
                  <br />
                  <br />
                  {t('LanguageModelURL')}
                  <br />
                  <Link
                    url="https://cloud.google.com/text-to-speech/docs/voices"
                    label="https://cloud.google.com/text-to-speech/docs/voices"
                  />
                </div>
                <div className="mt-16 font-bold">{t('LanguageChoice')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={googleTtsType}
                    onChange={(e) =>
                      settingsStore.setState({ googleTtsType: e.target.value })
                    }
                  />
                </div>
              </>
            )
          } else if (selectVoice === 'stylebertvits2') {
            return (
              <>
                <div>
                  <Trans
                    i18nKey="StyleBertVITS2Info"
                    components={{
                      style_bert_vits2_server_setup: (
                        <b>
                          <Link
                            url={`${process.env.NEXT_PUBLIC_ROBOTVRM_DOCS_URL}/docs/style-bert-vits2_server.md`}
                            label={t('StyleBertVITS2InfoLink')}
                          />
                        </b>
                      ),
                    }}
                  />
                  <br />
                  <br />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2ServerURL')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={stylebertvits2ServerUrl}
                    onChange={(e) =>
                      settingsStore.setState({
                        stylebertvits2ServerUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2ApiKey')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={stylebertvits2ApiKey}
                    onChange={(e) =>
                      settingsStore.setState({
                        stylebertvits2ApiKey: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2ModelID')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="number"
                    placeholder="..."
                    value={stylebertvits2ModelId}
                    onChange={(e) =>
                      settingsStore.setState({
                        stylebertvits2ModelId: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2Style')}
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={stylebertvits2Style}
                    onChange={(e) =>
                      settingsStore.setState({
                        stylebertvits2Style: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2SdpRatio')}: {stylebertvits2SdpRatio}
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.01}
                  value={stylebertvits2SdpRatio}
                  className="mt-8 mb-16 input-range"
                  onChange={(e) => {
                    settingsStore.setState({
                      stylebertvits2SdpRatio: Number(e.target.value),
                    })
                  }}
                ></input>
                <div className="mt-16 font-bold">
                  {t('StyleBeatVITS2Length')}: {stylebertvits2Length}
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={2.0}
                  step={0.01}
                  value={stylebertvits2Length}
                  className="mt-8 mb-16 input-range"
                  onChange={(e) => {
                    settingsStore.setState({
                      stylebertvits2Length: Number(e.target.value),
                    })
                  }}
                ></input>
              </>
            )
          } else if (selectVoice === 'gsvitts') {
            return (
              <>
                <div>{t('GSVITTSInfo')}</div>
                <div className="mt-16 font-bold">{t('GSVITTSServerUrl')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={gsviTtsServerUrl}
                    onChange={(e) =>
                      settingsStore.setState({
                        gsviTtsServerUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('GSVITTSModelID')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={gsviTtsModelId}
                    onChange={(e) =>
                      settingsStore.setState({ gsviTtsModelId: e.target.value })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('GSVITTSBatchSize')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="number"
                    step="1"
                    placeholder="..."
                    value={gsviTtsBatchSize}
                    onChange={(e) =>
                      settingsStore.setState({
                        gsviTtsBatchSize: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="mt-16 font-bold">{t('GSVITTSSpeechRate')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="number"
                    step="0.1"
                    placeholder="..."
                    value={gsviTtsSpeechRate}
                    onChange={(e) =>
                      settingsStore.setState({
                        gsviTtsSpeechRate: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </>
            )
          } else if (selectVoice === 'elevenlabs') {
            return (
              <>
                <div>
                  {t('ElevenLabsInfo')}
                  <br />
                  <Link
                    url="https://elevenlabs.io/api"
                    label="https://elevenlabs.io/api"
                  />
                  <br />
                </div>
                <div className="mt-16 font-bold">{t('ElevenLabsApiKey')}</div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={elevenlabsApiKey}
                    onChange={async (e) => {
                      setElevenlabsApiKey(e.target.value)
                      await setAPIKey('elevenlabsApiKey', e.target.value)
                    }}
                  />
                </div>
                <div className="mt-16 font-bold">{t('ElevenLabsVoiceId')}</div>
                <div className="mt-8">
                  {t('ElevenLabsVoiceIdInfo')}
                  <br />
                  <Link
                    url="https://api.elevenlabs.io/v1/voices"
                    label="https://api.elevenlabs.io/v1/voices"
                  />
                  <br />
                </div>
                <div className="mt-8">
                  <input
                    className="text-ellipsis px-16 py-8 w-col-span-4 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="..."
                    value={elevenlabsVoiceId}
                    onChange={(e) =>
                      settingsStore.setState({
                        elevenlabsVoiceId: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )
          }
        })()}
      </div>
    </div>
  )
}
export default Voice
