const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// .envと.env.localファイルを読み込む
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

// ROBOTVRM_IOS_DEVELOPMENT_TEAMの値を取得
const developmentTeam = process.env.ROBOTVRM_IOS_DEVELOPMENT_TEAM || ''

// Config.xcconfigの内容を生成
const configContent = `DEVELOPMENT_TEAM = ${developmentTeam}
`

// ファイルパスを設定
const configPath = path.join(__dirname, 'ios', 'App', 'App', 'Config.xcconfig')

// ディレクトリが存在しない場合は作成
const dir = path.dirname(configPath)
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}

// ファイルに書き込む
fs.writeFileSync(configPath, configContent)

console.log(`Config.xcconfig file has been generated at ${configPath}`)
