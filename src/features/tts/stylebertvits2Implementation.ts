export type stylebertvits2Data = {
  audio?: ArrayBuffer // BufferからArrayBufferに変更
  error?: string
}

export type StyleBertVits2Request = {
  message: string
  stylebertvits2ModelId: string
  stylebertvits2ServerUrl: string
  stylebertvits2ApiKey: string
  stylebertvits2Style: string
  stylebertvits2SdpRatio: string
  stylebertvits2Length: string
  selectLanguage: string
  abortSignal?: AbortSignal // 新しいオプショナルパラメーター
}

// カスタムエラークラスの修正
export class StyleBertVits2Error extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'StyleBertVits2Error'
  }
}

const getLanguageCode = (selectLanguage: string): string => {
  switch (selectLanguage) {
    case 'ja':
      return 'JP'
    case 'en':
      return 'EN'
    case 'zh':
      return 'ZH'
    case 'zh-TW':
      return 'ZH'
    case 'ko':
      return 'EN'
    default:
      return 'JP'
  }
}

export async function handleStyleBertVits2Request(
  request: StyleBertVits2Request,
  abortSignal?: AbortSignal
): Promise<ArrayBuffer> {
  const {
    message,
    stylebertvits2ModelId,
    stylebertvits2ServerUrl,
    stylebertvits2ApiKey,
    stylebertvits2Style,
    stylebertvits2SdpRatio,
    stylebertvits2Length,
    selectLanguage,
  } = request

  const languageCode = getLanguageCode(selectLanguage)

  try {
    if (!stylebertvits2ServerUrl.includes('https://api.runpod.ai')) {
      const queryParams = new URLSearchParams({
        text: message,
        model_id: stylebertvits2ModelId,
        style: stylebertvits2Style,
        sdp_ratio: stylebertvits2SdpRatio,
        length: stylebertvits2Length,
        language: languageCode,
      })

      const voice = await fetch(
        `${stylebertvits2ServerUrl.replace(/\/$/, '')}/voice?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'audio/wav',
          },
          signal: abortSignal, // AbortSignalを追加
        }
      )

      if (!voice.ok) {
        throw new StyleBertVits2Error(
          voice.status,
          `サーバーからの応答が異常です。ステータスコード: ${voice.status}`
        )
      }

      return await voice.arrayBuffer()
    } else {
      const voice = await fetch(
        `${stylebertvits2ServerUrl.replace(/\/$/, '')}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${stylebertvits2ApiKey}`,
          },
          body: JSON.stringify({
            input: {
              action: '/voice',
              model_id: stylebertvits2ModelId,
              text: message,
              style: stylebertvits2Style,
              sdp_ratio: stylebertvits2SdpRatio,
              length: stylebertvits2Length,
              language: languageCode,
            },
          }),
          signal: abortSignal, // AbortSignalを追加
        }
      )

      if (!voice.ok) {
        throw new StyleBertVits2Error(
          voice.status,
          `サーバーからの応答が異常です。ステータスコード: ${voice.status}`
        )
      }

      return await voice.arrayBuffer()
    }
  } catch (error: any) {
    if (error instanceof StyleBertVits2Error) {
      throw error
    } else if (error.name === 'AbortError') {
      throw new StyleBertVits2Error(499, 'リクエストがキャンセルされました')
    } else {
      throw new StyleBertVits2Error(500, error.message)
    }
  }
}
