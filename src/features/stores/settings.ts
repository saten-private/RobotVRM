import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { KoeiroParam, DEFAULT_PARAM } from '@/features/constants/koeiroParam'
import {
  AIService,
  AIVoice,
  Language,
  VoiceLanguage,
} from '../constants/settings'

interface ModelProvider {
  selectAIService: AIService
  selectAIModel: string
  localLlmUrl: string
  selectVoice: AIVoice
  openaiDirectInputModel: string
  openrouterDirectInputModel: string
  anthropicDirectInputModel: string
  googleDirectInputModel: string
  koeiroParam: KoeiroParam
  googleTtsType: string
  voicevoxSpeaker: string
  voicevoxSpeed: number
  voicevoxPitch: number
  voicevoxIntonation: number
  voicevoxStoreServerUrl: string
  voicevoxStoreSpeaker: string
  voicevoxStoreSpeed: number
  voicevoxStorePitch: number
  voicevoxStoreIntonation: number
  aivisSpeechSpeaker: string
  aivisSpeechSpeed: number
  aivisSpeechPitch: number
  aivisSpeechIntonation: number
  aivisSpeechStoreServerUrl: string
  aivisSpeechStoreSpeaker: string
  aivisSpeechStoreSpeed: number
  aivisSpeechStorePitch: number
  aivisSpeechStoreIntonation: number
  aivisSpeechOSSSpeakerJson: string
  aivisSpeechStoreSpeakerJson: string
  stylebertvits2ServerUrl: string
  stylebertvits2ApiKey: string
  stylebertvits2ModelId: string
  stylebertvits2Style: string
  stylebertvits2SdpRatio: number
  stylebertvits2Length: number
  gsviTtsServerUrl: string
  gsviTtsModelId: string
  gsviTtsBatchSize: number
  gsviTtsSpeechRate: number
  elevenlabsVoiceId: string
}

interface Integrations {
  difyUrl: string
  difyConversationId: string
  youtubeMode: boolean
  youtubeLiveId: string
  youtubePlaying: boolean
  youtubeNextPageToken: string
  youtubeContinuationCount: number
  youtubeNoCommentCount: number
  youtubeSleepMode: boolean
  conversationContinuityMode: boolean
}

interface Character {
  savedVRMFileName: string
  savedBackgroundImageFileName: string
  characterName: string
  showAssistantText: boolean
  showCharacterName: boolean
}

interface General {
  selectLanguage: Language
  selectVoiceLanguage: VoiceLanguage
  changeEnglishToJapanese: boolean
  hiddenCameraPreview: boolean
  showControlPanel: boolean
  webSocketMode: boolean
  slideMode: boolean
}

export type SettingsState = ModelProvider & Integrations & Character & General

const settingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Model Provider
      selectAIService:
        (process.env.NEXT_PUBLIC_ROBOTVRM_SELECT_AI_SERVICE as AIService) ||
        'anthropic',
      selectAIModel:
        process.env.NEXT_PUBLIC_ROBOTVRM_SELECT_AI_MODEL ||
        'claude-3-haiku-20240307',
      localLlmUrl: process.env.NEXT_PUBLIC_LOCAL_LLM_URL || '',
      selectVoice:
        (process.env.NEXT_PUBLIC_ROBOTVRM_SELECT_VOICE as AIVoice) ||
        (process.env.NEXT_PUBLIC_ENV === 'store'
          ? 'koeiromap'
          : 'voicevox_oss'),
      openaiDirectInputModel: '',
      openrouterDirectInputModel: '',
      anthropicDirectInputModel: '',
      googleDirectInputModel: '',
      koeiroParam: DEFAULT_PARAM,
      googleTtsType:
        process.env.NEXT_PUBLIC_ROBOTVRM_GOOGLE_TTS_TYPE || 'en-US-Neural2-F',
      voicevoxSpeaker: process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_SPEAKER || '2',
      voicevoxSpeed:
        parseFloat(process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_SPEED || '1.0') ||
        1.0,
      voicevoxPitch:
        parseFloat(process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_PITCH || '0.0') ||
        0.0,
      voicevoxIntonation:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_INTONATION || '1.0'
        ) || 1.0,
      voicevoxStoreServerUrl:
        process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_STORE_SERVER_URL || '',
      voicevoxStoreSpeaker:
        process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_STORE_SPEAKER || '2',
      voicevoxStoreSpeed:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_STORE_SPEED || '1.0'
        ) || 1.0,
      voicevoxStorePitch:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_STORE_PITCH || '0.0'
        ) || 0.0,
      voicevoxStoreIntonation:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_VOICEVOX_STORE_INTONATION || '1.0'
        ) || 1.0,
      aivisSpeechSpeaker:
        process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_SPEAKER || '',
      aivisSpeechSpeed:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_SPEED || '1.0'
        ) || 1.0,
      aivisSpeechPitch:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_PITCH || '0.0'
        ) || 0.0,
      aivisSpeechIntonation:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_INTONATION || '1.0'
        ) || 1.0,
      aivisSpeechStoreServerUrl:
        process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_STORE_SERVER_URL || '',
      aivisSpeechStoreSpeaker:
        process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_STORE_SPEAKER || '',
      aivisSpeechStoreSpeed:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_STORE_SPEED || '1.0'
        ) || 1.0,
      aivisSpeechStorePitch:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_STORE_PITCH || '0.0'
        ) || 0.0,
      aivisSpeechStoreIntonation:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_AIVIS_SPEECH_STORE_INTONATION ||
            '1.0'
        ) || 1.0,
      aivisSpeechOSSSpeakerJson: '',
      aivisSpeechStoreSpeakerJson: '',
      stylebertvits2ServerUrl: '',
      stylebertvits2ModelId:
        process.env.NEXT_PUBLIC_ROBOTVRM_STYLEBERTVITS2_MODEL_ID || '0',
      stylebertvits2ApiKey: '',
      stylebertvits2Style:
        process.env.NEXT_PUBLIC_ROBOTVRM_STYLEBERTVITS2_STYLE || 'Neutral',
      stylebertvits2SdpRatio:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_STYLEBERTVITS2_SDP_RATIO || '0.2'
        ) || 0.2,
      stylebertvits2Length:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_STYLEBERTVITS2_LENGTH || '1.0'
        ) || 1.0,
      gsviTtsServerUrl:
        process.env.NEXT_PUBLIC_ROBOTVRM_GSVI_TTS_URL ||
        'http://127.0.0.1:5000/tts',
      gsviTtsModelId: process.env.NEXT_PUBLIC_ROBOTVRM_GSVI_TTS_MODEL_ID || '0',
      gsviTtsBatchSize:
        parseInt(process.env.NEXT_PUBLIC_ROBOTVRM_GSVI_TTS_BATCH_SIZE || '2') ||
        2,
      gsviTtsSpeechRate:
        parseFloat(
          process.env.NEXT_PUBLIC_ROBOTVRM_GSVI_TTS_SPEECH_RATE || '1.0'
        ) || 1.0,
      elevenlabsVoiceId: '',

      // Integrations
      difyUrl: '',
      difyConversationId: '',
      youtubeMode:
        process.env.NEXT_PUBLIC_YOUTUBE_MODE === 'true' ? true : false,
      youtubeLiveId: process.env.NEXT_PUBLIC_YOUTUBE_LIVE_ID || '',
      youtubePlaying: false,
      youtubeNextPageToken: '',
      youtubeContinuationCount: 0,
      youtubeNoCommentCount: 0,
      youtubeSleepMode: false,
      conversationContinuityMode: false,

      // Character
      savedVRMFileName: '',
      savedBackgroundImageFileName: '',
      characterName:
        process.env.NEXT_PUBLIC_ROBOTVRM_CHARACTER_NAME || 'CHARACTER',
      showAssistantText:
        process.env.NEXT_PUBLIC_ROBOTVRM_SHOW_ASSISTANT_TEXT === 'true'
          ? true
          : false,
      showCharacterName:
        process.env.NEXT_PUBLIC_ROBOTVRM_SHOW_CHARACTER_NAME === 'true'
          ? true
          : false,

      // General
      selectLanguage:
        (process.env.NEXT_PUBLIC_ROBOTVRM_SELECT_LANGUAGE as Language) || 'ja',
      selectVoiceLanguage:
        (process.env
          .NEXT_PUBLIC_ROBOTVRM_SELECT_VOICE_LANGUAGE as VoiceLanguage) ||
        'ja-JP',
      changeEnglishToJapanese:
        process.env.NEXT_PUBLIC_ROBOTVRM_CHANGE_ENGLISH_TO_JAPANESE === 'true',
      hiddenCameraPreview:
        process.env.NEXT_PUBLIC_ROBOTVRM_HIDDEN_CAMERA_PREVIEW === 'true'
          ? true
          : false,
      showControlPanel:
        process.env.NEXT_PUBLIC_ROBOTVRM_SHOW_CONTROL_PANEL !== 'false',
      webSocketMode:
        process.env.NEXT_PUBLIC_WEB_SOCKET_MODE === 'true' ? true : false,
      slideMode:
        process.env.NEXT_PUBLIC_ROBOTVRM_SLIDE_MODE === 'true' ? true : false,
    }),
    {
      name: 'robotvrm-settings',
      partialize: (state) => ({
        selectAIService: state.selectAIService,
        selectAIModel: state.selectAIModel,
        localLlmUrl: state.localLlmUrl,
        selectVoice: state.selectVoice,
        openaiDirectInputModel: state.openaiDirectInputModel,
        openrouterDirectInputModel: state.openrouterDirectInputModel,
        anthropicDirectInputModel: state.anthropicDirectInputModel,
        googleDirectInputModel: state.googleDirectInputModel,
        koeiroParam: state.koeiroParam,
        googleTtsType: state.googleTtsType,
        voicevoxSpeaker: state.voicevoxSpeaker,
        voicevoxSpeed: state.voicevoxSpeed,
        voicevoxPitch: state.voicevoxPitch,
        voicevoxIntonation: state.voicevoxIntonation,
        voicevoxStoreServerUrl: state.voicevoxStoreServerUrl,
        voicevoxStoreSpeaker: state.voicevoxStoreSpeaker,
        voicevoxStoreSpeed: state.voicevoxStoreSpeed,
        voicevoxStorePitch: state.voicevoxStorePitch,
        voicevoxStoreIntonation: state.voicevoxStoreIntonation,
        aivisSpeechSpeaker: state.aivisSpeechSpeaker,
        aivisSpeechSpeed: state.aivisSpeechSpeed,
        aivisSpeechPitch: state.aivisSpeechPitch,
        aivisSpeechIntonation: state.aivisSpeechIntonation,
        aivisSpeechStoreServerUrl: state.aivisSpeechStoreServerUrl,
        aivisSpeechStoreSpeaker: state.aivisSpeechStoreSpeaker,
        aivisSpeechStoreSpeed: state.aivisSpeechStoreSpeed,
        aivisSpeechStorePitch: state.aivisSpeechStorePitch,
        aivisSpeechStoreIntonation: state.aivisSpeechStoreIntonation,
        aivisSpeechOSSSpeakerJson: state.aivisSpeechOSSSpeakerJson,
        aivisSpeechStoreSpeakerJson: state.aivisSpeechStoreSpeakerJson,
        stylebertvits2ServerUrl: state.stylebertvits2ServerUrl,
        stylebertvits2ApiKey: state.stylebertvits2ApiKey,
        stylebertvits2ModelId: state.stylebertvits2ModelId,
        stylebertvits2Style: state.stylebertvits2Style,
        stylebertvits2SdpRatio: state.stylebertvits2SdpRatio,
        stylebertvits2Length: state.stylebertvits2Length,
        gsviTtsServerUrl: state.gsviTtsServerUrl,
        gsviTtsModelId: state.gsviTtsModelId,
        gsviTtsBatchSize: state.gsviTtsBatchSize,
        gsviTtsSpeechRate: state.gsviTtsSpeechRate,
        elevenlabsVoiceId: state.elevenlabsVoiceId,
        difyUrl: state.difyUrl,
        difyConversationId: state.difyConversationId,
        youtubeLiveId: state.youtubeLiveId,
        savedVRMFileName: state.savedVRMFileName,
        savedBackgroundImageFileName: state.savedBackgroundImageFileName,
        characterName: state.characterName,
        hiddenCameraPreview: state.hiddenCameraPreview,
        showAssistantText: state.showAssistantText,
        showCharacterName: state.showCharacterName,
        selectLanguage: state.selectLanguage,
        selectVoiceLanguage: state.selectVoiceLanguage,
        changeEnglishToJapanese: state.changeEnglishToJapanese,
        webSocketMode: state.webSocketMode,
      }),
    }
  )
)
export default settingsStore
