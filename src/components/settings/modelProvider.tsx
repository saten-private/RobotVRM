import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import homeStore from '@/features/stores/home'
import menuStore from '@/features/stores/menu'
import settingsStore from '@/features/stores/settings'
import slideStore from '@/features/stores/slide'
import { Link } from '../link'
import { TextButton } from '../textButton'
import { multiModalAIServices } from '@/features/stores/secureStorage'
import {
  getAPIKey,
  setAPIKey,
  getPrompt,
  setPrompt,
} from '@/features/stores/secureStorage'

const ModelProvider = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState({
    openaiKey: '',
    openrouterKey: '',
    anthropicKey: '',
    googleKey: '',
    azureKey: '',
    groqKey: '',
    cohereKey: '',
    mistralaiKey: '',
    perplexityKey: '',
    fireworksKey: '',
    difyKey: '',
  })
  const [systemPrompt, setSystemPrompt] = useState('')

  const webSocketMode = settingsStore((s) => s.webSocketMode)

  const selectAIService = settingsStore((s) => s.selectAIService)
  const selectAIModel = settingsStore((s) => s.selectAIModel)
  const openaiDirectInputModel = settingsStore((s) => s.openaiDirectInputModel)
  const openrouterDirectInputModel = settingsStore(
    (s) => s.openrouterDirectInputModel
  )
  const anthropicDirectInputModel = settingsStore(
    (s) => s.anthropicDirectInputModel
  )
  const googleDirectInputModel = settingsStore((s) => s.googleDirectInputModel)
  const localLlmUrl = settingsStore((s) => s.localLlmUrl)

  const difyUrl = settingsStore((s) => s.difyUrl)

  const { t } = useTranslation()

  // オブジェクトを定義して、各AIサービスのデフォルトモデルを保存する
  // ローカルLLMが選択された場合、AIモデルを空文字に設定
  const defaultModels = {
    openai: 'gpt-4o',
    openrouter: 'openai/o1',
    anthropic: 'claude-3-haiku-20240307',
    google: 'gemini-1.5-pro-latest',
    googleVertexAI: 'gemini-1.5-pro-002',
    azure: '',
    groq: 'gemma-7b-it',
    cohere: 'command-r-plus',
    mistralai: 'mistral-large-latest',
    perplexity: 'llama-3-sonar-large-32k-online',
    fireworks: 'accounts/fireworks/models/firefunction-v2',
    localLlm: '',
    dify: '',
  }

  const handleAIServiceChange = useCallback(
    (newService: keyof typeof defaultModels) => {
      settingsStore.setState({
        selectAIService: newService,
        selectAIModel: defaultModels[newService],
      })

      if (!multiModalAIServices.includes(newService as any)) {
        homeStore.setState({ modalImage: '' })
        menuStore.setState({ showWebcam: false })

        settingsStore.setState({
          conversationContinuityMode: false,
          slideMode: false,
        })
        slideStore.setState({
          isPlaying: false,
        })
      }
      homeStore.setState({ validateApiKey: true })
    },
    []
  )

  useEffect(() => {
    const fetchApiKeys = async () => {
      setIsLoading(true)
      try {
        const keys = await Promise.all([
          getAPIKey('openaiKey'),
          getAPIKey('openrouterKey'),
          getAPIKey('anthropicKey'),
          getAPIKey('googleKey'),
          getAPIKey('azureKey'),
          getAPIKey('groqKey'),
          getAPIKey('cohereKey'),
          getAPIKey('mistralaiKey'),
          getAPIKey('perplexityKey'),
          getAPIKey('fireworksKey'),
          getAPIKey('difyKey'),
          getPrompt('systemPrompt'),
        ])
        setApiKeys({
          openaiKey: keys[0],
          openrouterKey: keys[1],
          anthropicKey: keys[2],
          googleKey: keys[3],
          azureKey: keys[4],
          groqKey: keys[5],
          cohereKey: keys[6],
          mistralaiKey: keys[7],
          perplexityKey: keys[8],
          fireworksKey: keys[9],
          difyKey: keys[10],
        })
        setSystemPrompt(keys[11])
      } catch (error) {
        console.error('Failed to fetch API keys:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiKeys()
  }, [])

  if (isLoading) {
    return <div>Loading...</div> // ローディングインジケーター
  }

  if (webSocketMode) {
    return null
  }

  const handleOpenAIModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    if (selectedValue === 'direct-input') {
      settingsStore.setState({ selectAIModel: openaiDirectInputModel })
    } else {
      settingsStore.setState({ selectAIModel: selectedValue })
    }
  }

  const handleOpenRouterModelChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = e.target.value
    if (selectedValue === 'direct-input') {
      settingsStore.setState({ selectAIModel: openrouterDirectInputModel })
    } else {
      settingsStore.setState({ selectAIModel: selectedValue })
    }
  }

  const handleAnthropicModelChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = e.target.value
    if (selectedValue === 'direct-input') {
      settingsStore.setState({ selectAIModel: anthropicDirectInputModel })
    } else {
      settingsStore.setState({ selectAIModel: selectedValue })
    }
  }

  const handleGoogleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    if (selectedValue === 'direct-input') {
      settingsStore.setState({ selectAIModel: googleDirectInputModel })
    } else {
      settingsStore.setState({ selectAIModel: selectedValue })
    }
  }

  function handleOpenAIDirectInputModelChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = e.target.value
    settingsStore.setState({ openaiDirectInputModel: value })
    settingsStore.setState({ selectAIModel: value })
  }

  function handleOpenRouterDirectInputModelChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = e.target.value
    settingsStore.setState({ openrouterDirectInputModel: value })
    settingsStore.setState({ selectAIModel: value })
  }

  function handleAnthropicDirectInputModelChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = e.target.value
    settingsStore.setState({ anthropicDirectInputModel: value })
    settingsStore.setState({ selectAIModel: value })
  }

  function handleGoogleDirectInputModelChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = e.target.value
    settingsStore.setState({ googleDirectInputModel: value })
    settingsStore.setState({ selectAIModel: value })
  }

  return (
    <div className="my-40">
      <div className="my-16 typography-20 font-bold">
        {t('SelectAIService')}
      </div>
      <div className="my-8">
        <select
          className="px-16 py-8 bg-surface1 hover:bg-surface1-hover rounded-8"
          value={selectAIService}
          onChange={(e) =>
            handleAIServiceChange(e.target.value as keyof typeof defaultModels)
          }
        >
          {process.env.NEXT_PUBLIC_ENV === 'store' ? (
            <>
              <option value="anthropic">Anthropic</option>
              {/* Gemini 1.5 ProでもBluetoothのtoolが上手く動かないのとCORSの影響でサーバーを介さないとダメでサーバーでのtoolの処理の負担が大きそうだったので無効化<option value="google">Google AI Studio</option> */}
              <option value="openai">OpenAI</option>
              {/* o1でもBluetoothのtoolが上手く動かないのとCORSの影響でサーバーを介さないとダメでサーバーでのtoolの処理の負担が大きそうだったので無効化<option value="openrouter">OpenRouter</option> */}
              <option value="azure">Azure OpenAI</option>
            </>
          ) : (
            <>
              <option value="anthropic">Anthropic</option>
              <option value="openai">OpenAI</option>
              {/* o1でもBluetoothのtoolが上手く動かないのとCORSの影響でサーバーを介さないとダメでサーバーでのtoolの処理の負担が大きそうだったので無効化<option value="openrouter">OpenRouter</option> */}
              <option value="azure">Azure OpenAI</option>
              <option value="google">Google AI Studio</option>
              {/* toolChoice: requireをサポートしていないので無効化<option value="googleVertexAI">Google Vertex AI</option> */}
              {/* マルチモーダルでないLLMを無効化<option value="groq">Groq</option> */}
              {/* マルチモーダルでないLLMを無効化<option value="cohere">Cohere</option> */}
              {/* マルチモーダルでないLLMを無効化<option value="mistralai">Mistral AI</option> */}
              {/* マルチモーダルでないLLMを無効化<option value="perplexity">Perplexity</option> */}
              {/* マルチモーダルでないLLMを無効化<option value="fireworks">Fireworks</option> */}
              {/* RobotVRMサーバーでのtoolの対応がまだできていないので無効化<option value="localLlm">{t('LocalLLM')}</option> */}
              {/* RobotVRMサーバーでのtoolの対応がまだできていないので無効化<option value="dify">Dify</option> */}
            </>
          )}
        </select>
      </div>

      {(() => {
        if (selectAIService === 'openai') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('OpenAIAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://platform.openai.com/account/api-keys"
                    label="OpenAI"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="sk-..."
                  value={apiKeys.openaiKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      openaiKey: e.target.value,
                    }))
                    await setAPIKey('openaiKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={
                    selectAIModel === openaiDirectInputModel
                      ? 'direct-input'
                      : selectAIModel
                  }
                  onChange={handleOpenAIModelChange}
                >
                  {/* o1だとtoolが全然呼ばれなかったので無効化<option value="o1">o1</option> */}
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  {/* マルチモーダルでないLLMを無効化<option value="chatgpt-4o-latest">chatgpt-4o-latest</option> */}
                  <option value="gpt-4-turbo">gpt-4-turbo</option>
                  <option value="direct-input">{t('DirectInputModel')}</option>
                </select>
                {selectAIModel === openaiDirectInputModel && (
                  <input
                    className="mt-8 px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="gpt..."
                    value={openaiDirectInputModel}
                    onChange={handleOpenAIDirectInputModelChange}
                  />
                )}
              </div>
            </>
          )
        } else if (selectAIService === 'openrouter') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('OpenRouterAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://openrouter.ai/settings/keys"
                    label="OpenRouter"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="sk-..."
                  value={apiKeys.openrouterKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      openrouterKey: e.target.value,
                    }))
                    await setAPIKey('openrouterKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={
                    selectAIModel === openrouterDirectInputModel
                      ? 'direct-input'
                      : selectAIModel
                  }
                  onChange={handleOpenRouterModelChange}
                >
                  <option value="openai/o1">openai/o1</option>
                  <option value="direct-input">{t('DirectInputModel')}</option>
                </select>
                {selectAIModel === openrouterDirectInputModel && (
                  <input
                    className="mt-8 px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="gpt..."
                    value={openrouterDirectInputModel}
                    onChange={handleOpenRouterDirectInputModelChange}
                  />
                )}
              </div>
            </>
          )
        } else if (selectAIService === 'anthropic') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('AnthropicAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link url="https://console.anthropic.com" label="Anthropic" />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.anthropicKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      anthropicKey: e.target.value,
                    }))
                    await setAPIKey('anthropicKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={
                    selectAIModel === anthropicDirectInputModel
                      ? 'direct-input'
                      : selectAIModel
                  }
                  onChange={handleAnthropicModelChange}
                >
                  <option value="claude-3-haiku-20240307">
                    claude-3-haiku-20240307
                  </option>
                  <option value="claude-3-5-sonnet-20241022">
                    claude-3-5-sonnet-20241022
                  </option>
                  <option value="claude-3-5-sonnet-20240620">
                    claude-3-5-sonnet-20240620
                  </option>
                  <option value="claude-3-opus-20240229">
                    claude-3-opus-20240229
                  </option>
                  <option value="claude-3-sonnet-20240229">
                    claude-3-sonnet-20240229
                  </option>
                  <option value="direct-input">{t('DirectInputModel')}</option>
                </select>
                {selectAIModel === anthropicDirectInputModel && (
                  <input
                    className="mt-8 px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="claude..."
                    value={anthropicDirectInputModel}
                    onChange={handleAnthropicDirectInputModelChange}
                  />
                )}
              </div>
            </>
          )
        } else if (selectAIService === 'google') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('GoogleAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://aistudio.google.com/app/apikey?hl=ja"
                    label="Google AI Studio"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.googleKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      googleKey: e.target.value,
                    }))
                    await setAPIKey('googleKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={
                    selectAIModel === googleDirectInputModel
                      ? 'direct-input'
                      : selectAIModel
                  }
                  onChange={handleGoogleModelChange}
                >
                  <option value="gemini-1.5-pro-latest">
                    gemini-1.5-pro-latest
                  </option>
                  <option value="gemini-1.5-pro-exp-0827">
                    gemini-1.5-pro-exp-0827
                  </option>
                  <option value="gemini-1.5-flash-exp-0827">
                    gemini-1.5-flash-exp-0827
                  </option>
                  <option value="gemini-1.5-flash-8b-exp-0827">
                    gemini-1.5-flash-8b-exp-0827
                  </option>
                  <option value="gemini-1.5-flash-latest">
                    gemini-1.5-flash-latest
                  </option>
                  <option value="direct-input">{t('DirectInputModel')}</option>
                </select>
                {selectAIModel === googleDirectInputModel && (
                  <input
                    className="mt-8 px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                    type="text"
                    placeholder="gemini..."
                    value={googleDirectInputModel}
                    onChange={handleGoogleDirectInputModelChange}
                  />
                )}
              </div>
            </>
          )
        } else if (selectAIService === 'googleVertexAI') {
          return (
            <>
              <div>
                <strong>{t('GoogleVertexAICaution')}</strong>
                <br />
                {t('AuthFileInstruction')}
                <br />
                <Link
                  url="https://cloud.google.com/vertex-ai/docs/start/client-libraries#before_you_begin"
                  label="https://cloud.google.com/vertex-ai/docs/start/client-libraries#before_you_begin"
                />
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={selectAIModel}
                  onChange={(e) =>
                    settingsStore.setState({
                      selectAIModel: e.target.value,
                    })
                  }
                >
                  <option value="gemini-1.5-pro-002">gemini-1.5-pro-002</option>
                  <option value="gemini-1.5-pro-001">gemini-1.5-pro-001</option>
                  <option value="gemini-1.5-flash-002">
                    gemini-1.5-flash-002
                  </option>
                  <option value="gemini-1.5-flash-001">
                    gemini-1.5-flash-001
                  </option>
                </select>
              </div>
            </>
          )
        } else if (selectAIService === 'azure') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('AzureAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://portal.azure.com/#view/Microsoft_Azure_AI/AzureOpenAI/keys"
                    label="Azure OpenAI"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.azureKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      azureKey: e.target.value,
                    }))
                    await setAPIKey('azureKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('AzureAPIURL')}
                </div>
                <div className="my-16">
                  ex.
                  https://RESOURCE_NAME.openai.azure.com/openai/deployments/DEPLOYMENT_NAME/completions?api-version=2024-06-01
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={selectAIModel}
                  onChange={(e) =>
                    settingsStore.setState({ selectAIModel: e.target.value })
                  }
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
            </>
          )
        } else if (selectAIService === 'groq') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('GroqAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://console.groq.com/keys"
                    label="Groq Dashboard"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.groqKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({ ...prev, groqKey: e.target.value }))
                    await setAPIKey('groqKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={selectAIModel}
                  onChange={(e) =>
                    settingsStore.setState({
                      selectAIModel: e.target.value,
                    })
                  }
                >
                  <option value="gemma-7b-it">gemma-7b-it</option>
                  <option value="llama3-70b-8192">llama3-70b-8192</option>
                  <option value="llama3-8b-8192">llama3-8b-8192</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                </select>
              </div>
            </>
          )
        } else if (selectAIService === 'cohere') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('CohereAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://dashboard.cohere.com/api-keys"
                    label="Cohere Dashboard"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.cohereKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      cohereKey: e.target.value,
                    }))
                    await setAPIKey('cohereKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={selectAIModel}
                  onChange={(e) =>
                    settingsStore.setState({
                      selectAIModel: e.target.value,
                    })
                  }
                >
                  <option value="command-light">command-light</option>
                  <option value="command-light-nightly">
                    command-light-nightly
                  </option>
                  <option value="command-nightly">command-nightly</option>
                  <option value="command-r">command-r</option>
                  <option value="command-r-08-2024">command-r-08-2024</option>
                  <option value="command-r-plus">command-r-plus</option>
                  <option value="command-r-plus-08-2024">
                    command-r-plus-08-2024
                  </option>
                </select>
              </div>
            </>
          )
        } else if (selectAIService === 'mistralai') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('MistralAIAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://console.mistral.ai/api-keys/"
                    label="Mistral AI Dashboard"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.mistralaiKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      mistralaiKey: e.target.value,
                    }))
                    await setAPIKey('mistralaiKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={selectAIModel}
                  onChange={(e) =>
                    settingsStore.setState({
                      selectAIModel: e.target.value,
                    })
                  }
                >
                  <option value="mistral-large-latest">
                    mistral-large-latest
                  </option>
                  <option value="open-mistral-nemo">open-mistral-nemo</option>
                  <option value="codestral-latest">codestral-latest</option>
                  <option value="mistral-embed">mistral-embed</option>
                </select>
              </div>
            </>
          )
        } else if (selectAIService === 'perplexity') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('PerplexityAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://www.perplexity.ai/settings/api"
                    label="Perplexity Dashboard"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.perplexityKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      perplexityKey: e.target.value,
                    }))
                    await setAPIKey('perplexityKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={selectAIModel}
                  onChange={(e) =>
                    settingsStore.setState({
                      selectAIModel: e.target.value,
                    })
                  }
                >
                  <option value="llama-3.1-sonar-small-128k-online">
                    llama-3.1-sonar-small-128k-online
                  </option>
                  <option value="llama-3.1-sonar-large-128k-online">
                    llama-3.1-sonar-large-128k-online
                  </option>
                  <option value="llama-3.1-sonar-huge-128k-online">
                    llama-3.1-sonar-huge-128k-online
                  </option>
                  <option value="llama-3.1-sonar-small-128k-chat">
                    llama-3.1-sonar-small-128k-chat
                  </option>
                  <option value="llama-3.1-sonar-large-128k-chat">
                    llama-3.1-sonar-large-128k-chat
                  </option>
                </select>
              </div>
            </>
          )
        } else if (selectAIService === 'fireworks') {
          return (
            <>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('FireworksAPIKeyLabel')}
                </div>
                <div className="my-16">
                  {t('APIKeyInstruction')}
                  <br />
                  <Link
                    url="https://fireworks.ai/account/api-keys"
                    label="Fireworks Dashboard"
                  />
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.fireworksKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({
                      ...prev,
                      fireworksKey: e.target.value,
                    }))
                    await setAPIKey('fireworksKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <select
                  className="px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  value={selectAIModel}
                  onChange={(e) =>
                    settingsStore.setState({
                      selectAIModel: e.target.value,
                    })
                  }
                >
                  <option value="accounts/fireworks/models/llama-v3p1-405b-instruct">
                    llama-v3p1-405b-instruct
                  </option>
                  <option value="accounts/fireworks/models/llama-v3p1-70b-instruct">
                    llama-v3p1-70b-instruct
                  </option>
                  <option value="accounts/fireworks/models/llama-v3p1-8b-instruct">
                    llama-v3p1-8b-instruct
                  </option>
                  <option value="accounts/fireworks/models/llama-v3-70b-instruct">
                    llama-v3-70b-instruct
                  </option>
                  <option value="accounts/fireworks/models/mixtral-8x22b-instruct">
                    mixtral-8x22b-instruct
                  </option>
                  <option value="accounts/fireworks/models/mixtral-8x7b-instruct">
                    mixtral-8x7b-instruct
                  </option>
                  <option value="accounts/fireworks/models/firefunction-v2">
                    firefunction-v2
                  </option>
                </select>
              </div>
            </>
          )
        } else if (selectAIService === 'localLlm') {
          return (
            <>
              <div className="my-24">
                <div className="my-16">
                  {t('LocalLLMInfo')}
                  <br />
                  ex. Ollama:{' '}
                  <Link
                    url="https://note.com/schroneko/n/n8b1a5bbc740b"
                    label="https://note.com/schroneko/n/n8b1a5bbc740b"
                  />
                </div>
                <div className="my-16">
                  {t('LocalLLMInfo2')}
                  <br />
                  ex. Ollama: http://localhost:11434/v1/chat/completions
                </div>
                <div className="my-16 typography-20 font-bold">
                  {t('EnterURL')}
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={localLlmUrl}
                  onChange={(e) =>
                    settingsStore.setState({ localLlmUrl: e.target.value })
                  }
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('SelectModel')}
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={selectAIModel}
                  onChange={(e) =>
                    settingsStore.setState({
                      selectAIModel: e.target.value,
                    })
                  }
                />
              </div>
            </>
          )
        } else if (selectAIService === 'dify') {
          return (
            <>
              <div className="my-24">
                <div className="my-16">{t('DifyInfo')}</div>
                <div className="my-16 typography-20 font-bold">
                  {t('DifyAPIKeyLabel')}
                </div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={apiKeys.difyKey}
                  onChange={async (e) => {
                    setApiKeys((prev) => ({ ...prev, difyKey: e.target.value }))
                    await setAPIKey('difyKey', e.target.value)
                  }}
                />
                <span className="ml-8 text-red-600 text-xl font-bold">*</span>
              </div>
              <div className="my-24">
                <div className="my-16 typography-20 font-bold">
                  {t('EnterURL')}
                </div>
                <div className="my-16">{t('DifyInfo3')}</div>
                <input
                  className="text-ellipsis px-16 py-8 w-col-span-2 bg-surface1 hover:bg-surface1-hover rounded-8"
                  type="text"
                  placeholder="..."
                  value={difyUrl}
                  onChange={(e) =>
                    settingsStore.setState({ difyUrl: e.target.value })
                  }
                />
              </div>
            </>
          )
        }
      })()}

      <div className="my-40">
        <div className="my-8">
          <div className="my-16 typography-20 font-bold">
            {t('CharacterSettingsPrompt')}
          </div>
          {selectAIService === 'dify' && (
            <div className="my-16">{t('DifyInstruction')}</div>
          )}
          <TextButton
            onClick={async () => {
              setSystemPrompt(t('SystemPrompt'))
              await setPrompt('systemPrompt', t('SystemPrompt'))
            }}
          >
            {t('CharacterSettingsReset')}
          </TextButton>
        </div>
        <textarea
          value={systemPrompt}
          onChange={async (e) => {
            setSystemPrompt(e.target.value)
            await setPrompt('systemPrompt', e.target.value)
          }}
          className="px-16 py-8 bg-surface1 hover:bg-surface1-hover h-168 rounded-8 w-full"
        ></textarea>
      </div>
    </div>
  )
}
export default ModelProvider
