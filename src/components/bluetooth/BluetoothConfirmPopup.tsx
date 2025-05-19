import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Dialog } from '@headlessui/react'
import { TextButton } from '../textButton'
import { InAppBrowser } from '@capacitor/inappbrowser'

interface Props {
  onConfirm: (doNotShowAgain: boolean) => void
  onCancel: () => void
}

export const BluetoothConfirmPopup: React.FC<Props> = ({
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation()
  const [doNotShowAgain, setDoNotShowAgain] = React.useState(false)

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <Dialog.Panel className="relative w-[95%] max-w-lg rounded-2xl bg-white/80 backdrop-blur rounded-16 p-8">
        <Dialog.Title className="text-xl font-bold">
          {t('BluetoothConnection')}
        </Dialog.Title>

        <div className="mt-4">
          <p className="text-s text-text1">
            <Trans
              i18nKey="BluetoothPopupMessage"
              components={{
                b: <b />,
              }}
            />
          </p>

          <div className="my-16">
            <TextButton
              onClick={async () =>
                await InAppBrowser.openInExternalBrowser({
                  url: `${process.env.NEXT_PUBLIC_ROBOTVRM_ROBOT_STORE_URL}`,
                })
              }
            >
              {t('RobotStore')}
            </TextButton>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="doNotShowAgain"
              checked={doNotShowAgain}
              onChange={(e) => setDoNotShowAgain(e.target.checked)}
              className="mr-4"
            />
            <label htmlFor="doNotShowAgain">{t('DoNotShowAgain')}</label>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="rounded-oval px-24 py-8 text-sm font-bold hover:bg-surface2 active:bg-surface2-press"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={() => onConfirm(doNotShowAgain)}
            className="rounded-oval bg-secondary px-24 py-8 text-sm font-bold text-white hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
          >
            {t('Connect')}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
