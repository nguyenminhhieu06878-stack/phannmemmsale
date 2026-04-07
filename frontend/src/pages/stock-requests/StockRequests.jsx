import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, message, Tag, Select, Input, Card, Row, Col, InputNumber } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, ReloadOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { stockRequestService } from '../../services/stockRequestService';
import { supplierService } from '../../services/supplierService';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { productService } from '../../services/productService';
import { useSelector } from 'react-redux';
import useResponsive from '../../hooks/useResponsive';

const { TextArea } = Input;

const StockRequests = () => {
  const { user } = useSelector(state => state.auth);
  const { isMobile, isTablet } = useResponsive();
  const [stockRequests, setStockRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isPurchaseOrderModalVisible, setIsPurchaseOrderModalVisible] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [purchaseOrderForm] = Form.useForm();

  useEffect(() => {
    fetchStockRequests();
    fetchProducts();
    fetchSuppliers();
  }, [pagination.page, pagination.limit, filters]);

  const fetchSuppliers = async () => {
    try {
      const response = await supplierService.getAllSuppliers({ page: 1, limit: 100 });
      setSuppliers(response.data.data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts({ page: 1, limit: 100 });
      setProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStockRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await stockRequestService.getAllStockRequests(params);
      console.log('Stock requests response:', response.data.data);
      setStockRequests(response.data.data.stockRequests);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching stock requests:', error);
      message.error('Cannot load stock request list');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag) => {
    setPagination(prev => ({
      ...prev,
      page: pag.current,
      limit: pag.pageSize
    }));
  };

  const showDetailModal = (request) => {
    setSelectedRequest(request);
    setIsDetailModalVisible(true);
  };

  const showApprovalModal = (request, action) => {
    setSelectedRequest(request);
    setApprovalAction(action);
    form.resetFields();
    setIsApprovalModalVisible(true);
  };

  const handleApproval = async () => {
    try {
      const values = await form.validateFields();
      await stockRequestService.updateStockRequestStatus(selectedRequest.id, {
        status: approvalAction,
        approvalNotes: values.approvalNotes
      });
      message.success(`Request has been ${approvalAction === 'approved' ? 'phê duyệt' : 'từ chối'}`);
      setIsApprovalModalVisible(false);
      fetchStockRequests();
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const showCreateModal = () => {
    createForm.resetFields();
    setIsCreateModalVisible(true);
  };

  const showPurchaseOrderModal = (request) => {
    setSelectedRequest(request);
    purchaseOrderForm.resetFields();
    setIsPurchaseOrderModalVisible(true);
  };

  const handleCreatePurchaseOrder = async () => {
    try {
      const values = await purchaseOrderForm.validateFields();
      console.log('Creating purchase order with values:', values);
      console.log('Selected request:', selectedRequest);
      
      const purchaseOrderData = {
        stockRequestId: selectedRequest.id,
        supplierId: values.supplierId,
        unitPrice: values.unitPrice,
        deliveryDate: values.deliveryDate,
        notes: values.notes
      };
      
      console.log('Purchase order data:', purchaseOrderData);
      
      const response = await purchaseOrderService.createPurchaseOrder(purchaseOrderData);
      console.log('Purchase order created:', response);
      
      message.success('Purchase order created successfully');
      setIsPurchaseOrderModalVisible(false);
      fetchStockRequests();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      message.error(error.response?.data?.message || 'An error occurred while creating purchase order');
    }
  };

  const handleCreateRequest = async () => {
    try {
      const values = await createForm.validateFields();
      await stockRequestService.createStockRequest(values);
      message.success('Stock request created successfully');
      setIsCreateModalVisible(false);
      fetchStockRequests();
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
      urgent: 'purple'
    };
    return colors[priority] || 'default';
  };

  const getPriorityText = (priority) => {
    const texts = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    };
    return texts[priority] || priority;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
      completed: 'blue'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Approvals',
      approved: 'Approved',
      rejected: 'Reject',
      completed: 'Complete'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Request Number',
      dataIndex: 'requestNumber',
      key: 'requestNumber',
      width: 120
    },
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div>
          <div><strong>{record.product.name}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.product.productCode}
          </div>
        </div>
      )
    },
    {
      title: 'Stock',
      key: 'stock',
      render: (_, record) => (
        <div>
          <Tag color={record.currentStock <= record.product.minStock ? 'red' : 'green'}>
            {record.currentStock}
          </Tag>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Min: {record.product.minStock}
          </div>
        </div>
      ),
      width: 100
    },
    {
      title: 'Requested Qty',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: 100
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Requester',
      key: 'requestedBy',
      render: (_, record) => record.requestedBy.fullName,
      width: 150
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('en-US'),
      width: 100
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => {
        const canCreatePO = record.status === 'approved' && (user?.role === 'admin' || user?.role === 'director') && !record.purchaseOrder;
        
        return (
          <Space direction={isMobile ? "vertical" : "horizontal"} size="small">
            <Space wrap>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => showDetailModal(record)}
                size={isMobile ? "small" : "middle"}
              >
                {isMobile ? '' : 'Details'}
              </Button>
              {record.status === 'pending' && (user?.role === 'admin' || user?.role === 'director') && (
                <>
                  <Button
                    type="link"
                    icon={<CheckOutlined />}
                    style={{ color: 'green' }}
                    onClick={() => showApprovalModal(record, 'approved')}
                    size={isMobile ? "small" : "middle"}
                  >
                    {isMobile ? '' : 'Approve'}
                  </Button>
                  <Button
                    type="link"
                    icon={<CloseOutlined />}
                    danger
                    onClick={() => showApprovalModal(record, 'rejected')}
                    size={isMobile ? "small" : "middle"}
                  >
                    {isMobile ? '' : 'Reject'}
                  </Button>
                </>
              )}
              {canCreatePO && (
                <Button
                  type="link"
                  icon={<ShoppingCartOutlined />}
                  style={{ color: 'blue' }}
                  onClick={() => {
                    console.log('Creating purchase order for:', record);
                    console.log('User role:', user?.role);
                    console.log('Record status:', record.status);
                    console.log('Has purchase order:', !!record.purchaseOrder);
                    showPurchaseOrderModal(record);
                  }}
                  size={isMobile ? "small" : "middle"}
                >
                  {isMobile ? 'PO' : 'Create Purchase Order'}
                </Button>
              )}
              {record.purchaseOrder && (
                <Button
                  type="link"
                  style={{ color: 'green' }}
                  onClick={() => window.open(`/purchase-orders`, '_blank')}
                  size={isMobile ? "small" : "middle"}
                >
                  {isMobile ? 'View PO' : 'View Purchase Order'}
                </Button>
              )}
            </Space>
            {/* Debug info - hide on mobile */}
            {!isMobile && (
              <div style={{ fontSize: '10px', color: '#999' }}>
                Status: {record.status} | Role: {user?.role} | PO: {record.purchaseOrder ? 'Yes' : 'No'} | Show: {canCreatePO ? 'Yes' : 'No'}
              </div>
            )}
          </Space>
        );
      },
      width: isMobile ? 120 : 250
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <h1 style={{ margin: 0, minWidth: 'fit-content' }}>Stock Request</h1>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: 1,
            minWidth: 'fit-content'
          }}>
            {/* Debug info - hide on mobile */}
            {!isMobile && (
              <div style={{ 
                fontSize: '12px', 
                color: '#666'
              }}>
                User: {user?.fullName} | Role: {user?.role} | ID: {user?.id}
              </div>
            )}
            {(user?.role === 'warehouse_staff' || user?.role === 'admin') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showCreateModal}
                size={isMobile ? 'small' : 'middle'}
                style={{ 
                  minWidth: 'fit-content',
                  flexShrink: 0
                }}
              >
                {isMobile ? 'New' : 'Create New Request'}
              </Button>
            )}
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchStockRequests}
              size={isMobile ? 'small' : 'middle'}
              style={{ 
                minWidth: 'fit-content',
                flexShrink: 0
              }}
            >
              {isMobile ? '' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: '100%' }}
              allowClear
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
            >
              <Select.Option value="pending">Pending Approvals</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Reject</Select.Option>
              <Select.Option value="completed">Complete</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by priority"
              style={{ width: '100%' }}
              allowClear
              value={filters.priority}
              onChange={(value) => setFilters(prev => ({ ...prev, priority: value || '' }))}
            >
              <Select.Option value="urgent">Urgent</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="low">Low</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={stockRequests}
        loading={loading}
        rowKey="id"
        scroll={{ x: isMobile ? 800 : 1400 }}
        size={isMobile ? 'small' : 'middle'}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: !isMobile,
          showQuickJumper: !isMobile,
          showTotal: (total) => `Total ${total} requests`,
          size: isMobile ? 'small' : 'default',
          simple: isMobile
        }}
        onChange={handleTableChange}
      />

      {/* Detail Modal */}
      <Modal
        title="Stock Request Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Request Number:</strong> {selectedRequest.requestNumber}</p>
                <p><strong>Product:</strong> {selectedRequest.product.name}</p>
                <p><strong>Product Code:</strong> {selectedRequest.product.productCode}</p>
                <p><strong>Current Stock:</strong> {selectedRequest.currentStock}</p>
                <p><strong>Minimum Level:</strong> {selectedRequest.product.minStock}</p>
              </Col>
              <Col span={12}>
                <p><strong>Requested Quantity:</strong> {selectedRequest.requestedQuantity}</p>
                <p><strong>Priority:</strong> 
                  <Tag color={getPriorityColor(selectedRequest.priority)} style={{ marginLeft: 8 }}>
                    {getPriorityText(selectedRequest.priority)}
                  </Tag>
                </p>
                <p><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedRequest.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(selectedRequest.status)}
                  </Tag>
                </p>
                <p><strong>Requester:</strong> {selectedRequest.requestedBy.fullName}</p>
                <p><strong>Created Date:</strong> {new Date(selectedRequest.createdAt).toLocaleString('en-US')}</p>
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <p><strong>Request Reason:</strong></p>
              <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                {selectedRequest.reason}
              </div>
            </div>
            {selectedRequest.approvalNotes && (
              <div style={{ marginTop: 16 }}>
                <p><strong>Approval Notes:</strong></p>
                <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {selectedRequest.approvalNotes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Stock Request Modal */}
      <Modal
        title="Create New Stock Request"
        open={isCreateModalVisible}
        onOk={handleCreateRequest}
        onCancel={() => setIsCreateModalVisible(false)}
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="productId"
            label="Product"
            rules={[{ required: true, message: 'Please select product' }]}
          >
            <Select
              placeholder="Select Product"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {products.map(product => (
                <Select.Option key={product.id} value={product.id}>
                  <div>
                    <strong>{product.name}</strong> ({product.productCode})
                    <br />
                    <small style={{ color: '#666' }}>
                      Stock: {product.stock} | Min: {product.minStock}
                    </small>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="requestedQuantity"
            label="Requested Quantity"
            rules={[{ required: true, message: 'Please enter số lượng' }]}
          >
            <Input type="number" min={1} placeholder="Import số lượng cần nhập" />
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
            initialValue="medium"
          >
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="urgent">Urgent</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="Request Reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Example: Low stock, need to replenish to meet orders..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Approval Modal */}
      <Modal
        title={`${approvalAction === 'approved' ? 'Approve' : 'Reject'} stock request`}
        open={isApprovalModalVisible}
        onOk={handleApproval}
        onCancel={() => setIsApprovalModalVisible(false)}
        okText={approvalAction === 'approved' ? 'Approve' : 'Reject'}
        okButtonProps={{ danger: approvalAction === 'rejected' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="approvalNotes"
            label="Notes"
            rules={[{ required: true, message: 'Please enter ghi chú' }]}
          >
            <TextArea 
              rows={4} 
              placeholder={`Enter reason ${approvalAction === 'approved' ? 'phê duyệt' : 'từ chối'}...`}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Purchase Order Modal */}
      <Modal
        title="Create Purchase Order"
        open={isPurchaseOrderModalVisible}
        onOk={handleCreatePurchaseOrder}
        onCancel={() => setIsPurchaseOrderModalVisible(false)}
        width={600}
      >
        <Form form={purchaseOrderForm} layout="vertical">
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
            <p><strong>Stock Request:</strong> {selectedRequest?.requestNumber}</p>
            <p><strong>Product:</strong> {selectedRequest?.product?.name}</p>
            <p><strong>Quantity:</strong> {selectedRequest?.requestedQuantity}</p>
          </div>
          
          <Form.Item
            name="supplierId"
            label="Supplier"
            rules={[{ required: true, message: 'Please select nhà cung cấp' }]}
          >
            <Select
              placeholder="Select nhà cung cấp"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              style={{ width: '100%' }}
            >
              {suppliers.map(supplier => (
                <Select.Option key={supplier.id} value={supplier.id}>
                  {supplier.companyName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="Unit Price dự kiến (VNĐ)"
                rules={[{ required: true, message: 'Please enter USDơn giá' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Import USDơn giá"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="deliveryDate"
                label="Expected Delivery Date"
                rules={[{ required: true, message: 'Please select delivery date' }]}
              >
                <Input 
                  type="date" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="notes"
            label="Purchase Order Notes"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Enter notes for purchase order..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StockRequests;