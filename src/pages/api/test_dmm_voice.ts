import type { NextApiRequest, NextApiResponse } from 'next'
import settingsStore from '../../features/stores/settings'
import { getAPIKey } from '../../features/stores/secureStorage'
import { testVoice } from '../../features/messages/speakCharacter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // DMMボイスを選択
    settingsStore.setState({
      selectVoice: 'dmm',
      dmmSpeaker: '1', // テスト用の話者ID
    })

    // テスト音声を生成
    await testVoice()

    res.status(200).json({ message: 'Test voice generated successfully' })
  } catch (error) {
    console.error('Error in test voice:', error)
    res.status(500).json({ error: 'Failed to generate test voice' })
  }
}
