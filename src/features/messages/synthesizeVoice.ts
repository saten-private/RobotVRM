import { reduceTalkStyle } from '@/utils/reduceTalkStyle'
import { koeiromapV0 } from '../tts/koeiromapImplementation'
import { TalkStyle } from '../messages/messages'

export async function synthesizeVoice(
  message: string,
  speakerX: number,
  speakerY: number,
  style: TalkStyle,
  signal?: AbortSignal
) {
  const koeiroRes = await koeiromapV0(
    message,
    speakerX,
    speakerY,
    style,
    signal
  )
  return { audio: koeiroRes.audio }
}

export async function synthesizeVoiceApi(
  message: string,
  speakerX: number,
  speakerY: number,
  style: TalkStyle,
  apiKey: string,
  signal?: AbortSignal
) {
  // Free向けに感情を制限する
  const reducedStyle = reduceTalkStyle(style)

  // CORSの関係でサーバーでしかAPIを叩けないようなので、一律サーバーのmiddlewareでAPIを叩く
  const body = {
    message: message,
    speakerX: speakerX,
    speakerY: speakerY,
    style: reducedStyle,
    apiKey: apiKey,
  }
  const res = await fetch('/api/koeiromapFreeV1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: signal,
  })
  const data = (await res.json()) as any

  return { audio: data.audio }
}
