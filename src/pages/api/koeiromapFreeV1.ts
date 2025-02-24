import { koeiromapFreeV1 } from '@/features/tts/koeiromapImplementation'

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
  const speakerX = req.body.speakerX
  const speakerY = req.body.speakerY
  const style = req.body.style
  const apiKey = req.body.apiKey

  const voice = await koeiromapFreeV1(
    message,
    speakerX,
    speakerY,
    style,
    apiKey
  )

  res.status(200).json(voice)
}
