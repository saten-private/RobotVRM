import { Language } from '@/features/constants/settings'
import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'
import englishToJapanese from '@/utils/englishToJapanese.json'
import { wait } from '@/utils/wait'
import { Screenplay, Talk, TalkNoEmotion, createTalk } from './messages'
import { synthesizeStyleBertVITS2Api } from './synthesizeStyleBertVITS2'
import { synthesizeVoiceApi } from './synthesizeVoice'
import { synthesizeVoiceElevenlabsApi } from './synthesizeVoiceElevenlabs'
import { synthesizeVoiceGoogleApi } from './synthesizeVoiceGoogle'
import { getAPIKey } from '../stores/secureStorage'

interface EnglishToJapanese {
  [key: string]: string
}

const typedEnglishToJapanese = englishToJapanese as EnglishToJapanese

const createSpeakCharacter = () => {
  let lastTime = 0
  let prevFetchPromise: Promise<unknown> = Promise.resolve()
  let prevSpeakPromise: Promise<unknown> = Promise.resolve()

  return (
    screenplay: Screenplay,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const ss = settingsStore.getState()
    onStart?.()

    if (ss.changeEnglishToJapanese && ss.selectLanguage === 'ja') {
      // 英単語を日本語で読み上げる
      screenplay.talk.message = convertEnglishToJapaneseReading(
        screenplay.talk.message
      )
    }

    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now()
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime))
      }
      let buffer
      if (ss.selectVoice == 'koeiromap') {
        buffer = await fetchAudio(
          screenplay.talk,
          await getAPIKey('koeiromapKey')
        ).catch(() => null)
      } else if (ss.selectVoice == 'voicevox_oss') {
        buffer = await fetchAudioVoiceVox(
          screenplay.talk,
          ss.voicevoxSpeaker,
          ss.voicevoxSpeed,
          ss.voicevoxPitch,
          ss.voicevoxIntonation,
          false,
          null
        ).catch(() => null)
      } else if (ss.selectVoice == 'voicevox_store') {
        buffer = await fetchAudioVoiceVox(
          screenplay.talk,
          ss.voicevoxStoreSpeaker,
          ss.voicevoxStoreSpeed,
          ss.voicevoxStorePitch,
          ss.voicevoxStoreIntonation,
          true,
          ss.voicevoxStoreServerUrl
        ).catch(() => null)
      } else if (ss.selectVoice == 'aivis_speech_oss') {
        buffer = await fetchAudioAivisSpeech(
          screenplay.talk,
          ss.aivisSpeechSpeaker,
          ss.aivisSpeechSpeed,
          ss.aivisSpeechPitch,
          ss.aivisSpeechIntonation,
          false,
          null
        ).catch(() => null)
      } else if (ss.selectVoice == 'aivis_speech_store') {
        buffer = await fetchAudioAivisSpeech(
          screenplay.talk,
          ss.aivisSpeechStoreSpeaker,
          ss.aivisSpeechStoreSpeed,
          ss.aivisSpeechStorePitch,
          ss.aivisSpeechStoreIntonation,
          true,
          ss.aivisSpeechStoreServerUrl
        ).catch(() => null)
      } else if (ss.selectVoice == 'google') {
        const googleTtsTypeByLang = getGoogleTtsType(
          ss.googleTtsType,
          ss.selectLanguage
        )
        buffer = await fetchAudioGoogle(
          screenplay.talk,
          googleTtsTypeByLang
        ).catch(() => null)
      } else if (ss.selectVoice == 'stylebertvits2') {
        buffer = await fetchAudioStyleBertVITS2(
          screenplay.talk,
          ss.stylebertvits2ServerUrl,
          ss.stylebertvits2ApiKey,
          ss.stylebertvits2ModelId,
          ss.stylebertvits2Style,
          ss.stylebertvits2SdpRatio,
          ss.stylebertvits2Length,
          ss.selectLanguage
        ).catch(() => null)
      } else if (ss.selectVoice == 'gsvitts') {
        buffer = await fetchAudioVoiceGSVIApi(
          screenplay.talk,
          ss.gsviTtsServerUrl,
          ss.gsviTtsModelId,
          ss.gsviTtsBatchSize,
          ss.gsviTtsSpeechRate
        ).catch(() => null)
      } else if (ss.selectVoice == 'elevenlabs') {
        buffer = await fetchAudioElevenlabs(
          screenplay.talk,
          await getAPIKey('elevenlabsApiKey'),
          ss.elevenlabsVoiceId,
          ss.selectLanguage
        ).catch(() => null)
      }
      lastTime = Date.now()
      return buffer
    })

    prevFetchPromise = fetchPromise
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        if (!audioBuffer) {
          return Promise.resolve()
        }
        const hs = homeStore.getState()
        return hs.viewer.model?.speak(audioBuffer, screenplay)
      }
    )
    prevSpeakPromise.then(() => {
      onComplete?.()
    })
  }
}

const createSpeakCharacterCurrentEmotion = () => {
  let lastTime = 0
  let prevFetchPromise: Promise<unknown> = Promise.resolve()
  let prevSpeakPromise: Promise<unknown> = Promise.resolve()
  let abortController: AbortController | null = null

  const speak = (
    talkNoEmotion: TalkNoEmotion,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const hs = homeStore.getState()
    if (!hs.viewer.model) {
      return
    }
    const talk = createTalk(talkNoEmotion, hs.viewer.model.currentEmotion())

    const ss = settingsStore.getState()
    onStart?.()

    if (ss.changeEnglishToJapanese && ss.selectLanguage === 'ja') {
      // 英単語を日本語で読み上げる
      talk.message = convertEnglishToJapaneseReading(talk.message)
    }

    if (!abortController) {
      abortController = new AbortController()
    }
    const signal = abortController.signal

    const fetchPromise = prevFetchPromise.then(async () => {
      if (signal.aborted) return null
      const now = Date.now()
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime))
      }
      if (signal.aborted) return null
      let buffer
      if (ss.selectVoice == 'koeiromap') {
        buffer = await fetchAudio(
          talk,
          await getAPIKey('koeiromapKey'),
          signal
        ).catch(() => null)
      } else if (ss.selectVoice == 'voicevox_oss') {
        buffer = await fetchAudioVoiceVox(
          talk,
          ss.voicevoxSpeaker,
          ss.voicevoxSpeed,
          ss.voicevoxPitch,
          ss.voicevoxIntonation,
          false,
          null,
          signal
        ).catch(() => null)
      } else if (ss.selectVoice == 'voicevox_store') {
        buffer = await fetchAudioVoiceVox(
          talk,
          ss.voicevoxStoreSpeaker,
          ss.voicevoxStoreSpeed,
          ss.voicevoxStorePitch,
          ss.voicevoxStoreIntonation,
          true,
          ss.voicevoxStoreServerUrl,
          signal
        ).catch(() => null)
      } else if (ss.selectVoice == 'aivis_speech_oss') {
        buffer = await fetchAudioAivisSpeech(
          talk,
          ss.aivisSpeechSpeaker,
          ss.aivisSpeechSpeed,
          ss.aivisSpeechPitch,
          ss.aivisSpeechIntonation,
          false,
          null,
          signal
        ).catch(() => null)
      } else if (ss.selectVoice == 'aivis_speech_store') {
        buffer = await fetchAudioAivisSpeech(
          talk,
          ss.aivisSpeechStoreSpeaker,
          ss.aivisSpeechStoreSpeed,
          ss.aivisSpeechStorePitch,
          ss.aivisSpeechStoreIntonation,
          true,
          ss.aivisSpeechStoreServerUrl,
          signal
        ).catch(() => null)
      } else if (ss.selectVoice == 'google') {
        const googleTtsTypeByLang = getGoogleTtsType(
          ss.googleTtsType,
          ss.selectLanguage
        )
        buffer = await fetchAudioGoogle(
          talk,
          googleTtsTypeByLang,
          signal
        ).catch(() => null)
      } else if (ss.selectVoice == 'stylebertvits2') {
        buffer = await fetchAudioStyleBertVITS2(
          talk,
          ss.stylebertvits2ServerUrl,
          ss.stylebertvits2ApiKey,
          ss.stylebertvits2ModelId,
          ss.stylebertvits2Style,
          ss.stylebertvits2SdpRatio,
          ss.stylebertvits2Length,
          ss.selectLanguage,
          signal
        ).catch(() => null)
      } else if (ss.selectVoice == 'gsvitts') {
        buffer = await fetchAudioVoiceGSVIApi(
          talk,
          ss.gsviTtsServerUrl,
          ss.gsviTtsModelId,
          ss.gsviTtsBatchSize,
          ss.gsviTtsSpeechRate,
          signal
        ).catch(() => null)
      } else if (ss.selectVoice == 'elevenlabs') {
        buffer = await fetchAudioElevenlabs(
          talk,
          await getAPIKey('elevenlabsApiKey'),
          ss.elevenlabsVoiceId,
          ss.selectLanguage,
          signal
        ).catch(() => null)
      }
      if (signal.aborted) return null
      lastTime = Date.now()
      return buffer
    })

    prevFetchPromise = fetchPromise
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        if (signal.aborted || !audioBuffer) {
          return Promise.resolve()
        }
        const hs = homeStore.getState()
        return hs.viewer.model?.speakCurrentEmotion(audioBuffer)
      }
    )
    prevSpeakPromise.then(() => {
      onComplete?.()
    })
  }

  const cancelSpeakCharacterCurrentEmotion = async () => {
    console.log('speakCharacterCurrentEmotion cancel')
    if (abortController) {
      console.log('processSpeakContent canel')
      abortController.abort()
    }
    lastTime = 0
    await Promise.all([prevFetchPromise, prevSpeakPromise])
    console.log('speakCharacterCurrentEmotion cancel end')
    lastTime = 0
    abortController = null
  }

  const speakCharacterCurrentEmotion = (
    talkNoEmotion: TalkNoEmotion,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    console.log('speakCharacterCurrentEmotion speak')
    speak(talkNoEmotion, onStart, onComplete)
  }

  return {
    speakCharacterCurrentEmotion,
    cancelSpeakCharacterCurrentEmotion,
  }
}

function convertEnglishToJapaneseReading(text: string): string {
  const sortedKeys = Object.keys(typedEnglishToJapanese).sort(
    (a, b) => b.length - a.length
  )

  return sortedKeys.reduce((result, englishWord) => {
    const japaneseReading = typedEnglishToJapanese[englishWord]
    const regex = new RegExp(`\\b${englishWord}\\b`, 'gi')
    return result.replace(regex, japaneseReading)
  }, text)
}

function getGoogleTtsType(
  googleTtsType: string,
  selectLanguage: Language
): string {
  if (googleTtsType) return googleTtsType
  return getGppgleTtsType(selectLanguage) || ''
}

function getGppgleTtsType(selectLanguage: Language): string {
  switch (selectLanguage) {
    case 'ja':
      return 'ja-JP-Standard-B'
    case 'en':
      return 'en-US-Neural2-F'
    default:
      return 'en-US-Neural2-F'
  }
}

export const speakCharacter = createSpeakCharacter()
export const {
  speakCharacterCurrentEmotion,
  cancelSpeakCharacterCurrentEmotion,
} = createSpeakCharacterCurrentEmotion()

export const fetchAudio = async (
  talk: Talk,
  apiKey: string,
  signal?: AbortSignal
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeVoiceApi(
    talk.message,
    talk.speakerX,
    talk.speakerY,
    talk.style,
    apiKey,
    signal
  )
  const url = ttsVoice.audio

  if (url == null) {
    throw new Error('Something went wrong')
  }

  const resAudio = await fetch(url, { signal })
  const buffer = await resAudio.arrayBuffer()
  return buffer
}

export const fetchAudioVoiceVox = async (
  talk: Talk,
  speaker: string,
  speed: number,
  pitch: number,
  intonation: number,
  isStore: boolean,
  voicevoxServerUrl: string | null = null,
  signal?: AbortSignal
): Promise<ArrayBuffer> => {
  console.log('talk.message:', talk.message)
  console.log('speakerId:', speaker)
  let ttsQueryResponse
  if (isStore) {
    if (!voicevoxServerUrl) {
      throw new Error('voicevoxServerUrl is not set')
    }
    ttsQueryResponse = await fetch(
      voicevoxServerUrl +
        '/audio_query?speaker=' +
        speaker +
        '&text=' +
        encodeURIComponent(talk.message),
      {
        method: 'POST',
      }
    ).catch((error) => {
      console.error('Error fetching TTS query:', error)
      throw error
    })
  } else {
    ttsQueryResponse = await fetch('/api/voicevox_audio_query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        talk,
        speaker,
        speed,
        pitch,
        intonation,
      }),
      signal,
    })
  }
  if (!ttsQueryResponse.ok) {
    throw new Error('Failed to fetch TTS query.')
  }
  const ttsQueryJson = await ttsQueryResponse.json()

  ttsQueryJson['speedScale'] = speed
  ttsQueryJson['pitchScale'] = pitch
  ttsQueryJson['intonationScale'] = intonation
  let synthesisResponse
  if (isStore) {
    if (!voicevoxServerUrl) {
      throw new Error('voicevoxServerUrl is not set')
    }
    synthesisResponse = await fetch(
      voicevoxServerUrl + '/synthesis?speaker=' + speaker,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Transfer-Encoding': 'chunked',
        },
        body: JSON.stringify(ttsQueryJson),
      }
    )
  } else {
    synthesisResponse = await fetch('/api/voicevox_synthesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        speaker,
        ttsQueryJson,
      }),
      signal,
    })
  }
  if (!synthesisResponse.ok) {
    throw new Error('Failed to fetch TTS synthesis result.')
  }
  const blob = await synthesisResponse.blob()
  const buffer = await blob.arrayBuffer()
  return buffer
}

export const fetchAudioAivisSpeech = async (
  talk: Talk,
  speaker: string,
  speed: number,
  pitch: number,
  intonation: number,
  isStore: boolean,
  aivisSpeechServerUrl: string | null = null,
  signal?: AbortSignal
): Promise<ArrayBuffer> => {
  console.log('talk.message:', talk.message)
  console.log('speakerId:', speaker)
  let ttsQueryResponse
  if (isStore) {
    if (!aivisSpeechServerUrl) {
      throw new Error('aivisSpeechServerUrl is not set')
    }
    ttsQueryResponse = await fetch(
      aivisSpeechServerUrl +
        '/audio_query?speaker=' +
        speaker +
        '&text=' +
        encodeURIComponent(talk.message),
      {
        method: 'POST',
      }
    ).catch((error) => {
      console.error('Error fetching TTS query:', error)
      throw error
    })
  } else {
    ttsQueryResponse = await fetch('/api/aivis_speech_audio_query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        talk,
        speaker,
        speed,
        pitch,
        intonation,
      }),
      signal,
    })
  }
  if (!ttsQueryResponse.ok) {
    throw new Error('Failed to fetch TTS query.')
  }
  const ttsQueryJson = await ttsQueryResponse.json()

  ttsQueryJson['speedScale'] = speed
  ttsQueryJson['pitchScale'] = pitch
  ttsQueryJson['intonationScale'] = intonation
  let synthesisResponse
  if (isStore) {
    if (!aivisSpeechServerUrl) {
      throw new Error('aivisSpeechServerUrl is not set')
    }
    synthesisResponse = await fetch(
      aivisSpeechServerUrl + '/synthesis?speaker=' + speaker,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Transfer-Encoding': 'chunked',
        },
        body: JSON.stringify(ttsQueryJson),
      }
    )
  } else {
    synthesisResponse = await fetch('/api/aivis_speech_synthesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        speaker,
        ttsQueryJson,
      }),
      signal,
    })
  }
  if (!synthesisResponse.ok) {
    throw new Error('Failed to fetch TTS synthesis result.')
  }
  const blob = await synthesisResponse.blob()
  const buffer = await blob.arrayBuffer()
  return buffer
}

export const fetchAudioGoogle = async (
  talk: Talk,
  ttsType: string,
  signal?: AbortSignal
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeVoiceGoogleApi(talk.message, ttsType, signal)
  const uint8Array = new Uint8Array(ttsVoice.audio.data)
  const arrayBuffer = uint8Array.buffer

  return arrayBuffer
}

export const fetchAudioStyleBertVITS2 = async (
  talk: Talk,
  stylebertvits2ServerUrl: string,
  stylebertvits2ApiKey: string,
  stylebertvits2ModelId: string,
  stylebertvits2Style: string,
  stylebertvits2SdpRatio: number,
  stylebertvits2Length: number,
  selectLanguage: Language,
  signal?: AbortSignal
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeStyleBertVITS2Api(
    talk.message,
    stylebertvits2ServerUrl,
    stylebertvits2ApiKey,
    stylebertvits2ModelId,
    stylebertvits2Style,
    stylebertvits2SdpRatio,
    stylebertvits2Length,
    selectLanguage,
    signal
  )
  return ttsVoice
}

export const testVoice = async () => {
  const ss = settingsStore.getState()
  const talk: Talk = {
    message: 'ボイスボックスを使用します',
    speakerX: 0,
    speakerY: 0,
    style: 'talk',
  }
  let buffer
  if (ss.selectVoice == 'voicevox_oss') {
    buffer = await fetchAudioVoiceVox(
      talk,
      ss.voicevoxSpeaker,
      ss.voicevoxSpeed,
      ss.voicevoxPitch,
      ss.voicevoxIntonation,
      false,
      null
    ).catch(() => null)
  } else if (ss.selectVoice == 'voicevox_store') {
    buffer = await fetchAudioVoiceVox(
      talk,
      ss.voicevoxStoreSpeaker,
      ss.voicevoxStoreSpeed,
      ss.voicevoxStorePitch,
      ss.voicevoxStoreIntonation,
      true,
      ss.voicevoxStoreServerUrl
    ).catch(() => null)
  } else if (ss.selectVoice == 'aivis_speech_oss') {
    buffer = await fetchAudioAivisSpeech(
      talk,
      ss.aivisSpeechSpeaker,
      ss.aivisSpeechSpeed,
      ss.aivisSpeechPitch,
      ss.aivisSpeechIntonation,
      false,
      null
    ).catch(() => null)
  } else if (ss.selectVoice == 'aivis_speech_store') {
    buffer = await fetchAudioAivisSpeech(
      talk,
      ss.aivisSpeechStoreSpeaker,
      ss.aivisSpeechStoreSpeed,
      ss.aivisSpeechStorePitch,
      ss.aivisSpeechStoreIntonation,
      true,
      ss.aivisSpeechStoreServerUrl
    ).catch(() => null)
  }
  if (buffer) {
    const screenplay: Screenplay = {
      expression: 'neutral',
      talk: talk,
    }
    const hs = homeStore.getState()
    await hs.viewer.model?.speak(buffer, screenplay)
  }
}

export const fetchAudioVoiceGSVIApi = async (
  talk: Talk,
  url: string,
  character: string,
  batchsize: number,
  speed: number,
  signal?: AbortSignal
): Promise<ArrayBuffer> => {
  const style = talk.style !== 'talk' ? talk.style : 'default'
  const response = await fetch(url.replace(/\/$/, ''), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      character: character,
      emotion: style,
      text: talk.message,
      batch_size: batchsize,
      speed: speed.toString(),
      stream: true,
    }),
    signal: signal,
  })

  if (!response.ok) {
    throw new Error('Failed to fetch TTS audio.')
  }

  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  return buffer
}

export const fetchAudioElevenlabs = async (
  talk: Talk,
  apiKey: string,
  voiceId: string,
  language: Language,
  signal?: AbortSignal
): Promise<ArrayBuffer> => {
  const ttsVoice = await synthesizeVoiceElevenlabsApi(
    apiKey,
    talk.message,
    voiceId,
    language,
    signal
  )

  // Convert ArrayBufferLike to ArrayBuffer
  const uint8Array = new Uint8Array(ttsVoice.audio)
  const arrayBuffer = uint8Array.buffer

  return arrayBuffer
}
