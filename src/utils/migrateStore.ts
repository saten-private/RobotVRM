import {
  getOld20250524SystemPrompt,
  setPrompt,
  removeOld20250524SystemPrompt,
} from '@/features/stores/secureStorage'

const migrateStore = async () => {
  // migrate systemPrompt (first v1)
  const oldSystemPrompt = await getOld20250524SystemPrompt()
  if (oldSystemPrompt) {
    setPrompt('systemPrompt', oldSystemPrompt)
    await removeOld20250524SystemPrompt()
  }
}
export default migrateStore
