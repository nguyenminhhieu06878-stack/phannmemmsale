import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, message, Tag, Select, Card, Row, Col, InputNumber, Input, Upload } from 'antd';
import { EyeOutlined, SendOutlined, CheckOutlined, TruckOutlined, ReloadOutlined, CloseOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import { useSelector } from 'react-redux';

const PurchaseOrders = () => {
  const { user } = useSelector(state => state.auth);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ status: '' });
  const [selectedPO, setSelectedPO] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPurchaseOrders();
  }, [pagination.page, pagination.limit, filters]);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const response = await purchaseOrderService.getAllPurchaseOrders(params);
      console.log('🔍 API Response:', response.data.data.purchaseOrders);
      
      // Debug: Check if any orders have images
      const ordersWithImages = response.data.data.purchaseOrders?.filter(order => 
        order.receiptImages || order.rejectionImages
      );
      console.log('📸 Orders with images:', ordersWithImages);
      
      setPurchaseOrders(response.data.data.purchaseOrders || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      message.error('Cannot load purchase order list: ' + (error.response?.data?.message || error.message));
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

  const showDetailModal = (po) => {
    console.log('🔍 Selected PO for detail modal:', po);
    console.log('📸 Receipt images field:', po.receiptImages);
    console.log('🚫 Rejection images field:', po.rejectionImages);
    console.log('📝 Notes field:', po.notes);
    setSelectedPO(po);
    setIsDetailModalVisible(true);
  };

  const showActionModal = (po, action) => {
    setSelectedPO(po);
    setActionType(action);
    setFileList([]);
    form.resetFields();
    setIsActionModalVisible(true);
  };

  const handleAction = async () => {
    try {
      console.log('🔄 HandleAction called with actionType:', actionType);
      console.log('📋 Form values before validation:', form.getFieldsValue());
      
      const values = await form.validateFields();
      console.log('✅ Form validation passed, values:', values);
      
      // Handle regular purchase order actions
      console.log('🎯 Processing regular order action:', actionType);
      switch (actionType) {
        case 'send':
          await purchaseOrderService.sendPurchaseOrder(selectedPO.id);
          message.success('Purchase order sent to supplier');
          break;
        case 'confirm':
          await purchaseOrderService.confirmPurchaseOrder(selectedPO.id, values);
          message.success('Purchase order confirmed');
          break;
        case 'ship':
          // Create FormData for file upload
          const shipFormData = new FormData();
          
          // Add form fields
          Object.keys(values).forEach(key => {
            if (values[key] !== undefined && values[key] !== null) {
              shipFormData.append(key, values[key]);
            }
          });
          
          // Add files
          fileList.forEach(file => {
            if (file.originFileObj) {
              shipFormData.append('images', file.originFileObj);
            }
          });
          
          console.log('📁 Uploading shipping images:', fileList.length);
          
          await purchaseOrderService.markAsShippedWithImages(selectedPO.id, shipFormData);
          message.success('Delivery status updated');
          break;
        case 'confirm_replacement':
          await purchaseOrderService.confirmReplacement(selectedPO.id, values);
          message.success('Confirmed will provide replacement goods');
          break;
        case 'ship_replacement':
          await purchaseOrderService.shipReplacement(selectedPO.id, values);
          message.success('Replacement goods delivered');
          break;
        case 'receive':
        case 'reject_delivery':
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
          
          console.log('📁 Uploading with files:', fileList.length);
          
          if (actionType === 'receive') {
            await purchaseOrderService.confirmReceiptWithImages(selectedPO.id, formData);
            message.success('Receipt confirmed');
          } else {
            await purchaseOrderService.rejectDeliveryWithImages(selectedPO.id, formData);
            message.success('Receipt rejected');
          }
          break;
        default:
          console.log('❌ Unknown action type:', actionType);
      }
      fetchPurchaseOrders();
      
      setIsActionModalVisible(false);
    } catch (error) {
      console.error('❌ HandleAction error:', error);
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'orange',
      sent: 'blue',
      confirmed: 'green',
      shipped: 'purple',
      received: 'cyan',
      completed: 'success',
      rejected: 'red',
      partial_received: 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      draft: 'Draft',
      sent: 'Sent',
      confirmed: 'Confirmed',
      shipped: 'Shipping',
      received: 'Received',
      completed: 'Complete',
      rejected: 'Rejected',
      partial_received: 'Partially Received'
    };
    return texts[status] || status;
  };

  const canPerformAction = (po, action) => {
    const { role } = user;
    
    // Actions for regular orders
    switch (action) {
      case 'send':
        return (role === 'admin' || role === 'director') && po.status === 'draft';
      case 'confirm':
        return role === 'supplier' && po.status === 'sent';
      case 'ship':
        return role === 'supplier' && po.status === 'confirmed';
      case 'receive':
      case 'reject_delivery':
        return (role === 'admin' || role === 'warehouse_staff') && po.status === 'shipped';
      default:
        return false;
    }
  };

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 120
    },
    {
      title: 'Supplier',
      key: 'supplier',
      render: (_, record) => record.supplier?.companyName || 'N/A',
      width: 200
    },
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <div>
          <div><strong>{record.product?.name || 'N/A'}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.product?.productCode || 'N/A'}
          </div>
        </div>
      ),
      width: 200
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100
    },
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => price ? `${price.toLocaleString('en-US')} VND` : 'Not available',
      width: 120
    },
    {
      title: 'Total Amount',
      key: 'totalAmount',
      render: (_, record) => {
        const total = (record.quantity || 0) * (record.unitPrice || 0);
        return total > 0 ? `${total.toLocaleString('en-US')} VND` : 'Not available';
      },
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        let statusInfo = {
          color: getStatusColor(status),
          text: getStatusText(status)
        };
        
        // Add quantity info for completed orders
        if (status === 'completed' && record.receivedQuantity) {
          const variance = record.receivedQuantity - record.quantity;
          const varianceText = variance > 0 ? `+${variance}` : variance < 0 ? `${variance}` : '✓';
          const varianceColor = variance > 0 ? '#f5222d' : variance < 0 ? '#fa8c16' : '#52c41a';
          
          return (
            <div>
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
              <div style={{ fontSize: '11px', color: varianceColor, marginTop: 2 }}>
                Received: {record.receivedQuantity}/{record.quantity} ({varianceText})
              </div>
            </div>
          );
        }
        
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      width: 120
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('en-US'),
      width: 120
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
          >
            Details
          </Button>
          {canPerformAction(record, 'send') && (
            <Button
              type="link"
              icon={<SendOutlined />}
              onClick={() => showActionModal(record, 'send')}
            >
              Send NCC
            </Button>
          )}
          {canPerformAction(record, 'confirm') && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              style={{ color: 'green' }}
              onClick={() => showActionModal(record, 'confirm')}
            >
              Confirm
            </Button>
          )}
          {canPerformAction(record, 'ship') && (
            <Button
              type="link"
              icon={<TruckOutlined />}
              onClick={() => showActionModal(record, 'ship')}
            >
              Delivery
            </Button>
          )}
          {canPerformAction(record, 'receive') && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                style={{ color: 'blue' }}
                onClick={() => showActionModal(record, 'receive')}
              >
                Receive Goods
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                danger
                onClick={() => showActionModal(record, 'reject_delivery')}
              >
                Reject Receipt
              </Button>
            </>
          )}
        </Space>
      ),
      width: 250
    }
  ];

  const getActionModalTitle = () => {
    const titles = {
      send: 'Send Purchase Order',
      confirm: 'Confirm Purchase Order',
      ship: 'Update Delivery',
      receive: 'Confirm Receipt',
      reject_delivery: 'Reject Receipt',
      confirm_replacement: 'Confirm Replacement Supply',
      ship_replacement: 'Replacement Delivery'
    };
    return titles[actionType] || '';
  };

  const renderActionForm = () => {
    // Regular order forms
    switch (actionType) {
      case 'send':
        return (
          <div>
            <p>Are you sure you want to send this purchase order to the supplier?</p>
          </div>
        );
      case 'confirm':
        return (
          <Form form={form} layout="vertical">
            <Form.Item
              name="unitPrice"
              label="Unit Price"
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
            <Form.Item
              name="estimatedDeliveryDate"
              label="Expected Delivery Date"
              rules={[{ required: true, message: 'Please select delivery date' }]}
            >
              <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '4px' }} />
            </Form.Item>
          </Form>
        );
      case 'ship':
        return (
          <Form form={form} layout="vertical">
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 4, border: '1px solid #bae6fd' }}>
              <h4 style={{ margin: 0, color: '#0369a1' }}>🚚 Prepare for Delivery</h4>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <p><strong>Order Number:</strong> {selectedPO?.poNumber}</p>
                  <p><strong>Product:</strong> {selectedPO?.product?.name}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Quantity:</strong> {selectedPO?.quantity}</p>
                  <p><strong>Customer:</strong> {selectedPO?.supplier?.companyName}</p>
                </Col>
              </Row>
            </div>
            
            <Form.Item
              name="trackingNumber"
              label="Tracking Number"
            >
              <Input placeholder="Enter tracking number (if available)" />
            </Form.Item>
            
            <Form.Item
              name="shippingNotes"
              label="Delivery Notes"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Information about delivery, quality commitment, expected time..."
              />
            </Form.Item>

            <Form.Item
              label="Prepared Goods Images"
              extra="Chụp ảnh hàng hóa USDã USDóng gói USDể chứng minh USDã giao USDủ hàng cho USDơn vị vận chuyển"
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
        );
      case 'receive':
        return (
          <Form form={form} layout="vertical">
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 4, border: '1px solid #bae6fd' }}>
              <h4 style={{ margin: 0, color: '#0369a1' }}>📦 Order Information</h4>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <p><strong>Order Number:</strong> {selectedPO?.poNumber}</p>
                  <p><strong>Product:</strong> {selectedPO?.product?.name}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Ordered Quantity:</strong> {selectedPO?.quantity}</p>
                  <p><strong>Supplier:</strong> {selectedPO?.supplier?.companyName}</p>
                </Col>
              </Row>
            </div>
            
            <Form.Item
              name="receivedQuantity"
              label="Quantity thực nhận"
              rules={[
                { required: true, message: 'Please enter số lượng thực nhận' },
                { type: 'number', min: 0, message: 'Quantity phải lớn hơn 0' }
              ]}
              extra={`Quantity USDặt hàng: ${selectedPO?.quantity || 0}`}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={selectedPO?.quantity * 1.1} // Cho phép nhận nhiều hơn 10% so với USDặt hàng
                placeholder="Import số lượng thực tế nhận USDược"
                onChange={(value) => {
                  const ordered = selectedPO?.quantity || 0;
                  if (value > ordered) {
                    message.warning(`Received Quantity (${value}) nhiều hơn số lượng USDặt (${ordered})`);
                  } else if (value < ordered) {
                    message.warning(`Received Quantity (${value}) ít hơn số lượng USDặt (${ordered})`);
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="qualityStatus"
              label="Quality Status"
              rules={[{ required: true, message: 'Please select quality status' }]}
            >
              <Select placeholder="Evaluate goods quality">
                <Select.Option value="excellent">Excellent - Perfect goods</Select.Option>
                <Select.Option value="good">Good - Meets requirements</Select.Option>
                <Select.Option value="acceptable">Acceptable - Minor defects</Select.Option>
                <Select.Option value="poor">Poor - Quality issues</Select.Option>
                <Select.Option value="rejected">Reject - Does not meet requirements</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="packagingCondition"
              label="Tình trạng USDóng gói"
              rules={[{ required: true, message: 'Please select tình trạng USDóng gói' }]}
            >
              <Select placeholder="Evaluate packaging condition">
                <Select.Option value="intact">Intact - No damage</Select.Option>
                <Select.Option value="minor_damage">Minor damage - Does not affect product</Select.Option>
                <Select.Option value="damaged">Damaged - May affect product</Select.Option>
                <Select.Option value="severely_damaged">Damaged nặng - Cần kiểm tra kỹ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="deliveryNotes"
              label="Notes về giao hàng"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Notes về quá trình giao nhận, tình trạng hàng hóa, vấn USDề phát sinh (nếu có)..."
              />
            </Form.Item>

            <Form.Item
              name="warehouseLocation"
              label="Vị trí lưu kho"
              rules={[{ required: true, message: 'Please enter vị trí lưu kho' }]}
            >
              <Input placeholder="Ví dụ: Kệ A1-B2, Khu vực 1, Tầng 2..." />
            </Form.Item>

            <Form.Item
              name="inspectionDate"
              label="Date kiểm tra"
              rules={[{ required: true, message: 'Please select ngày kiểm tra' }]}
              initialValue={new Date().toISOString().split('T')[0]}
            >
              <Input 
                type="date" 
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Images hàng hóa"
              extra="Chụp ảnh hàng hóa USDể nhà cung cấp có thể xem tình trạng thực tế"
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
        );
      case 'reject_delivery':
        return (
          <Form form={form} layout="vertical">
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff2f0', borderRadius: 4, border: '1px solid #ffccc7' }}>
              <h4 style={{ margin: 0, color: '#cf1322' }}>❌ Reject Receipt</h4>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <p><strong>Order Number:</strong> {selectedPO?.poNumber}</p>
                  <p><strong>Product:</strong> {selectedPO?.product?.name}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Quantity:</strong> {selectedPO?.quantity}</p>
                  <p><strong>Supplier:</strong> {selectedPO?.supplier?.companyName}</p>
                </Col>
              </Row>
            </div>
            
            <Form.Item
              name="rejectionReason"
              label="Reason rejected chính"
              rules={[{ required: true, message: 'Please select lý do rejected' }]}
            >
              <Select 
                placeholder="Select lý do rejected nhận hàng"
                onChange={(value) => console.log('Rejection reason selected:', value)}
              >
                <Select.Option value="quality_issues">Product quality issues</Select.Option>
                <Select.Option value="packaging_damage">Packaging damage</Select.Option>
                <Select.Option value="wrong_product">Wrong product</Select.Option>
                <Select.Option value="quantity_mismatch">Sai số lượng</Select.Option>
                <Select.Option value="expired_product">Product hết hạn</Select.Option>
                <Select.Option value="incomplete_delivery">Delivery không USDầy USDủ</Select.Option>
                <Select.Option value="other">Reason khác</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="qualityIssues"
              label="Quality issue details (if any)"
            >
              <Select mode="multiple" placeholder="Select quality issues">
                <Select.Option value="defective">Defective product</Select.Option>
                <Select.Option value="damaged">Damaged product</Select.Option>
                <Select.Option value="scratched">Bị trầy xước</Select.Option>
                <Select.Option value="incomplete">Missing accessories</Select.Option>
                <Select.Option value="wrong_specs">Wrong specifications</Select.Option>
                <Select.Option value="poor_quality">Quality kém</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="packagingIssues"
              label="Details vấn USDề bao bì (nếu có)"
            >
              <Select mode="multiple" placeholder="Select các vấn USDề về bao bì">
                <Select.Option value="torn">Bao bì rách</Select.Option>
                <Select.Option value="wet">Bao bì ướt</Select.Option>
                <Select.Option value="crushed">Bao bì bị ép</Select.Option>
                <Select.Option value="opened">Bao bì USDã mở</Select.Option>
                <Select.Option value="missing_labels">Thiếu nhãn mác</Select.Option>
                <Select.Option value="wrong_packaging">Sai loại bao bì</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="quantityIssues"
              label="Vấn USDề về số lượng (nếu có)"
            >
              <Input placeholder="Ví dụ: Thiếu 5 products, hoặc nhận thêm 3 products..." />
            </Form.Item>

            <Form.Item
              name="rejectionNotes"
              label="Detailed Notes"
              rules={[{ required: true, message: 'Please enter detailed notes about rejection reason' }]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Detailed description of goods condition, rejection reason, and specific issues..."
                onChange={(e) => console.log('Rejection notes:', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="requestReplacement"
              valuePropName="checked"
              initialValue={true}
            >
              <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                <input 
                  type="checkbox" 
                  style={{ marginRight: 8 }}
                  defaultChecked={true}
                />
                <span style={{ color: '#389e0d', fontWeight: 'bold' }}>
                  🔄 Yêu cầu nhà cung cấp gửi lại hàng thay thế
                </span>
              </div>
            </Form.Item>

            <Form.Item
              label="Evidence Images"
              extra="Take photos of quality issues so supplier can clearly see rejection reason"
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
        );
      case 'confirm_replacement':
        return (
          <Form form={form} layout="vertical">
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
              <h4 style={{ margin: 0, color: '#d46b08' }}>🔄 Confirm Replacement Supply</h4>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <p><strong>Order Number:</strong> {selectedPO?.poNumber}</p>
                  <p><strong>Product:</strong> {selectedPO?.product?.name}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Quantity:</strong> {selectedPO?.quantity}</p>
                  <p><strong>Rejection Reason:</strong> Quality issues</p>
                </Col>
              </Row>
            </div>
            
            <Form.Item
              name="estimatedDeliveryDate"
              label="Expected Delivery Date"
              rules={[{ required: true, message: 'Please select delivery date' }]}
            >
              <Input type="date" style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="supplierNotes"
              label="Cam kết từ nhà cung cấp"
              rules={[{ required: true, message: 'Please enter cam kết' }]}
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Commitment on replacement goods quality, delivery time..."
              />
            </Form.Item>
          </Form>
        );
      case 'ship_replacement':
        return (
          <Form form={form} layout="vertical">
            <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
              <h4 style={{ margin: 0, color: '#389e0d' }}>🚚 Replacement Delivery</h4>
              <p style={{ margin: '8px 0 0 0' }}>
                Confirm USDã gửi {selectedPO?.quantity} products {selectedPO?.product?.name} thay thế
              </p>
            </div>
            
            <Form.Item
              name="trackingNumber"
              label="Tracking Number"
            >
              <Input placeholder="Enter tracking number (if available)" />
            </Form.Item>
            
            <Form.Item
              name="supplierNotes"
              label="Delivery Notes"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Information about replacement delivery, quality commitment..."
              />
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Purchase Order</h1>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchPurchaseOrders}>
            Refresh
          </Button>
        </Space>
      </div>

      {user?.role === 'supplier' ? (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Select
                  placeholder="Lọc theo trạng thái"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.status}
                  onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
                >
                  <Select.Option value="draft">Draft</Select.Option>
                  <Select.Option value="sent">Sent</Select.Option>
                  <Select.Option value="confirmed">Confirmed</Select.Option>
                  <Select.Option value="shipped">Shipping</Select.Option>
                  <Select.Option value="received">Received</Select.Option>
                  <Select.Option value="completed">Complete</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                  <Select.Option value="partial_received">Partially Received</Select.Option>
                </Select>
              </Col>
            </Row>
          </Card>

          <Table
            columns={columns}
            dataSource={purchaseOrders}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} purchase orders`
            }}
            onChange={handleTableChange}
          />
        </>
      ) : (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Select
                  placeholder="Lọc theo trạng thái"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.status}
                  onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
                >
                  <Select.Option value="draft">Draft</Select.Option>
                  <Select.Option value="sent">Sent</Select.Option>
                  <Select.Option value="confirmed">Confirmed</Select.Option>
                  <Select.Option value="shipped">Shipping</Select.Option>
                  <Select.Option value="received">Received</Select.Option>
                  <Select.Option value="completed">Complete</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                  <Select.Option value="partial_received">Partially Received</Select.Option>
                </Select>
              </Col>
            </Row>
          </Card>

          <Table
            columns={columns}
            dataSource={purchaseOrders}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1400 }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} purchase orders`
            }}
            onChange={handleTableChange}
          />
        </>
      )}

      {/* Detail Modal */}
      <Modal
        title="Details USDơn USDặt hàng"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={
          selectedPO && user?.role === 'supplier' && selectedPO.status === 'rejected' ? (
            <Space>
              <Button onClick={() => setIsDetailModalVisible(false)}>
                Close
              </Button>
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={() => {
                  setIsDetailModalVisible(false);
                  showActionModal(selectedPO, 'confirm_replacement');
                }}
              >
                Confirm bổ sung
              </Button>
              <Button 
                type="primary" 
                icon={<TruckOutlined />}
                style={{ backgroundColor: '#52c41a' }}
                onClick={() => {
                  setIsDetailModalVisible(false);
                  showActionModal(selectedPO, 'ship_replacement');
                }}
              >
                Giao lại ngay
              </Button>
            </Space>
          ) : null
        }
        width={700}
      >
        {selectedPO && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Order Number:</strong> {selectedPO.poNumber || 'N/A'}</p>
                <p><strong>Supplier:</strong> {selectedPO.supplier?.companyName || 'N/A'}</p>
                <p><strong>Product:</strong> {selectedPO.product?.name || 'N/A'}</p>
                <p><strong>Product Code:</strong> {selectedPO.product?.productCode || 'N/A'}</p>
                <p><strong>Quantity:</strong> {selectedPO.quantity || 0}</p>
              </Col>
              <Col span={12}>
                <p><strong>Unit Price:</strong> {selectedPO.unitPrice ? `${selectedPO.unitPrice.toLocaleString('en-US')} VND` : 'Not available'}</p>
                <p><strong>Total Amount:</strong> {selectedPO.unitPrice && selectedPO.quantity ? `${(selectedPO.quantity * selectedPO.unitPrice).toLocaleString('en-US')} VND` : 'Not available'}</p>
                <p><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedPO.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(selectedPO.status)}
                  </Tag>
                </p>
                <p><strong>Created Date:</strong> {selectedPO.createdAt ? new Date(selectedPO.createdAt).toLocaleString('en-US') : 'N/A'}</p>
              </Col>
            </Row>
            
            {selectedPO.shippedAt && (
              <p><strong>Delivery Date:</strong> {new Date(selectedPO.shippedAt).toLocaleDateString('en-US')}</p>
            )}
            
            {selectedPO.trackingNumber && (
              <p><strong>Tracking Number:</strong> {selectedPO.trackingNumber}</p>
            )}

            {/* Display shipping images */}
            {selectedPO.shippedAt && selectedPO.shippingImages && (() => {
              console.log('🚚 Trying to display shipping images:', selectedPO.shippingImages);
              try {
                const images = JSON.parse(selectedPO.shippingImages);
                console.log('✅ Parsed shipping images:', images);
                if (images && images.length > 0) {
                  return (
                    <div style={{ marginTop: 16 }}>
                      <p><strong>Images hàng hóa USDã giao:</strong></p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {images.map((imageUrl, index) => (
                          <img 
                            key={index}
                            src={`http://localhost:5001${imageUrl}`}
                            alt={`Hàng hóa giao ${index + 1}`}
                            style={{ 
                              width: 100, 
                              height: 100, 
                              objectFit: 'cover', 
                              borderRadius: 4,
                              border: '2px solid #1890ff',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(`http://localhost:5001${imageUrl}`, '_blank')}
                            onError={(e) => {
                              console.error('❌ Failed to load shipping image:', imageUrl);
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
                console.error('❌ Error parsing shipping images:', e);
                return null;
              }
              return null;
            })()}
            
            {selectedPO.receivedQuantity && (
              <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#389e0d' }}>📦 Receiving Information</h4>
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>Ordered Quantity:</strong> {selectedPO.quantity}</p>
                    <p><strong>Received Quantity:</strong> {selectedPO.receivedQuantity}</p>
                    <p><strong>Difference:</strong> 
                      <span style={{ 
                        color: selectedPO.receivedQuantity > selectedPO.quantity ? '#f5222d' : 
                              selectedPO.receivedQuantity < selectedPO.quantity ? '#fa8c16' : '#52c41a',
                        fontWeight: 'bold',
                        marginLeft: 4
                      }}>
                        {selectedPO.receivedQuantity - selectedPO.quantity > 0 ? '+' : ''}
                        {selectedPO.receivedQuantity - selectedPO.quantity}
                      </span>
                    </p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Received Date:</strong> {selectedPO.receivedAt ? new Date(selectedPO.receivedAt).toLocaleString('en-US') : 'N/A'}</p>
                    <p><strong>Received By:</strong> {selectedPO.receivedBy?.fullName || 'N/A'}</p>
                  </Col>
                </Row>
                
                {selectedPO.notes && (() => {
                  try {
                    const receiptDetails = JSON.parse(selectedPO.notes);
                    return (
                      <div style={{ marginTop: 8 }}>
                        {receiptDetails.qualityStatus && (
                          <p><strong>Quality:</strong> 
                            <Tag color={
                              receiptDetails.qualityStatus === 'excellent' ? 'green' :
                              receiptDetails.qualityStatus === 'good' ? 'blue' :
                              receiptDetails.qualityStatus === 'acceptable' ? 'orange' :
                              receiptDetails.qualityStatus === 'poor' ? 'red' : 'default'
                            } style={{ marginLeft: 4 }}>
                              {receiptDetails.qualityStatus === 'excellent' ? 'Excellent' :
                               receiptDetails.qualityStatus === 'good' ? 'Good' :
                               receiptDetails.qualityStatus === 'acceptable' ? 'Acceptable' :
                               receiptDetails.qualityStatus === 'poor' ? 'Poor' :
                               receiptDetails.qualityStatus === 'rejected' ? 'Reject' : receiptDetails.qualityStatus}
                            </Tag>
                          </p>
                        )}
                        {receiptDetails.packagingCondition && (
                          <p><strong>Packaging:</strong> 
                            <Tag color={
                              receiptDetails.packagingCondition === 'intact' ? 'green' :
                              receiptDetails.packagingCondition === 'minor_damage' ? 'orange' :
                              receiptDetails.packagingCondition === 'damaged' ? 'red' : 'default'
                            } style={{ marginLeft: 4 }}>
                              {receiptDetails.packagingCondition === 'intact' ? 'Intact' :
                               receiptDetails.packagingCondition === 'minor_damage' ? 'Minor damage' :
                               receiptDetails.packagingCondition === 'damaged' ? 'Damaged' :
                               receiptDetails.packagingCondition === 'severely_damaged' ? 'Damaged nặng' : receiptDetails.packagingCondition}
                            </Tag>
                          </p>
                        )}
                        {receiptDetails.warehouseLocation && (
                          <p><strong>Warehouse Location:</strong> {receiptDetails.warehouseLocation}</p>
                        )}
                        {receiptDetails.deliveryNotes && (
                          <div style={{ marginTop: 8 }}>
                            <p><strong>Delivery Notes:</strong></p>
                            <div style={{ padding: 8, backgroundColor: '#fafafa', borderRadius: 4, fontSize: '12px' }}>
                              {receiptDetails.deliveryNotes}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } catch (e) {
                    return (
                      <div style={{ marginTop: 8 }}>
                        <p><strong>Notes:</strong></p>
                        <div style={{ padding: 8, backgroundColor: '#fafafa', borderRadius: 4, fontSize: '12px' }}>
                          {selectedPO.notes}
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
            
            {selectedPO.rejectedAt && (
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 12, padding: 12, backgroundColor: '#fff2f0', borderRadius: 4, border: '1px solid #ffccc7' }}>
                  <h4 style={{ margin: 0, color: '#cf1322' }}>❌ Info rejected</h4>
                  <p style={{ margin: '8px 0 0 0' }}>
                    <strong>Rejection time:</strong> {new Date(selectedPO.rejectedAt).toLocaleString('en-US')}
                  </p>
                  {selectedPO.notes && (() => {
                    try {
                      const details = JSON.parse(selectedPO.notes);
                      return (
                        <div style={{ marginTop: 8 }}>
                          {details.rejectionReason && (
                            <p><strong>Reason:</strong> {
                              details.rejectionReason === 'quality_issues' ? 'Quality issues' : 
                              details.rejectionReason === 'packaging_damage' ? 'Packaging damage' :
                              details.rejectionReason === 'wrong_product' ? 'Wrong product' :
                              details.rejectionReason === 'quantity_mismatch' ? 'Sai số lượng' :
                              details.rejectionReason === 'expired_product' ? 'Product hết hạn' :
                              details.rejectionReason === 'incomplete_delivery' ? 'Delivery không USDầy USDủ' :
                              'Reason khác'
                            }</p>
                          )}
                          {details.qualityIssues && details.qualityIssues.length > 0 && (
                            <p><strong>Quality issues:</strong> {details.qualityIssues.join(', ')}</p>
                          )}
                          {details.packagingIssues && details.packagingIssues.length > 0 && (
                            <p><strong>Vấn USDề bao bì:</strong> {details.packagingIssues.join(', ')}</p>
                          )}
                          {details.quantityIssues && (
                            <p><strong>Vấn USDề số lượng:</strong> {details.quantityIssues}</p>
                          )}
                          {details.rejectionNotes && (
                            <p><strong>Notes:</strong> {details.rejectionNotes}</p>
                          )}
                          {details.rejectedBy && (
                            <p><strong>Người rejected:</strong> {details.rejectedBy}</p>
                          )}
                        </div>
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>
                
                {/* Display rejection images */}
                {selectedPO.rejectionImages && (() => {
                  console.log('🚫 Trying to display rejection images:', selectedPO.rejectionImages);
                  try {
                    const images = JSON.parse(selectedPO.rejectionImages);
                    console.log('✅ Parsed rejection images:', images);
                    if (images && images.length > 0) {
                      return (
                        <div style={{ marginTop: 8 }}>
                          <p><strong>Evidence Images rejected:</strong></p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {images.map((imageUrl, index) => (
                              <img 
                                key={index}
                                src={`http://localhost:5001${imageUrl}`}
                                alt={`Minh chứng rejected ${index + 1}`}
                                style={{ 
                                  width: 100, 
                                  height: 100, 
                                  objectFit: 'cover', 
                                  borderRadius: 4,
                                  border: '2px solid #ff4d4f',
                                  cursor: 'pointer'
                                }}
                                onClick={() => window.open(`http://localhost:5001${imageUrl}`, '_blank')}
                                onError={(e) => {
                                  console.error('❌ Failed to load rejection image:', imageUrl);
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
                    console.error('❌ Error parsing rejection images:', e);
                    return null;
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Display receipt images for completed orders */}
            {selectedPO.receivedAt && selectedPO.receiptImages && (() => {
              console.log('🖼️ Trying to display receipt images:', selectedPO.receiptImages);
              try {
                const images = JSON.parse(selectedPO.receiptImages);
                console.log('✅ Parsed receipt images:', images);
                if (images && images.length > 0) {
                  return (
                    <div style={{ marginTop: 16 }}>
                      <p><strong>Received Goods Images:</strong></p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {images.map((imageUrl, index) => (
                          <img 
                            key={index}
                            src={`http://localhost:5001${imageUrl}`}
                            alt={`Hàng hóa nhận ${index + 1}`}
                            style={{ 
                              width: 100, 
                              height: 100, 
                              objectFit: 'cover', 
                              borderRadius: 4,
                              border: '2px solid #52c41a',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(`http://localhost:5001${imageUrl}`, '_blank')}
                            onError={(e) => {
                              console.error('❌ Failed to load receipt image:', imageUrl);
                              e.target.style.border = '2px solid #ff4d4f';
                              e.target.alt = 'Cannot load image';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                }
              } catch (e) {
                console.error('❌ Error parsing receipt images:', e);
                return null;
              }
              return null;
            })()}
            
            {selectedPO.notes && !selectedPO.rejectedAt && !selectedPO.receivedAt && (
              <div style={{ marginTop: 16 }}>
                <p><strong>Notes:</strong></p>
                <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {selectedPO.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={getActionModalTitle()}
        open={isActionModalVisible}
        onOk={handleAction}
        onCancel={() => setIsActionModalVisible(false)}
        okText="Confirm"
      >
        {renderActionForm()}
      </Modal>
    </div>
  );
};

export default PurchaseOrders;