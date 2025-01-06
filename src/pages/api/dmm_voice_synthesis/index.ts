import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { text, speaker_id, api_key } = req.body

    // 音声合成を実行
    const response = await fetch(
      `https://api.nijivoice.com/api/platform/v1/voice-actors/${speaker_id}/generate-voice`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': api_key,
        },
        body: JSON.stringify({
          script: text,
          style_id: 1,
          speed: '1.0',
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('API Error:', errorData)
      throw new Error('Failed to synthesize speech')
    }

    const data = await response.json()
    
    // 音声ファイルをダウンロード
    const audioResponse = await fetch(data.generatedVoice.audioFileUrl)
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio file')
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    res.setHeader('Content-Type', 'audio/mp3')
    res.send(Buffer.from(audioBuffer))
  } catch (error) {
    console.error('Error in DMM voice synthesis:', error)
    res.status(500).json({ error: 'Failed to synthesize speech' })
  }
}
