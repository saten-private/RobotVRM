export async function synthesizeVoiceGoogleApi(
  message: string,
  ttsType: string,
  signal?: AbortSignal
) {
  let data
  const body = {
    message: message,
    ttsType: ttsType,
  }
  // GCPの認証のためサーバーでしか実行できない
  const res = await fetch('/api/googleTts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: signal,
  })
  data = (await res.json()) as any
  return { audio: data.audio }
}
