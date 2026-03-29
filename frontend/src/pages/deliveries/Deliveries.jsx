import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Tag, Button, Space, Modal, Descriptions, message, Popconfirm, Form, Upload, Input } from 'antd';
import { EyeOutlined, UploadOutlined, CameraOutlined } from '@ant-design/icons';
import { fetchDeliveries } from '../../store/slices/deliverySlice';
import { deliveryService } from '../../services/deliveryService';
import dayjs from 'dayjs';

const Deliveries = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector(state => state.deliveries);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeliveryConfirmModalVisible, setIsDeliveryConfirmModalVisible] = useState(false);
  const [confirmingDelivery, setConfirmingDelivery] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchDeliveries({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleTableChange = (pag) => {
    dispatch(fetchDeliveries({ page: pag.current, limit: pag.pageSize }));
  };

  const showDetail = async (delivery) => {
    try {
      const response = await deliveryService.getById(delivery.id);
      setSelectedDelivery(response.data.data);
      setIsModalVisible(true);
    } catch (error) {
      message.error('Cannot load delivery details');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await deliveryService.updateStatus(id, status);
      message.success('Status updated successfully');
      dispatch(fetchDeliveries({ page: pagination.page, limit: pagination.limit }));
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleConfirmDelivery = (delivery) => {
    setConfirmingDelivery(delivery);
    setFileList([]);
    form.resetFields();
    setIsDeliveryConfirmModalVisible(true);
  };

  const handleDeliveryConfirmSubmit = async () => {
    try {
      // Validate that at least one image is uploaded
      if (fileList.length === 0) {
        message.error('Please upload at least 1 delivery confirmation image');
        return;
      }

      const values = await form.validateFields();
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add form fields
      formData.append('status', 'delivered');
      if (values.deliveryNotes) {
        formData.append('deliveryNotes', values.deliveryNotes);
      }
      
      // Add files
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });
      
      console.log('📁 Uploading delivery confirmation images:', fileList.length);
      
      await deliveryService.updateStatusWithImages(confirmingDelivery.id, formData);
      message.success('Delivery confirmed successfully');
      setIsDeliveryConfirmModalVisible(false);
      setIsModalVisible(false);
      dispatch(fetchDeliveries({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      console.error('❌ Delivery confirmation error:', error.response?.data);
      message.error(error.response?.data?.message || 'An error occurred while confirming delivery');
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'default',
      in_transit: 'processing',
      delivered: 'success',
      failed: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      in_transit: 'Shipping',
      delivered: 'Delivered',
      failed: 'Failed',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: ['order', 'orderNumber'],
      key: 'orderNumber'
    },
    {
      title: 'Tracking Number',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber'
    },
    {
      title: 'Delivery Staff',
      dataIndex: ['deliveryStaff', 'fullName'],
      key: 'deliveryStaff',
      render: (name) => name || 'Not Assigned'
    },
    {
      title: 'Delivery Address',
      dataIndex: 'deliveryAddress',
      key: 'deliveryAddress',
      ellipsis: true
    },
    {
      title: 'Expected Delivery Date',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
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
        </Space>
      )
    }
  ];

  return (
    <div>
      <h1>Delivery Management</h1>

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
          showTotal: (total) => `Total ${total} deliveries`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Delivery Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={
          selectedDelivery && (
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Close
              </Button>
              {selectedDelivery.status === 'pending' && (
                <Popconfirm
                  title="Start this delivery?"
                  onConfirm={() => handleUpdateStatus(selectedDelivery.id, 'in_transit')}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary">
                    Start Delivery
                  </Button>
                </Popconfirm>
              )}
              {selectedDelivery.status === 'in_transit' && (
                <Button 
                  type="primary" 
                  icon={<CameraOutlined />}
                  onClick={() => handleConfirmDelivery(selectedDelivery)}
                >
                  Confirm Delivered
                </Button>
              )}
            </Space>
          )
        }
        width={800}
      >
        {selectedDelivery && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tracking Number" span={2}>
                {selectedDelivery.trackingNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Order Number">
                {selectedDelivery.order?.orderNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedDelivery.order?.customer?.companyName}
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Staff">
                {selectedDelivery.deliveryStaff?.fullName || 'Not Assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedDelivery.status)}>
                  {getStatusText(selectedDelivery.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Expected Delivery Date">
                {dayjs(selectedDelivery.deliveryDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Actual Delivery Date">
                {selectedDelivery.deliveredAt 
                  ? dayjs(selectedDelivery.deliveredAt).format('DD/MM/YYYY HH:mm')
                  : 'Not Delivered'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Address" span={2}>
                {selectedDelivery.deliveryAddress}
              </Descriptions.Item>
              {selectedDelivery.notes && (
                <Descriptions.Item label="Notes" span={2}>
                  {selectedDelivery.notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Showing preparation images from warehouse staff */}
            {selectedDelivery.order?.preparationImages && (() => {
              console.log('📦 Trying to display preparation images from warehouse:', selectedDelivery.order.preparationImages);
              try {
                const images = JSON.parse(selectedDelivery.order.preparationImages);
                console.log('✅ Parsed preparation images:', images);
                if (images && images.length > 0) {
                  return (
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ color: '#1890ff', marginBottom: 12 }}>
                        📦 Prepared Goods Images (from warehouse staff):
                      </h4>
                      <div style={{ 
                        padding: 12, 
                        backgroundColor: '#f0f9ff', 
                        borderRadius: 4, 
                        border: '1px solid #bae6fd',
                        marginBottom: 12
                      }}>
                        <p style={{ margin: 0, color: '#0369a1', fontSize: '14px' }}>
                          ✅ Warehouse staff has prepared and checked the goods. Ready for delivery to customer.
                        </p>
                      </div>
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

            {/* Showing preparation notes from warehouse staff */}
            {selectedDelivery.order?.notes && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ color: '#52c41a', marginBottom: 8 }}>
                  📝 Preparation notes from warehouse staff:
                </h4>
                <div style={{ 
                  padding: 12, 
                  backgroundColor: '#f6ffed', 
                  borderRadius: 4, 
                  border: '1px solid #b7eb8f',
                  fontSize: '14px'
                }}>
                  {selectedDelivery.order.notes}
                </div>
              </div>
            )}

            {/* Showing delivery images if delivered */}
            {selectedDelivery.status === 'delivered' && selectedDelivery.deliveryImages && (() => {
              console.log('📦 Trying to display delivery images:', selectedDelivery.deliveryImages);
              try {
                const images = JSON.parse(selectedDelivery.deliveryImages);
                console.log('✅ Parsed delivery images:', images);
                if (images && images.length > 0) {
                  return (
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ color: '#52c41a', marginBottom: 12 }}>
                        📸 Delivery Confirmation Images:
                      </h4>
                      <div style={{ 
                        padding: 12, 
                        backgroundColor: '#f6ffed', 
                        borderRadius: 4, 
                        border: '1px solid #b7eb8f',
                        marginBottom: 12
                      }}>
                        <p style={{ margin: 0, color: '#389e0d', fontSize: '14px' }}>
                          ✅ Goods have been successfully delivered to customer.
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {images.map((imageUrl, index) => (
                          <img 
                            key={index}
                            src={`http://localhost:5001${imageUrl}`}
                            alt={`Confirm Delivery ${index + 1}`}
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
                              console.error('❌ Failed to load delivery image:', imageUrl);
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
                console.error('❌ Error parsing delivery images:', e);
                return null;
              }
              return null;
            })()}
          </div>
        )}
      </Modal>

      {/* Delivery confirmation modal with image upload */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CameraOutlined style={{ color: '#52c41a' }} />
            <span>Delivery confirmed successfully</span>
          </div>
        }
        open={isDeliveryConfirmModalVisible}
        onOk={handleDeliveryConfirmSubmit}
        onCancel={() => setIsDeliveryConfirmModalVisible(false)}
        okText="Confirm Delivery"
        cancelText="Cancel"
        width={700}
        okButtonProps={{ 
          icon: <CameraOutlined />,
          style: { backgroundColor: '#52c41a', borderColor: '#52c41a' }
        }}
      >
        {confirmingDelivery && (
          <div>
            <div style={{ 
              padding: 16, 
              backgroundColor: '#f0f9ff', 
              borderRadius: 8, 
              border: '1px solid #bae6fd',
              marginBottom: 20
            }}>
              <h4 style={{ color: '#0369a1', margin: 0, marginBottom: 8 }}>
                📦 Order Information:
              </h4>
              <p style={{ margin: 0, color: '#0369a1' }}>
                <strong>Order Number:</strong> {confirmingDelivery.order?.orderNumber} | 
                <strong> Customer:</strong> {confirmingDelivery.order?.customer?.companyName}
              </p>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item
                label={
                  <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                    📸 Upload delivery confirmation images (required)
                  </span>
                }
                required
              >
                <div style={{ 
                  padding: 12, 
                  backgroundColor: '#f6ffed', 
                  borderRadius: 4, 
                  border: '1px solid #b7eb8f',
                  marginBottom: 12
                }}>
                  <p style={{ margin: 0, color: '#389e0d', fontSize: '14px' }}>
                    ✅ Please take photos as proof of delivery to customer (e.g.: customer receiving goods, goods at delivery location, confirmation signature...)
                  </p>
                </div>
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false}
                  accept="image/*"
                  multiple
                >
                  {fileList.length >= 5 ? null : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Select image</div>
                    </div>
                  )}
                </Upload>
                {fileList.length === 0 && (
                  <p style={{ color: '#ff4d4f', fontSize: '12px', margin: '8px 0 0 0' }}>
                    * At least 1 delivery confirmation image is required
                  </p>
                )}
              </Form.Item>

              <Form.Item
                name="deliveryNotes"
                label={
                  <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    📝 Delivery Notes (optional)
                  </span>
                }
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Notes about delivery process, customer receiving status..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Deliveries;
