import { NextRequest } from 'next/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export const config = {
  runtime: 'edge',
}

const AIVIS_SPEECH_API_URL = 'http://localhost:10101'

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

  const { speaker, ttsQueryJson } = await req.json()

  return await fetchAudioAivisSpeech(speaker, ttsQueryJson)
}

const fetchAudioAivisSpeech = async (
  speaker: string,
  ttsQueryJson: any
): Promise<Response> => {
  console.log('speakerId:', speaker)
  const synthesisResponse = await fetch(
    AIVIS_SPEECH_API_URL + '/synthesis?speaker=' + speaker,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ttsQueryJson),
    }
  )
  return synthesisResponse
}
