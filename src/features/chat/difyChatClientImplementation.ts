export async function getDifyChatResponseImplemention(
  query:
    | string
    | [{ type: 'text'; text: string }, { type: 'image'; image: string }],
  apiKey: string,
  url: string,
  conversationId: string,
  stream: boolean
) {
  if (!apiKey && !process.env.DIFY_KEY) {
    throw new Error(
      `API request to Dify failed with status ${400} and body ${JSON.stringify({ error: 'Dify Empty API Key', errorCode: 'EmptyAPIKey' })}`
    )
  }
  if (!url && !process.env.DIFY_URL) {
    throw new Error(
      `API request to Dify failed with status ${400} and body ${JSON.stringify({ error: 'Dify Empty API Key', errorCode: 'AIInvalidProperty' })}`
    )
  }

  const headers = {
    Authorization: `Bearer ${apiKey || process.env.DIFY_KEY}`,
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({
    inputs: {},
    query: query,
    response_mode: stream ? 'streaming' : 'blocking',
    conversation_id: conversationId,
    user: 'aituber-kit',
    files: [],
  })

  try {
    const response = await fetch(
      (url?.replace(/\/$/, '') || process.env.DIFY_URL) ?? '',
      {
        method: 'POST',
        headers: headers,
        body: body,
      }
    )

    if (!response.ok) {
      throw new Error(
        `API request to Dify failed with status ${response.status} and body ${JSON.stringify({ error: 'Dify API request failed', errorCode: 'AIAPIError' })}`
      )
    }

    if (stream) {
      return response // stream非対応のようなので現状どちらも同じ
    } else {
      return response
    }
  } catch (error) {
    console.error('Error in Dify API call:', error)
    throw new Error(
      `API request to Dify failed with status ${500} and body ${JSON.stringify({ error: 'Dify Internal Server Error', errorCode: 'AIAPIError' })}`
    )
  }
}
