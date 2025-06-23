import React, { useState, useEffect } from 'react'
import { Layout, Typography, Button } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import ImageUploader from './components/ImageUploader'
import PasswordAuth from './components/PasswordAuth'
import useConfigStore from './store/configStore'

const { Content } = Layout
const { Title } = Typography

function App() {
  const { isConfigured } = useConfigStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthLogout = () => {
    localStorage.removeItem('auth')
    setIsAuthenticated(false)
  }

  // Show password authentication if not authenticated
  if (!isAuthenticated) {
    return <PasswordAuth onAuth={setIsAuthenticated} />
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={1} style={{ fontSize: 24 }}>WordPress Image Uploader</Title>
          <Button 
            icon={<LogoutOutlined />} 
            onClick={handleAuthLogout}
            type="link"
            danger
          >
            Logout
          </Button>
        </div>
        
        <ImageUploader />
      </Content>
    </Layout>
  )
}

export default App