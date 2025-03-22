// WASM 初期化用
import { Tiktoken } from 'js-tiktoken/lite'
import o200k_base from 'js-tiktoken/ranks/o200k_base'

/**
 * テキストが指定されたトークン数を超える場合に切り詰めます
 * @param text 切り詰める可能性のあるテキスト
 * @param model 使用するモデル名
 * @param maxTokens 最大トークン数
 * @returns 必要に応じて切り詰められたテキスト
 */
export async function truncateToMaxTokens(
  text: string,
  model: string,
  maxTokens: number
): Promise<string> {
  try {
    const encoding = new Tiktoken(o200k_base)
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
    const result = encoding.decode(truncatedTokens)
    return result
  } catch (error) {
    console.error('Error truncating text:', error)
    throw error
  }
}
