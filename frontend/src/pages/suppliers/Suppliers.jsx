import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, message, Tag, Input, Card, Row, Col } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { supplierService } from '../../services/supplierService';
import { useSelector } from 'react-redux';
import useResponsive from '../../hooks/useResponsive';

const Suppliers = () => {
  const { user } = useSelector(state => state.auth);
  const { isMobile } = useResponsive();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchSuppliers();
  }, [pagination.page, pagination.limit]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };
      const response = await supplierService.getAllSuppliers(params);
      setSuppliers(response.data.data.suppliers || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination?.total || 0
      }));
    } catch (error) {
      message.error('Cannot load supplier list');
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

  const showDetailModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailModalVisible(true);
  };

  const showCreateModal = () => {
    form.resetFields();
    setIsCreateModalVisible(true);
  };

  const showEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    editForm.setFieldsValue(supplier);
    setIsEditModalVisible(true);
  };

  const handleCreateSupplier = async () => {
    try {
      const values = await form.validateFields();
      await supplierService.createSupplier(values);
      message.success('Supplier created successfully');
      setIsCreateModalVisible(false);
      fetchSuppliers();
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleEditSupplier = async () => {
    try {
      const values = await editForm.validateFields();
      await supplierService.updateSupplier(selectedSupplier.id, values);
      message.success('Supplier updated successfully');
      setIsEditModalVisible(false);
      fetchSuppliers();
    } catch (error) {
      message.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleDeleteSupplier = async (id) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this supplier?',
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await supplierService.deleteSupplier(id);
          message.success('Supplier deleted successfully');
          fetchSuppliers();
        } catch (error) {
          message.error(error.response?.data?.message || 'An error occurred');
        }
      }
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 200
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 150
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={getStatusColor(isActive)}>
          {getStatusText(isActive)}
        </Tag>
      ),
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
          {(user?.role === 'admin' || user?.role === 'sales_manager') && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)}
              >
                Edit
              </Button>
              {user?.role === 'admin' && (
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDeleteSupplier(record.id)}
                >
                  Delete
                </Button>
              )}
            </>
          )}
        </Space>
      ),
      width: 200
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
        <h1 style={{ margin: 0 }}>Supplier Management</h1>
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {(user?.role === 'admin' || user?.role === 'sales_manager') && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showCreateModal}
              size={isMobile ? 'small' : 'middle'}
              style={{ flexShrink: 0 }}
            >
              {isMobile ? 'Add' : 'Add Supplier'}
            </Button>
          )}
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchSuppliers}
            size={isMobile ? 'small' : 'middle'}
            style={{ flexShrink: 0 }}
          >
            {isMobile ? '' : 'Refresh'}
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={suppliers}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} suppliers`
        }}
        onChange={handleTableChange}
      />

      {/* Detail Modal */}
      <Modal
        title="Supplier Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedSupplier && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Company Name:</strong> {selectedSupplier.companyName}</p>
                <p><strong>Contact Person:</strong> {selectedSupplier.contactPerson}</p>
                <p><strong>Email:</strong> {selectedSupplier.email}</p>
                <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
              </Col>
              <Col span={12}>
                <p><strong>Address:</strong> {selectedSupplier.address}</p>
                <p><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedSupplier.isActive)} style={{ marginLeft: 8 }}>
                    {getStatusText(selectedSupplier.isActive)}
                  </Tag>
                </p>
                <p><strong>Created Date:</strong> {new Date(selectedSupplier.createdAt).toLocaleString('en-US')}</p>
              </Col>
            </Row>
            {selectedSupplier.notes && (
              <div style={{ marginTop: 16 }}>
                <p><strong>Notes:</strong></p>
                <div style={{ padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {selectedSupplier.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        title="Add Supplier mới"
        open={isCreateModalVisible}
        onOk={handleCreateSupplier}
        onCancel={() => setIsCreateModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input placeholder="Enter company name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[{ required: true, message: 'Please enter tên người liên hệ' }]}
              >
                <Input placeholder="Import tên người liên hệ" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Import email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter số USDiện thoại' }]}
              >
                <Input placeholder="Import số USDiện thoại" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter USDịa chỉ' }]}
          >
            <Input.TextArea rows={3} placeholder="Import USDịa chỉ" />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} placeholder="Enter notes (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Update Supplier"
        open={isEditModalVisible}
        onOk={handleEditSupplier}
        onCancel={() => setIsEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input placeholder="Enter company name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[{ required: true, message: 'Please enter tên người liên hệ' }]}
              >
                <Input placeholder="Import tên người liên hệ" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Import email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter số USDiện thoại' }]}
              >
                <Input placeholder="Import số USDiện thoại" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter USDịa chỉ' }]}
          >
            <Input.TextArea rows={3} placeholder="Import USDịa chỉ" />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} placeholder="Enter notes (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Suppliers;