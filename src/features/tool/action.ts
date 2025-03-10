export type Action = {
  role: string // "assistant" | "system" | "user";
  content:
    | string
    | ({ type: 'text'; text: string } | { type: 'image'; image: string })[] // マルチモーダル拡張
}
