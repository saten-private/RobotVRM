import { useTranslation } from 'react-i18next'

import menuStore from '@/features/stores/menu'
import { TextButton } from '../textButton'
import homeStore from '@/features/stores/home'
import { deleteFile } from '@/utils/fileSystem'
import { Directory } from '@capacitor/filesystem'
import settingsStore from '@/features/stores/settings'

const Environment = () => {
  const { t } = useTranslation()

  const resetBackgroundImage = async () => {
    try {
      homeStore.setState({ backgroundImageUrl: '/bg-c.png' })
      const fileName = settingsStore.getState().savedBackgroundImageFileName
      settingsStore.setState({ savedBackgroundImageFileName: '' })
      await deleteFile(Directory.Documents, fileName)
      console.log('resetBackgroundImage success')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="my-24">
      <div className="my-16 typography-20 font-bold">
        {t('BackgroundImage')}
      </div>
      <div className="my-8 flex items-center">
        <TextButton
          onClick={() => {
            const { bgFileInput } = menuStore.getState()
            bgFileInput?.click()
          }}
        >
          {t('ChangeBackgroundImage')}
        </TextButton>
        <TextButton onClick={resetBackgroundImage} className="ml-16">
          {t('ResetBackgroundImage')}
        </TextButton>
      </div>
    </div>
  )
}
export default Environment
