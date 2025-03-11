// WASM 初期化用
import { Tiktoken } from 'tiktoken/lite/init'
import cl100k_base from "tiktoken/encoders/cl100k_base.json"

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
    const encoding = new Tiktoken(
        cl100k_base.bpe_ranks,
        cl100k_base.special_tokens,
        cl100k_base.pat_str
      );
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
