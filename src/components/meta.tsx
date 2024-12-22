import { buildUrl } from '@/utils/buildUrl'
import Head from 'next/head'
export const Meta = () => {
  const title = 'RobotVRM'
  const description =
    'このアプリは自律的に動くことを目指しているアプリです。カメラで周りを観察し話したり、3Dキャラクターが表情を変えたりします。一部のBluetoothデバイスとも接続可能でArduinoと組み合わせることでロボットにすることもできます。'
  return (
    <Head>
      <title>{title}</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <meta name="cache-param" content="EyGNymw6HsEFxYk" />
      <meta name="description" content={description} />
    </Head>
  )
}
