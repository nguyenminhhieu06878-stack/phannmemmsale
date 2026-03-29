import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Table, Tag, Alert } from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  InboxOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDashboardStats, 
  fetchSalesReport, 
  fetchRevenueReport,
  fetchCustomerReport,
  fetchProductReport
} from '../../store/slices/reportSlice';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const Reports = () => {
  const dispatch = useDispatch();
  const { 
    dashboardStats, 
    salesReport, 
    revenueReport,
    customerReport,
    productReport,
    loading,
    error 
  } = useSelector(state => state.reports);
  
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    loadReports();
  }, [dispatch]);

  const loadReports = () => {
    const params = {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    };
    
    dispatch(fetchSalesReport(params));
    dispatch(fetchRevenueReport(params));
    dispatch(fetchCustomerReport());
    dispatch(fetchProductReport());
  };

  const handleDateChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  const customerColumns = [
    {
      title: 'Customer',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Order Number',
      dataIndex: 'orderCount',
      key: 'orderCount',
      sorter: (a, b) => a.orderCount - b.orderCount,
    },
    {
      title: 'Total Spent',
      dataIndex: 'totalSpent',
      key: 'totalSpent',
      render: (value) => `${(value || 0).toLocaleString('en-US')} USD`,
      sorter: (a, b) => a.totalSpent - b.totalSpent,
    },
  ];

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (value, record) => (
        <Tag color={value === 0 ? 'red' : value <= record.minStock ? 'orange' : 'green'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Minimum Level',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.stock === 0) {
          return <Tag color="red">Out of Stock</Tag>;
        }
        if (record.stock <= record.minStock) {
          return <Tag color="orange">Low Stock</Tag>;
        }
        return <Tag color="green">In Stock</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Reports & Statistics</h1>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
          />
        </Space>
      </div>

      {/* Error Display */}
      {error && (
        <Alert
          message="Error loading report data"
          description={typeof error === 'string' ? error : JSON.stringify(error)}
          type="error"
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={dashboardStats?.totalRevenue || 0}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={dashboardStats?.totalOrders || 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Value/Order"
              value={dashboardStats?.totalOrders > 0 ? (dashboardStats?.totalRevenue / dashboardStats?.totalOrders) : 0}
              precision={0}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total customers"
              value={dashboardStats?.totalCustomers || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Details */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Details doanh thu">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Paid Amount:</span>
                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#52c41a' }}>
                  {(dashboardStats?.paidAmount || 0).toLocaleString('en-US')} USD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Unpaid:</span>
                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#faad14' }}>
                  {(dashboardStats?.pendingAmount || 0).toLocaleString('en-US')} USD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <span style={{ fontWeight: 'bold' }}>Total:</span>
                <span style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                  {(dashboardStats?.invoiceRevenue || 0).toLocaleString('en-US')} USD
                </span>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Overview Statistics">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Products:</span>
                <span style={{ fontSize: 18, fontWeight: 'bold' }}>
                  {dashboardStats?.totalProducts || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Out of Stock Products:</span>
                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#ff4d4f' }}>
                  {productReport?.outOfStock || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Low Stock Products:</span>
                <span style={{ fontSize: 18, fontWeight: 'bold', color: '#faad14' }}>
                  {productReport?.lowStockProducts?.length || 0}
                </span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Top Customers */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="Top 10 Customers">
            <Table
              columns={customerColumns}
              dataSource={customerReport || []}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800 }}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Low Stock Products */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Low Stock Products">
            <Table
              columns={productColumns}
              dataSource={productReport?.lowStockProducts || []}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800 }}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
