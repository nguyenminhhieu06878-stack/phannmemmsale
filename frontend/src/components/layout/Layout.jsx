import React, { useState } from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, theme, Badge, Space, Typography } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  TruckOutlined,
  FileOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined
} from '@ant-design/icons'
import { logout } from '../../store/slices/authSlice'
import NotificationBell from '../NotificationBell'
import { filterMenuByRole, getRoleDisplayName } from '../../utils/permissions'
import UserInfo from '../UserInfo'
import logoImage from '../../assets/logo.png'

const { Header, Sider, Content } = AntLayout
const { Text } = Typography

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: 'Customer',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Product',
    },
    {
      key: '/quotations',
      icon: <FileTextOutlined />,
      label: 'Quotation',
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Order',
    },
    {
      key: '/deliveries',
      icon: <TruckOutlined />,
      label: 'Delivery',
    },
    {
      key: '/invoices',
      icon: <FileOutlined />,
      label: 'Invoice',
    },
    {
      key: '/stock-requests',
      icon: <ShoppingOutlined />,
      label: 'Stock Request',
    },
    {
      key: '/suppliers',
      icon: <UserOutlined />,
      label: 'Supplier',
    },
    {
      key: '/purchase-orders',
      icon: <ShoppingCartOutlined />,
      label: 'Purchase Order',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'User',
    },
  ]

  // Filter menu items based on user role
  const filteredMenuItems = filterMenuByRole(menuItems, user?.role)

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout
    },
  ]

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/customers')) return '/customers'
    if (path.startsWith('/products')) return '/products'
    if (path.startsWith('/quotations')) return '/quotations'
    if (path.startsWith('/orders')) return '/orders'
    if (path.startsWith('/deliveries')) return '/deliveries'
    if (path.startsWith('/invoices')) return '/invoices'
    if (path.startsWith('/stock-requests')) return '/stock-requests'
    if (path.startsWith('/suppliers')) return '/suppliers'
    if (path.startsWith('/purchase-orders')) return '/purchase-orders'
    if (path.startsWith('/reports')) return '/reports'
    if (path.startsWith('/users')) return '/users'
    return path
  }

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#f6f8fa' }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          
          .user-info-container:hover {
            background-color: #f6f8fa !important;
          }
        `}
      </style>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: '#24292f',
          boxShadow: '1px 0 0 #30363d',
          borderRight: '1px solid #30363d'
        }}
      >
        <div style={{
          height: 64,
          margin: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          color: '#f0f6fc',
          fontWeight: '700',
          fontSize: collapsed ? '20px' : '18px',
          paddingLeft: collapsed ? '0' : '24px',
          borderBottom: '1px solid #30363d',
          background: '#24292f'
        }}>
          {collapsed ? '' : 'ERP Sales Pro'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={filteredMenuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            marginTop: '8px'
          }}
        />
      </Sider>
      
      <AntLayout style={{ background: '#f6f8fa' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 0 rgba(27, 31, 36, 0.15)',
            borderBottom: '1px solid #d0d7de',
            height: '64px'
          }}
        >
          <Space align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 32,
                height: 32,
                color: '#656d76'
              }}
            />
            <div style={{
              color: '#24292f',
              fontSize: '16px',
              fontWeight: '600',
              marginLeft: '8px'
            }}>
              Dashboard
            </div>
          </Space>
          
          <Space size="large" align="center">
            <Button
              type="text"
              icon={<SearchOutlined />}
              style={{
                borderRadius: '6px',
                padding: '0 12px',
                background: '#f6f8fa',
                border: '1px solid #d0d7de',
                color: '#656d76',
                fontSize: '14px',
                height: '32px'
              }}
            >
              Search...
            </Button>
            
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#656d76',
                  borderRadius: '6px'
                }}
              />
            </Badge>
            
            <div 
              className="user-info-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
            >
              <UserInfo />
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
                trigger={['click']}
              >
                <Avatar 
                  size={36}
                  style={{ 
                    background: '#0969da',
                    cursor: 'pointer',
                    border: '2px solid #ffffff',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  icon={<UserOutlined />}
                />
              </Dropdown>
            </div>
          </Space>
        </Header>
        
        <Content
          style={{
            margin: '16px',
            padding: '24px',
            minHeight: 'calc(100vh - 96px)',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #d0d7de',
            boxShadow: '0 1px 3px rgba(16, 22, 26, 0.1)'
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout