import { useTranslation } from 'react-i18next'
import settingsStore from '@/features/stores/settings'
import menuStore from '@/features/stores/menu'
import { TextButton } from '../textButton'
import homeStore from '@/features/stores/home'
import { deleteFile } from '@/utils/fileSystem'
import { Directory } from '@capacitor/filesystem'
import { buildUrl } from '@/utils/buildUrl'

const Character = () => {
  const characterName = settingsStore((s) => s.characterName)
  const { t } = useTranslation()

  const resetVRM = async () => {
    try {
      const hs = homeStore.getState()
      hs.viewer.loadVrm(buildUrl('/AvatarSample_B.vrm'))
      const fileName = settingsStore.getState().savedVRMFileName
      settingsStore.setState({ savedVRMFileName: '' })
      await deleteFile(Directory.Documents, fileName)
      console.log('resetVRM success')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="my-24">
        <div className="my-16 typography-20 font-bold">
          {t('CharacterName')}
        </div>
        <input
          className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
          type="text"
          placeholder={t('CharacterName')}
          value={characterName}
          onChange={(e) =>
            settingsStore.setState({ characterName: e.target.value })
          }
        />
        <div className="mt-24 mb-16 typography-20 font-bold">
          {t('CharacterModelLabel')}
        </div>
        <div className="my-8 flex items-center">
          <TextButton
            onClick={() => {
              const { fileInput } = menuStore.getState()
              fileInput?.click()
            }}
          >
            {t('OpenVRM')}
          </TextButton>
          <TextButton onClick={resetVRM} className="ml-16">
            {t('ResetVRM')}
          </TextButton>
        </div>
      </div>
    </>
  )
}
export default Character
