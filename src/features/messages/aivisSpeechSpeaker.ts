export const fetchAudioAivisSpeechSpeakerJson = async (
  isStore: boolean,
  aivisSpeechServerUrl: string | null = null,
  signal?: AbortSignal
): Promise<any> => {
  let ttsQueryResponse
  if (isStore) {
    if (!aivisSpeechServerUrl) {
      throw new Error('aivisSpeechServerUrl is not set')
    }
    ttsQueryResponse = await fetch(aivisSpeechServerUrl + '/speakers', {
      method: 'GET',
    }).catch((error) => {
      console.error('Error fetching TTS query:', error)
      throw error
    })
  } else {
    ttsQueryResponse = await fetch('/api/aivis_speech_speakers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    })
  }
  if (!ttsQueryResponse.ok) {
    throw new Error('Failed to fetch TTS query.')
  }
  const speakerJson = await ttsQueryResponse.json()
  return speakerJson
}
