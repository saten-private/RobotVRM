import type { NextApiRequest, NextApiResponse } from 'next'
import {
  handleStyleBertVits2Request,
  StyleBertVits2Error,
} from '@/features/tts/stylebertvits2Implementation'

// API ルートハンドラーの修正
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | { error: string }>
) {
  if (!/RobotVRM/.test(req.headers['user-agent'] ?? '')) {
    return res.status(404).json({
      error: 'This page could not be found.',
    })
  }

  try {
    const body = req.body
    const buffer = await handleStyleBertVits2Request({
      message: body.message,
      stylebertvits2ModelId: body.stylebertvits2ModelId,
      stylebertvits2ServerUrl:
        body.stylebertvits2ServerUrl || process.env.STYLEBERTVITS2_SERVER_URL,
      stylebertvits2ApiKey:
        body.stylebertvits2ApiKey || process.env.STYLEBERTVITS2_API_KEY,
      stylebertvits2Style: body.stylebertvits2Style,
      stylebertvits2SdpRatio: body.stylebertvits2SdpRatio,
      stylebertvits2Length: body.stylebertvits2Length,
      selectLanguage: body.selectLanguage,
    })

    // ArrayBufferをBufferに変換
    const nodeBuffer = Buffer.from(buffer)

    res.writeHead(200, {
      'Content-Type': 'audio/wav',
      'Content-Length': nodeBuffer.length,
    })
    res.end(nodeBuffer)
  } catch (error: any) {
    if (error instanceof StyleBertVits2Error) {
      res.status(error.statusCode || 500).json({ error: error.message })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
}
