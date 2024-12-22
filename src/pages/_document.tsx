import { Html, Head, Main, NextScript } from 'next/document'

// ネイティブ以外からアクセスされた場合はアクセス拒否
export async function getServerSideProps(context: any) {
  if (!/RobotVRM/.test(context.req.headers['user-agent'])) {
    return {
      redirect: {
        destination: '/access-denied',
        permanent: false,
      },
    }
  }

  return {
    props: {}, // 通常のプロップスを返す
  }
}

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+2&family=Montserrat&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
