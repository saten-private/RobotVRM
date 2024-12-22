import { Talk } from '@/features/messages/messages'
import { NextRequest } from 'next/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export const config = {
  runtime: 'edge',
}

const VOICE_VOX_API_URL = 'http://localhost:50021'

export default async function handler(req: NextRequest) {
  if (!/RobotVRM/.test(req.headers.get('user-agent') ?? '')) {
    return new Response(
      JSON.stringify({
        error: 'This page could not be found.',
        errorCode: 'PAGE_NOT_FOUND',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method Not Allowed',
        errorCode: 'METHOD_NOT_ALLOWED',
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  const { talk, speaker } = await req.json()

  return await fetchAudioVoiceVox(talk, speaker)
}

const fetchAudioVoiceVox = async (
  talk: Talk,
  speaker: string
): Promise<Response> => {
  console.log('talk.message:', talk.message)
  console.log('speakerId:', speaker)
  const ttsQueryResponse = await fetch(
    VOICE_VOX_API_URL +
      '/audio_query?speaker=' +
      speaker +
      '&text=' +
      encodeURIComponent(talk.message),
    {
      method: 'POST',
    }
  )
  return ttsQueryResponse
}
