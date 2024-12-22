import { Language } from '@/features/constants/settings'
import { handleStyleBertVits2Request } from '@/features/tts/stylebertvits2Implementation'

export async function synthesizeStyleBertVITS2Api(
  message: string,
  stylebertvits2ServerUrl: string,
  stylebertvits2ApiKey: string,
  stylebertvits2ModelId: string,
  stylebertvits2Style: string,
  stylebertvits2SdpRatio: number,
  stylebertvits2Length: number,
  selectLanguage: Language,
  signal?: AbortSignal
) {
  try {
    const body = {
      message: message,
      stylebertvits2ServerUrl: stylebertvits2ServerUrl,
      stylebertvits2ApiKey: stylebertvits2ApiKey,
      stylebertvits2ModelId: stylebertvits2ModelId,
      stylebertvits2Style: stylebertvits2Style,
      stylebertvits2SdpRatio: stylebertvits2SdpRatio.toString(),
      stylebertvits2Length: stylebertvits2Length.toString(),
      selectLanguage: selectLanguage,
    }
    let buffer: ArrayBuffer
    if (process.env.NEXT_PUBLIC_ROBOTVRM_USE_SERVER === 'true') {
      console.log('use server')
      const res = await fetch('/api/stylebertvits2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: signal,
      })

      if (!res.ok) {
        throw new Error(
          `APIからの応答が異常です。ステータスコード: ${res.status}`
        )
      }
      buffer = await res.arrayBuffer()
    } else {
      console.log('use client')
      buffer = await handleStyleBertVits2Request(body, signal)
    }
    return buffer
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('リクエストが中断されました')
    }
    throw new Error(`APIリクエスト中にエラーが発生しました: ${error.message}`)
  }
}
