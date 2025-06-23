import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';

const PasswordAuth = ({ onAuth }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values) => {
    setLoading(true);
    
    // Get password from environment variable
    const correctPassword = import.meta.env.VITE_ACCESS_PASSWORD || 'admin123';
    
    if (values.password === correctPassword) {
      localStorage.setItem('auth', 'true');
      onAuth(true);
      message.success('Authentication successful');
    } else {
      message.error('Incorrect password');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card title="Access Authentication" style={{ width: 400 }}>
        <Form
          name="password-form"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter access password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Please enter access password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Verify
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default PasswordAuth;