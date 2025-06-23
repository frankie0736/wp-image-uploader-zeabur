import { create } from 'zustand'

// 从环境变量读取配置
const getEnvConfig = () => ({
  wpUrl: import.meta.env.VITE_WP_URL || '',
  wpUsername: import.meta.env.VITE_WP_USERNAME || '',
  wpPassword: import.meta.env.VITE_WP_PASSWORD || '',
  openaiKey: import.meta.env.VITE_OPENAI_KEY || '',
  openaiUrl: import.meta.env.VITE_OPENAI_URL || 'https://api.openai.com',
  compressImages: import.meta.env.VITE_COMPRESS_IMAGES === 'true',
  maxImageWidth: parseInt(import.meta.env.VITE_MAX_IMAGE_WIDTH || '1920'),
})

const useConfigStore = create((set) => {
  const envConfig = getEnvConfig()
  const isConfigured = !!(envConfig.wpUrl && envConfig.wpUsername && envConfig.wpPassword)
  
  return {
    ...envConfig,
    isConfigured,
    setConfig: (config) => set(config),
    clearConfig: () => set({
      ...getEnvConfig(),
      isConfigured: false
    }),
  }
})

export default useConfigStore