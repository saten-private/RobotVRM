import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import libraryLicenses from '../../../public/libraries_licenses.json'
import forkLicenses from '../../../public/fork_licenses.json'
import { TextButton } from '../textButton'

type License = {
  licenses: string
  repository?: string
  publisher?: string
  email?: string
  url?: string
  path?: string
  licenseFile?: string
}

const LicenseInfo = ({
  name,
  info,
  isFork,
}: {
  name: string
  info: License
  isFork?: boolean
}) => {
  const { t } = useTranslation()

  return (
    <div className="border-b pb-8">
      <h3 className="font-bold">{isFork ? t(name) : name}</h3>
      <p>License: {info.licenses}</p>
      {info.repository && (
        <p>
          Repository:{' '}
          <a
            href={info.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {info.repository}
          </a>
        </p>
      )}
      {info.publisher && <p>Publisher: {info.publisher}</p>}
      {info.path && <p>Path: {isFork ? t(info.path) : info.path}</p>}
      {info.email && <p>Email: {info.email}</p>}
      {info.url && (
        <p>
          URL:{' '}
          <a
            href={info.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {info.url}
          </a>
        </p>
      )}
    </div>
  )
}

const Licenses = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="my-40">
        <TextButton onClick={() => setIsOpen(true)}>
          {t('ShowOSSLicenses')}
        </TextButton>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-24 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-16">
              <h2 className="text-xl font-bold">{t('OSSLicenses')}</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Fork Licenses Section */}
            <div className="mb-24 bg-blue-50 p-16 rounded-lg">
              <h2 className="text-lg font-bold mb-16 text-blue-800">
                Fork Licenses
              </h2>
              <div className="space-y-16">
                {Object.entries(forkLicenses).map(([name, info]) => (
                  <LicenseInfo
                    key={name}
                    name={name}
                    info={info}
                    isFork={true}
                  />
                ))}
              </div>
            </div>

            {/* Library Licenses Section */}
            <div className="space-y-16">
              <h2 className="text-lg font-bold mb-16">Library Licenses</h2>
              {Object.entries(libraryLicenses).map(([name, info]) => (
                <LicenseInfo
                  key={name}
                  name={name}
                  info={info}
                  isFork={false}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Licenses
