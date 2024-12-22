import { googleTts } from '@/features/tts/googleTtsImplementation'

import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  audio: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | { error: string; errorCode: string }>
) {
  if (!/RobotVRM/.test(req.headers['user-agent'] ?? '')) {
    return res.status(404).json({
      error: 'This page could not be found.',
      errorCode: 'PAGE_NOT_FOUND',
    })
  }

  const message = req.body.message
  const ttsType = req.body.ttsType

  const voice = await googleTts(message, ttsType)

  res.status(200).json(voice)
}
