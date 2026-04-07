import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Space, Tag, Modal, Descriptions, message, Popconfirm, Form, Upload, Input } from 'antd';
import { EyeOutlined, CheckOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, ReloadOutlined } from '@ant-design/icons';
import { fetchOrders, createOrder, updateOrder, deleteOrder } from '../../store/slices/orderSlice';
import { orderService } from '../../services/orderService';
import OrderForm from '../../components/OrderForm';
import PermissionButton from '../../components/PermissionButton';
import useResponsive from '../../hooks/useResponsive';
import dayjs from 'dayjs';

const Orders = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector(state => state.orders);
  const { isMobile } = useResponsive();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isPreparationModalVisible, setIsPreparationModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [preparingOrder, setPreparingOrder] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleTableChange = (pag) => {
    dispatch(fetchOrders({ page: pag.current, limit: pag.pageSize }));
  };

  const handleRefresh = () => {
    dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }));
    message.success('Order list refreshed');
  };

  const showDetail = async (order) => {
    try {
      const response = await orderService.getById(order.id);
      setSelectedOrder(response.data.data);
      setIsModalVisible(true);
    } catch (error) {
      message.error('Cannot load order details');
    }
  };

  const showFormModal = (order = null) => {
    setEditingOrder(order);
    setIsFormModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingOrder) {
        await dispatch(updateOrder({ id: editingOrder.id, data: values })).unwrap();
        message.success('Order updated successfully');
      } else {
        await dispatch(createOrder(values)).unwrap();
        message.success('Order created successfully');
      }
      setIsFormModalVisible(false);
      dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteOrder(id)).unwrap();
      message.success('Order deleted successfully');
      dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const handleApprove = async (id) => {
    try {
      await orderService.approve(id);
      message.success('Order approved successfully');
      dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleProcess = async (id) => {
    try {
      await orderService.updateStatus(id, 'processing');
      message.success('Order moved to processing status');
      dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleComplete = async (order) => {
    // Check if order is still in processing status before allowing completion
    try {
      const response = await orderService.getById(order.id);
      const currentOrder = response.data.data;
      
      if (currentOrder.status !== 'processing') {
        message.warning(`Order has been moved to status "${getStatusText(currentOrder.status)}" and cannot be completed`);
        // Refresh the list to show current status
        dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }));
        return;
      }
      
      setPreparingOrder(currentOrder);
      setFileList([]);
      form.resetFields();
      setIsPreparationModalVisible(true);
    } catch (error) {
      message.error('Cannot check order status');
    }
  };

  const handlePreparationSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add form fields
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });
      
      // Add files
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });
      
      console.log('📁 Uploading preparation images:', fileList.length);
      
      await orderService.completeWithImages(preparingOrder.id, formData);
      message.success('Goods preparation completed');
      setIsPreparationModalVisible(false);
      dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      console.error('❌ Complete order error:', error.response?.data);
      
      if (error.response?.status === 400) {
        message.warning(error.response?.data?.message || 'Order cannot be completed');
        // Refresh the list to show current status
        dispatch(fetchOrders({ page: pagination.page, limit: pagination.limit }));
        setIsPreparationModalVisible(false);
      } else {
        message.error(error.response?.data?.message || 'An error occurred while completing order');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      pending: 'processing',
      approved: 'success',
      processing: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      pending: 'Pending Approvals',
      approved: 'Approved',
      processing: 'Processing',
      completed: 'Complete',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber'
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'companyName'],
      key: 'customer'
    },
    {
      title: 'Employee',
      dataIndex: ['salesPerson', 'fullName'],
      key: 'salesPerson'
    },
    {
      title: 'Number of Products',
      dataIndex: 'orderItems',
      key: 'itemCount',
      render: (items) => items?.length || 0
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${parseFloat(amount || 0).toLocaleString()} VND`
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const methods = {
          prepayment: { text: 'Prepayment', color: 'blue' },
          cod_cash: { text: 'COD Cash', color: 'green' },
          cod_transfer: { text: 'COD Transfer', color: 'cyan' },
          credit_terms: { text: 'Tín dụng', color: 'orange' }
        };
        const methodInfo = methods[method] || { text: method, color: 'default' };
        return <Tag color={methodInfo.color}>{methodInfo.text}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            Details
          </Button>
          {record.status === 'draft' && (
            <>
              <PermissionButton
                action="order.edit"
                type="link"
                icon={<EditOutlined />}
                onClick={() => showFormModal(record)}
              >
                Edit
              </PermissionButton>
              <Popconfirm
                title="Are you sure you want to delete?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <PermissionButton
                  action="order.delete"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  Delete
                </PermissionButton>
              </Popconfirm>
            </>
          )}
          {record.status === 'pending' && (
            <Popconfirm
              title="Approve this order?"
              onConfirm={() => handleApprove(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <PermissionButton
                action="order.approve"
                type="link"
                icon={<CheckOutlined />}
              >
                Approve
              </PermissionButton>
            </Popconfirm>
          )}
          {record.status === 'approved' && (
            <Popconfirm
              title="Start processing this order?"
              onConfirm={() => handleProcess(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <PermissionButton
                action="order.process"
                type="link"
                icon={<CheckOutlined />}
              >
                Process
              </PermissionButton>
            </Popconfirm>
          )}
          {record.status === 'processing' && (
            <PermissionButton
              action="order.complete"
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleComplete(record)}
            >
              Complete
            </PermissionButton>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h1 style={{ margin: 0 }}>Order Management</h1>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            size={isMobile ? 'small' : 'middle'}
            style={{ flexShrink: 0 }}
          >
            {isMobile ? '' : 'Refresh'}
          </Button>
          <PermissionButton
            action="order.create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showFormModal()}
            size={isMobile ? 'small' : 'middle'}
            style={{ flexShrink: 0 }}
          >
            {isMobile ? 'Create' : 'Create Order'}
          </PermissionButton>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={list}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} orders`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Order Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order Number" span={2}>
                {selectedOrder.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedOrder.customer?.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.customer?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Sales Staff">
                {selectedOrder.salesPerson?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Date cập nhật">
                {dayjs(selectedOrder.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: 16, marginBottom: 8 }}>Product</h3>
            <Table
              dataSource={selectedOrder.orderItems}
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
              columns={[
                { title: 'Product', dataIndex: 'productName', key: 'productName' },
                { title: 'SKU', dataIndex: 'productSku', key: 'productSku' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                { 
                  title: 'Unit Price', 
                  dataIndex: 'unitPrice', 
                  key: 'unitPrice',
                  render: (val) => `${parseFloat(val).toLocaleString()} VND`
                },
                { title: 'Discount', dataIndex: 'discount', key: 'discount', render: (val) => `${val}%` },
                { 
                  title: 'Total', 
                  dataIndex: 'total', 
                  key: 'total',
                  render: (val) => `${parseFloat(val).toLocaleString()} VND`
                }
              ]}
            />

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <p><strong>Total:</strong> {parseFloat(selectedOrder.totalAmount).toLocaleString()} VND</p>
            </div>

            {selectedOrder.notes && (
              <Descriptions bordered style={{ marginTop: 16 }}>
                <Descriptions.Item label="Notes" span={2}>
                  {selectedOrder.notes}
                </Descriptions.Item>
              </Descriptions>
            )}

            {/* Display preparation images for completed orders */}
            {selectedOrder.status === 'completed' && selectedOrder.preparationImages && (() => {
              console.log('📦 Trying to display preparation images:', selectedOrder.preparationImages);
              try {
                const images = JSON.parse(selectedOrder.preparationImages);
                console.log('✅ Parsed preparation images:', images);
                if (images && images.length > 0) {
                  return (
                    <div style={{ marginTop: 16 }}>
                      <h4>Prepared Goods Images:</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {images.map((imageUrl, index) => (
                          <img 
                            key={index}
                            src={`http://localhost:5001${imageUrl}`}
                            alt={`Prepared goods ${index + 1}`}
                            style={{ 
                              width: 120, 
                              height: 120, 
                              objectFit: 'cover', 
                              borderRadius: 4,
                              border: '2px solid #52c41a',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(`http://localhost:5001${imageUrl}`, '_blank')}
                            onError={(e) => {
                              console.error('❌ Failed to load preparation image:', imageUrl);
                              e.target.style.border = '2px solid #ccc';
                              e.target.alt = 'Cannot load image';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch (e) {
                console.error('❌ Error parsing preparation images:', e);
                return null;
              }
              return null;
            })()}
          </div>
        )}
      </Modal>

      <Modal
        title={editingOrder ? 'Edit Order' : 'Create Order'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width={1100}
        destroyOnHidden
      >
        <OrderForm
          initialValues={editingOrder}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormModalVisible(false)}
        />
      </Modal>

      {/* Goods preparation modal */}
      <Modal
        title="Prepare goods for delivery"
        open={isPreparationModalVisible}
        onOk={handlePreparationSubmit}
        onCancel={() => setIsPreparationModalVisible(false)}
        okText="Complete Preparation"
        cancelText="Cancel"
        width={700}
      >
        {preparingOrder && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 4, border: '1px solid #bae6fd' }}>
              <h4 style={{ margin: 0, color: '#0369a1' }}>📦 Order Information</h4>
              <div style={{ marginTop: 8 }}>
                <p><strong>Order Number:</strong> {preparingOrder.orderNumber}</p>
                <p><strong>Customer:</strong> {preparingOrder.customer?.companyName}</p>
                <p><strong>Number of Products:</strong> {preparingOrder.orderItems?.length || 0} products</p>
                <p><strong>Total Amount:</strong> {parseFloat(preparingOrder.totalAmount || 0).toLocaleString()} VND</p>
              </div>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item
                name="preparationNotes"
                label="Goods Preparation Notes"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Notes about goods preparation process, quality inspection, packaging..."
                />
              </Form.Item>

              <Form.Item
                label="Prepared Goods Images"
                extra="Take photos of packaged goods to prove full preparation for customer"
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                  beforeUpload={() => false} // Prevent auto upload
                  accept="image/*"
                  multiple
                >
                  {fileList.length >= 8 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
