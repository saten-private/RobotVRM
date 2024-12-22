import type { NextApiRequest, NextApiResponse } from 'next'
import { elevenLabsTextToSpeech } from '@/features/tts/elevenLabsImplementation'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | { error: string; errorCode: string }>
) {
  if (!/RobotVRM/.test(req.headers['user-agent'] ?? '')) {
    return res.status(404).json({
      error: 'This page could not be found.',
      errorCode: 'PAGE_NOT_FOUND',
    })
  }

  try {
    const arrayBuffer = await elevenLabsTextToSpeech(req.body)
    // ArrayBufferをBufferに変換
    const buffer = Buffer.from(arrayBuffer)
    res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Content-Length': buffer.length,
    })
    res.end(buffer)
  } catch (error: any) {
    res
      .status(error.statusCode || 500)
      .json({ error: error.message, errorCode: error.errorCode })
  }
}
