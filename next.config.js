/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  assetPrefix: process.env.BASE_PATH || '',
  basePath: process.env.BASE_PATH || '',
  trailingSlash: true,
  publicRuntimeConfig: {
    root: process.env.BASE_PATH || '',
    // ビルド時のタイムスタンプを追加
    buildTime: new Date().toISOString(),
    appId: 'com.robotvrm.first',
  },
  // 静的ファイルの出力時にタイムスタンプをファイル名に付与
  generateBuildId: async () => {
    return `build-${new Date().getTime()}`
  },
  optimizeFonts: false,
  async headers() {
    const headers = [
      {
        key: 'Content-Security-Policy',
        // connect-srcでblod(Binary Large Object)を許容しなければVRMが読み込まれなかった
        // style-srcのunsafe-evalを消すにはnonce対応が必要。但し、以下にあるようにstyle-srcのみで許容する形であれば比較的リスクが低いので許容とする
        // https://reesmorris.co.uk/blog/implementing-proper-csp-nextjs-styled-components
        // > So long as we're talking exclusively about using 'unsafe-inline' in the context of styling and never for scripts, my opinion is that you should be fine.
        // Next.jsだと開発環境のみscript-srcに'unsafe-eval'を設定しないと動かないので開発環境のみ許容する。以下によると仕方ないらしい
        // https://github.com/vercel/next.js/issues/14221#issuecomment-657258278
        value: `default-src 'self'; script-src 'self'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*${process.env.NODE_ENV === 'development' ? ' wss://' + process.env.ROBOTVRM_DEVELOPMENT_HOST + ':*' : ''} data: blob:;`,
      },
    ]

    // Strict-Transport-Securityヘッダーを追加してSSLを強制する
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security#preloading_strict_transport_security
    headers.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    })

    return [
      {
        source: '/(.*)',
        headers: headers,
      },
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
