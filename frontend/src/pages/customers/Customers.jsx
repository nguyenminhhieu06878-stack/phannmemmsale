import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Input, Space, Modal, Form, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import useResponsive from '../../hooks/useResponsive';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  clearCurrent
} from '../../store/slices/customerSlice';

const Customers = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector(state => state.customers);
  const { isMobile } = useResponsive();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCustomers({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleTableChange = (pag) => {
    dispatch(fetchCustomers({ page: pag.current, limit: pag.pageSize, search: searchText }));
  };

  const handleSearch = () => {
    dispatch(fetchCustomers({ page: 1, limit: 10, search: searchText }));
  };

  const showModal = (customer = null) => {
    setEditingCustomer(customer);
    if (customer) {
      form.setFieldsValue(customer);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCustomer) {
        await dispatch(updateCustomer({ id: editingCustomer.id, data: values })).unwrap();
        message.success('Customer updated successfully');
      } else {
        await dispatch(createCustomer(values)).unwrap();
        message.success('Customer added successfully');
      }
      setIsModalVisible(false);
      dispatch(fetchCustomers({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteCustomer(id)).unwrap();
      message.success('Customer deleted successfully');
      dispatch(fetchCustomers({ page: pagination.page, limit: pagination.limit }));
    } catch (error) {
      message.error(error.message || 'An error occurred');
    }
  };

  const columns = [
    {
      title: 'Customer Code',
      dataIndex: 'customerCode',
      key: 'customerCode'
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'No hoạt USDộng'}
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
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
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
        <h1 style={{ margin: 0 }}>Customer Management</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
          size={isMobile ? 'small' : 'middle'}
          style={{ flexShrink: 0 }}
        >
          {isMobile ? 'Add' : 'Add Customer'}
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search customer"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
        <Button icon={<SearchOutlined />} onClick={handleSearch}>
          Search
        </Button>
      </Space>

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
          showTotal: (total) => `Total customers`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="companyName"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter số USDiện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="customerCode" label="Customer Code">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
