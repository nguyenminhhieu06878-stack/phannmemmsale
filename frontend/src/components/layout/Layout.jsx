import React, { useState, useEffect } from 'react'
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, theme, Badge, Space, Typography, Drawer } from 'antd'
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
import useResponsive from '../../hooks/useResponsive'

const { Header, Sider, Content } = AntLayout
const { Text } = Typography

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { isMobile, isTablet } = useResponsive()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // Auto-collapse sidebar on mobile and tablet
  useEffect(() => {
    if (isMobile || (isTablet && window.innerWidth < 992)) {
      setCollapsed(true)
    }
  }, [isMobile, isTablet])

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
    if (isMobile) {
      setMobileDrawerVisible(false)
    }
  }

  const toggleMobileMenu = () => {
    if (isMobile) {
      setMobileDrawerVisible(!mobileDrawerVisible)
    } else {
      setCollapsed(!collapsed)
    }
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

          .ant-layout-header {
            overflow: hidden !important;
          }
          
          .header-actions {
            flex-shrink: 0 !important;
            min-width: 0 !important;
            overflow: hidden !important;
          }
          
          .header-actions .ant-space-item {
            flex-shrink: 0 !important;
            overflow: hidden !important;
          }
          
          .header-search {
            flex-shrink: 0 !important;
            overflow: hidden !important;
          }
          
          .header-search .anticon {
            margin: 0 !important;
          }
          
          .ant-btn {
            white-space: nowrap !important;
          }

          /* Tablet and smaller desktop */
          @media (max-width: 1200px) {
            .header-search {
              width: 32px !important;
              padding: 0 !important;
              min-width: 32px !important;
              max-width: 32px !important;
            }
            
            .header-search span:not(.anticon) {
              display: none !important;
            }
          }

          /* Tablet */
          @media (max-width: 992px) {
            .ant-layout-header {
              padding: 0 20px !important;
            }
            
            .header-actions {
              gap: 12px !important;
            }
            
            .header-search {
              width: 32px !important;
              padding: 0 !important;
              min-width: 32px !important;
              max-width: 32px !important;
              flex-shrink: 0 !important;
            }
          }

          /* Mobile landscape */
          @media (max-width: 768px) {
            .ant-layout-header {
              padding: 0 16px !important;
            }
            
            .header-title {
              display: none !important;
            }
            
            .header-search {
              width: 32px !important;
              padding: 0 !important;
              min-width: 32px !important;
              max-width: 32px !important;
              flex-shrink: 0 !important;
            }
            
            .user-info-mobile {
              display: none !important;
            }
            
            .header-actions {
              gap: 10px !important;
            }
            
            .ant-layout-content {
              margin: 8px !important;
              padding: 16px !important;
            }
          }

          /* Mobile portrait */
          @media (max-width: 576px) {
            .ant-layout-header {
              padding: 0 12px !important;
            }
            
            .header-actions {
              gap: 8px !important;
            }
            
            .user-info-container {
              padding: 4px 6px !important;
              gap: 6px !important;
            }
            
            .header-search {
              width: 28px !important;
              height: 28px !important;
              min-width: 28px !important;
              max-width: 28px !important;
              padding: 0 !important;
              flex-shrink: 0 !important;
            }
          }

          /* Very small mobile */
          @media (max-width: 480px) {
            .ant-layout-content {
              margin: 4px !important;
              padding: 12px !important;
            }
            
            .ant-layout-header {
              padding: 0 8px !important;
            }
            
            .header-actions {
              gap: 6px !important;
            }
            
            .user-info-container {
              padding: 2px 4px !important;
              gap: 4px !important;
            }
          }

          /* iPhone 12 Pro and similar */
          @media (max-width: 390px) {
            .ant-layout-header {
              padding: 0 6px !important;
            }
            
            .header-actions {
              gap: 4px !important;
            }
            
            .header-search {
              width: 24px !important;
              height: 24px !important;
              min-width: 24px !important;
              max-width: 24px !important;
            }
          }
        `}
      </style>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title={
            <div style={{ color: '#f0f6fc', fontWeight: '700', fontSize: '18px' }}>
              ERP Sales Pro
            </div>
          }
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          bodyStyle={{ padding: 0, background: '#24292f' }}
          headerStyle={{ background: '#24292f', borderBottom: '1px solid #30363d' }}
          width={280}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={filteredMenuItems}
            onClick={handleMenuClick}
            style={{
              background: '#24292f',
              border: 'none',
              fontSize: '14px'
            }}
          />
        </Drawer>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
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
      )}
      
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
            height: '64px',
            overflow: 'hidden'
          }}
        >
          <Space align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleMobileMenu}
              style={{
                fontSize: '16px',
                width: 32,
                height: 32,
                color: '#656d76'
              }}
            />
            <div 
              className="header-title"
              style={{
                color: '#24292f',
                fontSize: '16px',
                fontWeight: '600',
                marginLeft: '8px'
              }}
            >
              Dashboard
            </div>
          </Space>
          
          <Space 
            size={isMobile ? "small" : "large"} 
            align="center"
            className="header-actions"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : (isTablet ? '10px' : '16px'),
              flexShrink: 0,
              minWidth: 0
            }}
          >
            <Button
              className="header-search"
              type="text"
              icon={<SearchOutlined />}
              style={{
                borderRadius: '6px',
                background: '#f6f8fa',
                border: '1px solid #d0d7de',
                color: '#656d76',
                fontSize: '14px',
                height: isMobile ? '28px' : '32px',
                width: isMobile ? '28px' : (isTablet ? '32px' : 'auto'),
                minWidth: isMobile ? '28px' : '32px',
                maxWidth: isMobile ? '28px' : (isTablet ? '32px' : 'none'),
                padding: (isMobile || isTablet) ? '0' : '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {!isMobile && !isTablet && window.innerWidth > 1200 && 'Search...'}
            </Button>
            
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{
                  width: isMobile ? 28 : 32,
                  height: isMobile ? 28 : 32,
                  minWidth: isMobile ? 28 : 32,
                  maxWidth: isMobile ? 28 : 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#656d76',
                  borderRadius: '6px',
                  flexShrink: 0,
                  padding: 0
                }}
              />
            </Badge>
            
            <div 
              className="user-info-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '4px' : (isTablet ? '8px' : '12px'),
                padding: isMobile ? '4px 6px' : '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                flexShrink: 0,
                minWidth: 0
              }}
            >
              <div className="user-info-mobile">
                <UserInfo />
              </div>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                arrow
                trigger={['click']}
              >
                <Avatar 
                  size={isMobile ? 32 : 36}
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
            margin: isMobile ? '8px' : '16px',
            padding: isMobile ? '16px' : '24px',
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