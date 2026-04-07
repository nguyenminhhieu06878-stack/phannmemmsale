import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Avatar, Space, Typography, List, Badge } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  InboxOutlined,
  FileTextOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import useResponsive from '../hooks/useResponsive';

const { Title, Text } = Typography;

const SupplierDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalPurchaseOrders: 15,
    pendingOrders: 3,
    completedOrders: 10,
    rejectedOrders: 2,
    totalRevenue: 250000000,
    monthlyRevenue: 45000000
  });

  // Mock data for recent purchase orders
  const recentOrders = [
    {
      id: 1,
      poNumber: 'PO2026001',
      productName: 'Laptop Dell Inspiron 15',
      quantity: 10,
      totalAmount: 150000000,
      status: 'pending',
      createdAt: '2026-04-07T10:30:00Z'
    },
    {
      id: 2,
      poNumber: 'PO2026002',
      productName: 'Mouse Logitech MX Master',
      quantity: 25,
      totalAmount: 5000000,
      status: 'confirmed',
      createdAt: '2026-04-06T14:20:00Z'
    },
    {
      id: 3,
      poNumber: 'PO2026003',
      productName: 'Keyboard Mechanical RGB',
      quantity: 15,
      totalAmount: 7500000,
      status: 'shipped',
      createdAt: '2026-04-05T09:15:00Z'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipped: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      rejected: 'Từ chối'
    };
    return texts[status] || status;
  };

  const stats = [
    {
      title: 'Tổng đơn hàng',
      value: dashboardData.totalPurchaseOrders,
      prefix: <ShoppingCartOutlined />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: 'Đơn chờ xử lý',
      value: dashboardData.pendingOrders,
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: '#faad14' }
    },
    {
      title: 'Đơn hoàn thành',
      value: dashboardData.completedOrders,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' }
    },
    {
      title: 'Doanh thu tháng',
      value: dashboardData.monthlyRevenue,
      prefix: <FileTextOutlined />,
      suffix: 'VNĐ',
      valueStyle: { color: '#722ed1' }
    }
  ];

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 120
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      width: 200
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${amount.toLocaleString()} VNĐ`,
      width: 120
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 120
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
      width: 100
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

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
              background: '#52c41a'
            }}
            icon={<UserOutlined />}
          />
          <div>
            <Title level={2} style={{ margin: 0, color: '#24292f', fontSize: '24px', fontWeight: '600' }}>
              Chào mừng, {user?.fullName || user?.username}!
            </Title>
            <Text style={{ fontSize: '16px', color: '#656d76' }}>
              Nhà cung cấp - Tổng quan hoạt động hôm nay
            </Text>
          </div>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
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
                      ...stat.valueStyle
                    }}
                  />
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
                  color: stat.valueStyle.color,
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
        {/* Recent Purchase Orders */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <ShoppingCartOutlined style={{ color: '#1890ff' }} />
                <span style={{ color: '#24292f', fontWeight: '600' }}>Đơn hàng gần đây</span>
              </Space>
            }
            extra={<Badge count={dashboardData.pendingOrders} />}
            style={{ height: isMobile ? 'auto' : '500px' }}
          >
            <Table
              columns={orderColumns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
              size={isMobile ? "small" : "middle"}
            />
          </Card>
        </Col>

        {/* Quick Actions & Notifications */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <WarningOutlined style={{ color: '#faad14' }} />
                <span style={{ color: '#24292f', fontWeight: '600' }}>Thông báo</span>
              </Space>
            }
            style={{ height: isMobile ? 'auto' : '500px', marginBottom: isMobile ? '16px' : '0' }}
          >
            <List
              size="small"
              dataSource={[
                {
                  title: 'Đơn hàng PO2026001 cần xác nhận',
                  description: '10 phút trước',
                  type: 'warning'
                },
                {
                  title: 'Thanh toán đơn PO2026002 đã hoàn tất',
                  description: '2 giờ trước',
                  type: 'success'
                },
                {
                  title: 'Cập nhật thông tin sản phẩm mới',
                  description: '1 ngày trước',
                  type: 'info'
                },
                {
                  title: 'Đánh giá từ khách hàng ABC Corp',
                  description: '2 ngày trước',
                  type: 'info'
                }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: item.type === 'warning' ? '#faad14' : 
                                   item.type === 'success' ? '#52c41a' : '#1890ff'
                      }} />
                    }
                    title={<Text style={{ fontSize: '14px' }}>{item.title}</Text>}
                    description={<Text style={{ fontSize: '12px', color: '#656d76' }}>{item.description}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SupplierDashboard;