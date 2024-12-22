function createWavHeader(dataLength: number) {
  const buffer = new ArrayBuffer(44)
  const view = new DataView(buffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, 16000, true) // sample rate
  view.setUint32(28, 16000 * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  return buffer
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

interface ElevenLabsRequest {
  message: string
  voiceId?: string
  apiKey?: string
  language?: string
}

class ElevenLabsError extends Error {
  errorCode: string
  statusCode: number

  constructor(message: string, errorCode: string, statusCode: number) {
    super(message)
    this.errorCode = errorCode
    this.statusCode = statusCode
  }
}

export async function elevenLabsTextToSpeech(
  request: ElevenLabsRequest,
  signal?: AbortSignal
): Promise<ArrayBuffer> {
  const { message, voiceId, apiKey, language } = request
  const effectiveVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID
  const effectiveApiKey = apiKey || process.env.ELEVENLABS_API_KEY

  if (!effectiveApiKey) {
    throw new ElevenLabsError('Empty API Key', 'EMPTY_API_KEY', 400)
  }
  if (!effectiveVoiceId) {
    throw new ElevenLabsError('Empty Voice ID', 'EMPTY_VOICE_ID', 400)
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${effectiveVoiceId}?output_format=pcm_16000`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': effectiveApiKey,
          accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: message,
          model_id: 'eleven_turbo_v2_5',
          language_code: language,
        }),
        signal, // Add the AbortSignal here
      }
    )

    if (!response.ok) {
      throw new ElevenLabsError(
        `ElevenLabs APIからの応答が異常です。`,
        'API_RESPONSE_ERROR',
        response.status
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    const wavHeader = createWavHeader(arrayBuffer.byteLength)
    const fullBuffer = new ArrayBuffer(
      wavHeader.byteLength + arrayBuffer.byteLength
    )
    new Uint8Array(fullBuffer).set(new Uint8Array(wavHeader), 0)
    new Uint8Array(fullBuffer).set(
      new Uint8Array(arrayBuffer),
      wavHeader.byteLength
    )

    return fullBuffer
  } catch (error: any) {
    if (error instanceof ElevenLabsError) {
      throw error
    }
    if (error.name === 'AbortError') {
      throw new ElevenLabsError('Request was aborted', 'ABORTED', 499)
    }
    throw new ElevenLabsError(error.message, 'UNKNOWN_ERROR', 500)
  }
}
