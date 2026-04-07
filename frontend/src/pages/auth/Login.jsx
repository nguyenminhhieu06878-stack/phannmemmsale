import React, { useEffect } from 'react'
import { Form, Input, Button, Alert, Typography, Space } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, clearError } from '../../store/slices/authSlice'
import pannerImage from '../../assets/panner.png'
import logoImage from '../../assets/logo.png'

const { Title, Text } = Typography

const Login = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const onFinish = async (values) => {
    try {
      await dispatch(login(values)).unwrap()
      navigate('/')
    } catch (error) {
      // Error is handled by Redux
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f0f2f5',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>
        {`
          .login-container {
            display: flex;
            min-height: 100vh;
          }
          
          @media (max-width: 768px) {
            .login-container {
              position: relative !important;
            }
            .login-left {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              width: 100% !important;
              height: 100vh !important;
              z-index: 1 !important;
            }
            .login-right {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              right: 0 !important;
              bottom: 0 !important;
              width: 100% !important;
              height: 100vh !important;
              z-index: 2 !important;
              background: rgba(255, 255, 255, 0.95) !important;
              backdrop-filter: blur(20px) !important;
              padding: 20px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .login-form-container {
              max-width: 100% !important;
              width: 100% !important;
            }
            .demo-accounts {
              grid-template-columns: 1fr !important;
              gap: 4px !important;
            }
          }
          
          @media (max-width: 480px) {
            .login-right {
              padding: 16px !important;
            }
            .login-form-container {
              padding: 0 !important;
            }
            .demo-accounts {
              font-size: 12px !important;
            }
          }
        `}
      </style>

      {/* Left Side - Branding */}
      <div className="login-left" style={{
        flex: '1',
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0',
        color: 'white',
        position: 'relative',
        zIndex: 1,
        backgroundImage: `url(${pannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Dark overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: -1
        }} />
        
        <div style={{ 
          textAlign: 'center', 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right" style={{
        flex: '1',
        width: '50%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ width: '100%', maxWidth: '450px' }} className="login-form-container">
          <div style={{ marginBottom: '40px' }}>
            <Title level={2} style={{ 
              color: '#24292f', 
              marginBottom: '8px',
              fontSize: '32px',
              fontWeight: '700'
            }}>
              Welcome Back
            </Title>
            <Text style={{ color: '#656d76', fontSize: '16px' }}>
              Login to access your dashboard
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ 
                marginBottom: '24px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(248, 81, 73, 0.1)'
              }}
              closable
              onClose={() => dispatch(clearError())}
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label={<span style={{ color: '#24292f', fontWeight: '600', fontSize: '14px' }}>Email or Username</span>}
              rules={[{ required: true, message: 'Please enter your credentials!' }]}
            >
              <Input
                placeholder="name@company.com"
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border: '2px solid #e1e5e9',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ color: '#24292f', fontWeight: '600', fontSize: '14px' }}>Password</span>}
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password
                placeholder="Enter your password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  border: '2px solid #e1e5e9',
                  fontSize: '16px',
                  background: 'rgba(255, 255, 255, 0.8)'
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '24px' }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  background: '#0969da',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '16px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                }}
              >
                Login Now
              </Button>
            </Form.Item>
          </Form>

          <div style={{ 
            textAlign: 'left', 
            marginTop: '32px',
            padding: '24px',
            background: 'rgba(246, 248, 250, 0.8)',
            borderRadius: '12px',
            border: '1px solid rgba(208, 215, 222, 0.5)'
          }}>
            <Text style={{ fontSize: '14px', color: '#24292f', fontWeight: '600', display: 'block', marginBottom: '12px' }}>
              Demo Accounts (all passwords: 123456):
            </Text>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px',
              fontSize: '13px',
              color: '#656d76'
            }} className="demo-accounts">
              <div>👨‍💼 Admin: <strong>admin</strong></div>
              <div>📊 Sales Manager: <strong>salesmanager</strong></div>
              <div>💼 Sales Staff: <strong>salesstaff</strong></div>
              <div>📞 Customer Service: <strong>customerservice</strong></div>
              <div>📦 Warehouse: <strong>warehouse</strong></div>
              <div>💰 Accountant: <strong>accountant</strong></div>
              <div>🚚 Delivery: <strong>delivery</strong></div>
              <div>🎯 Director: <strong>director</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login