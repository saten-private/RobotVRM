interface DmmVoiceResponse {
  audio: ArrayBuffer
}

export async function synthesizeVoiceDmmApi(
  text: string,
  speaker: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<DmmVoiceResponse> {
  const response = await fetch('/api/dmm_voice_synthesis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      speaker_id: speaker,
      api_key: apiKey,
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error('Failed to synthesize speech with DMM Voice')
  }

  const audioBuffer = await response.arrayBuffer()
  return { audio: audioBuffer }
}
