import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Progress, Avatar, Space, Typography, Divider } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  InboxOutlined,
  FileTextOutlined,
  TruckOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { fetchDashboardStats } from '../store/slices/reportSlice';
import { canPerformAction, getRoleDisplayName } from '../utils/permissions';
import useResponsive from '../hooks/useResponsive';

const { Title, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector(state => state.reports);
  const { user } = useSelector(state => state.auth);
  const { isMobile, isTablet, isSmallMobile } = useResponsive();

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading || !dashboardStats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: dashboardStats.totalRevenue || 0,
      prefix: <DollarOutlined />,
      suffix: 'VNĐ',
      valueStyle: { color: '#3f8600' },
      roles: ['admin', 'sales_manager', 'accountant', 'director']
    },
    {
      title: 'Total Orders',
      value: dashboardStats.totalOrders || 0,
      prefix: <ShoppingCartOutlined />,
      valueStyle: { color: '#1890ff' },
      roles: ['admin', 'sales_manager', 'sales_staff', 'customer_service', 'director']
    },
    {
      title: 'Customer',
      value: dashboardStats.totalCustomers || 0,
      prefix: <UserOutlined />,
      valueStyle: { color: '#722ed1' },
      roles: ['admin', 'sales_manager', 'sales_staff', 'customer_service', 'director']
    },
    {
      title: 'Product',
      value: dashboardStats.totalProducts || 0,
      prefix: <InboxOutlined />,
      valueStyle: { color: '#13c2c2' },
      roles: ['admin', 'sales_manager', 'warehouse_staff', 'director']
    }
  ].filter(stat => stat.roles.includes(user?.role));

  const alerts = [
    {
      key: '1',
      type: 'Pending Orders',
      count: dashboardStats.pendingOrders || 0,
      icon: <FileTextOutlined style={{ color: '#faad14' }} />,
      color: 'warning',
      roles: ['admin', 'sales_manager', 'sales_staff']
    },
    {
      key: '2',
      type: 'Pending Quotations',
      count: dashboardStats.pendingQuotations || 0,
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
      color: 'processing',
      roles: ['admin', 'sales_manager', 'sales_staff']
    },
    {
      key: '3',
      type: 'Overdue Invoices',
      count: dashboardStats.overdueInvoices || 0,
      icon: <WarningOutlined style={{ color: '#ff4d4f' }} />,
      color: 'error',
      roles: ['admin', 'accountant', 'director']
    },
    {
      key: '4',
      type: 'Low Stock Products',
      count: dashboardStats.lowStockProducts || 0,
      icon: <TruckOutlined style={{ color: '#ff7a45' }} />,
      color: 'warning',
      roles: ['admin', 'warehouse_staff', 'sales_manager']
    },
    {
      key: '5',
      type: 'Pending Deliveries',
      count: dashboardStats.pendingDeliveries || 0,
      icon: <TruckOutlined style={{ color: '#52c41a' }} />,
      color: 'success',
      roles: ['admin', 'delivery_staff', 'warehouse_staff']
    }
  ].filter(alert => alert.roles.includes(user?.role));

  const alertColumns = [
    {
      title: 'Alert Type',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => (
        <span>
          {record.icon} {text}
        </span>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'count',
      key: 'count',
      render: (count, record) => (
        <Tag color={record.color}>{count}</Tag>
      )
    }
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #d0d7de'
      }}>
        <Space align="center" size="middle">
          <Avatar 
            size={48}
            style={{ 
              background: '#0969da'
            }}
            icon={<UserOutlined />}
          />
          <div>
            <Title level={2} style={{ margin: 0, color: '#24292f', fontSize: '24px', fontWeight: '600' }}>
              Welcome Back, {user?.fullName || user?.username}!
            </Title>
            <Text style={{ fontSize: '16px', color: '#656d76' }}>
              {getRoleDisplayName(user?.role)} - Business Overview Today
            </Text>
          </div>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card 
              style={{ 
                background: '#ffffff',
                border: '1px solid #d0d7de',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(16, 22, 26, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <Statistic
                    title={<Text style={{ fontSize: '14px', fontWeight: '600', color: '#656d76' }}>{stat.title}</Text>}
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{ 
                      fontSize: isMobile ? '20px' : '24px', 
                      fontWeight: '600',
                      color: '#24292f'
                    }}
                  />
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center' }} className="hide-mobile">
                    <ArrowUpOutlined style={{ color: '#1a7f37', fontSize: '12px' }} />
                    <Text style={{ fontSize: '12px', color: '#1a7f37', marginLeft: '4px' }}>
                      +12% from last month
                    </Text>
                  </div>
                </div>
                <div style={{
                  width: isMobile ? '40px' : '48px',
                  height: isMobile ? '40px' : '48px',
                  borderRadius: '8px',
                  background: '#f6f8fa',
                  border: '1px solid #d0d7de',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '16px' : '20px',
                  color: '#0969da',
                  flexShrink: 0
                }}>
                  {stat.prefix}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Alerts & Notifications */}
        <Col xs={24} lg={14} xl={16}>
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#d1242f' }} />
                <span style={{ color: '#24292f', fontWeight: '600' }} className="text-responsive-md">Warnings & Notifications</span>
              </Space>
            }
            extra={<Tag color="blue">Realtime</Tag>}
            style={{ height: isMobile ? 'auto' : '400px' }}
          >
            <div style={{ marginBottom: '16px', maxHeight: isMobile ? 'none' : '300px', overflowY: 'auto' }}>
              {alerts.map((alert, index) => (
                <div key={alert.key} style={{
                  padding: isMobile ? '8px' : '12px',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  background: alert.count > 0 ? '#fff8f0' : '#f0f9ff',
                  border: `1px solid ${alert.count > 0 ? '#fed7aa' : '#bae6fd'}`,
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Space size={isMobile ? 'small' : 'middle'}>
                      {alert.icon}
                      <Text style={{ fontWeight: '500', color: '#24292f', fontSize: isMobile ? '13px' : '14px' }}>{alert.type}</Text>
                    </Space>
                    <Tag color={alert.count > 0 ? 'orange' : 'green'}>
                      {alert.count > 0 ? alert.count : <CheckCircleOutlined />}
                    </Tag>
                  </div>
                  {alert.count > 0 && (
                    <Progress 
                      percent={Math.min((alert.count / 10) * 100, 100)} 
                      size="small" 
                      status={alert.count > 5 ? 'exception' : 'active'}
                      style={{ marginTop: '8px' }}
                      strokeColor="#0969da"
                    />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={10} xl={8}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#0969da' }} />
                <span style={{ color: '#24292f', fontWeight: '600' }} className="text-responsive-md">Recent Activities</span>
              </Space>
            }
            style={{ height: isMobile ? 'auto' : '400px' }}
          >
            <div style={{ height: isMobile ? 'auto' : '300px', overflowY: 'auto' }}>
              {[
                { time: '10:30', action: 'Order #DH001 created', user: 'Nguyen Van A', type: 'order' },
                { time: '09:15', action: 'Quotation #BG002 approved', user: 'Tran Thi B', type: 'quotation' },
                { time: '08:45', action: 'New customer added', user: 'Le Van C', type: 'customer' },
                { time: '08:20', action: 'Product ABC123 stock updated', user: 'System', type: 'product' },
                { time: '07:55', action: 'Invoice #HD003 was paid', user: 'Pham Thi D', type: 'invoice' }
              ].map((activity, index) => (
                <div key={index} style={{
                  padding: isMobile ? '6px 0' : '8px 0',
                  borderBottom: index < 4 ? '1px solid #d0d7de' : 'none',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#0969da',
                    marginTop: '6px',
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: '12px', color: '#656d76' }}>{activity.time}</Text>
                    <div style={{ marginTop: '2px' }}>
                      <Text style={{ fontSize: isMobile ? '13px' : '14px', color: '#24292f' }}>{activity.action}</Text>
                    </div>
                    <Text style={{ fontSize: '12px', color: '#656d76' }}>
                      by {activity.user}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
