import { encoding_for_model } from "tiktoken"

/**
 * テキストが指定されたトークン数を超える場合に切り詰めます
 * @param text 切り詰める可能性のあるテキスト
 * @param model 使用するモデル名
 * @param maxTokens 最大トークン数
 * @returns 必要に応じて切り詰められたテキスト
 */
export function truncateToMaxTokens(
  text: string,
  model: string,
  maxTokens: number
): string {
  try {
    // モデルに応じたエンコーディングを取得
    const encoding = encoding_for_model('gpt-4o')
    // テキストをトークンに変換
    const tokens = encoding.encode(text)
    // Claude-3の場合は20%余分に切り詰める
    const adjustedMaxTokens = model.toLowerCase().startsWith('claude-3')
      ? Math.floor(maxTokens * 0.8)
      : maxTokens
    // トークンを切り詰め
    const truncatedTokens = tokens.slice(0, adjustedMaxTokens)
    // トークンをテキストに戻す
    const decoder = new TextDecoder()
    const result = decoder.decode(encoding.decode(truncatedTokens))
    encoding.free() // メモリリーク防止
    return result
  } catch (error) {
    console.error('Error truncating text:', error)
    throw error
  }
}
