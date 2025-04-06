import type { CapacitorConfig } from '@capacitor/cli'

let config: CapacitorConfig

const baseConfig: CapacitorConfig = {
  appId: 'com.robotvrm.memory',
  appName: '記憶機リン', // 実際のアプリ表示名はそれぞれのプラットフォームで管理されています(なのでここは参照されない)
  webDir: '.next/server/pages',
  plugins: {
    Camera: {
      permissionMethod: 'askForPermission',
    },
  },
  appendUserAgent: 'RobotVRM',
}

switch (process.env.NODE_ENV) {
  case 'production':
    config = {
      ...baseConfig,
      server: {
        url: process.env.ROBOTVRM_PRODUCTION_SERVER_URL,
      },
    }
    break
  default:
    config = {
      ...baseConfig,
      server: {
        url: 'https://' + process.env.ROBOTVRM_DEVELOPMENT_HOST + ':3000',
      },
    }
    break
}

export default config
