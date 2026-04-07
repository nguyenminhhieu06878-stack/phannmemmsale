import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../store/slices/userSlice';
import PermissionButton from '../../components/PermissionButton';
import { getRoleDisplayName } from '../../utils/permissions';
import useResponsive from '../../hooks/useResponsive';

const { Option } = Select;

const Users = () => {
  const dispatch = useDispatch();
  const { list, loading, pagination } = useSelector(state => state.users);
  const { user: currentUser } = useSelector(state => state.auth);
  const { isMobile, isTablet } = useResponsive();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleTableChange = (pagination) => {
    dispatch(fetchUsers({ 
      page: pagination.current, 
      limit: pagination.pageSize,
      search: searchText 
    }));
  };

  const handleSearch = () => {
    dispatch(fetchUsers({ page: 1, limit: 10, search: searchText }));
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      fullName: record.fullName,
      phone: record.phone,
      role: record.role,
      department: record.department,
      isActive: record.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success('User deleted successfully');
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    } catch (error) {
      message.error(error.message || 'Failed to delete user');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await dispatch(updateUser({ id: editingUser.id, data: values })).unwrap();
        message.success('User updated successfully');
      } else {
        await dispatch(createUser(values)).unwrap();
        message.success('User created successfully');
      }
      setIsModalOpen(false);
      form.resetFields();
      dispatch(fetchUsers({ page: 1, limit: 10 }));
    } catch (error) {
      message.error(error.message || 'Operation failed');
    }
  };

  const getRoleColor = (role) => {
    const colorMap = {
      admin: 'red',
      sales_manager: 'blue',
      sales_staff: 'green',
      customer_service: 'orange',
      accountant: 'cyan',
      warehouse_staff: 'purple',
      delivery_staff: 'magenta',
      director: 'gold'
    };
    return colorMap[role] || 'default';
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>{getRoleDisplayName(role)}</Tag>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'No hoạt USDộng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small" wrap>
          <PermissionButton
            action="user.edit"
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size={isMobile ? 'small' : 'middle'}
          >
            {isMobile ? '' : 'Edit'}
          </PermissionButton>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={record.id === currentUser?.id}
          >
            <PermissionButton
              action="user.delete"
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.id === currentUser?.id}
              tooltip="Cannot delete yourself"
              size={isMobile ? 'small' : 'middle'}
            >
              {isMobile ? '' : 'Delete'}
            </PermissionButton>
          </Popconfirm>
        </Space>
      ),
      width: isMobile ? 80 : 120
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ 
          marginBottom: 16, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            alignItems: 'center',
            flex: 1,
            minWidth: isMobile ? '100%' : 'auto'
          }}>
            <Input
              placeholder="Search theo tên, email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              style={{ 
                width: isMobile ? '100%' : (isTablet ? 200 : 300),
                maxWidth: isMobile ? 'none' : 300
              }}
            />
            <Button 
              icon={<SearchOutlined />} 
              onClick={handleSearch}
              size={isMobile ? 'small' : 'middle'}
              style={{ flexShrink: 0 }}
            >
              {isMobile ? '' : 'Search'}
            </Button>
          </div>
          <PermissionButton
            action="user.create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size={isMobile ? 'small' : 'middle'}
            style={{ 
              flexShrink: 0,
              minWidth: 'fit-content'
            }}
          >
            {isMobile ? 'Add' : 'Add User'}
          </PermissionButton>
        </div>

        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          scroll={{ x: isMobile ? 800 : 1200 }}
          size={isMobile ? 'small' : 'middle'}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: !isMobile,
            showQuickJumper: !isMobile,
            showTotal: (total) => `Total ${total} users`,
            size: isMobile ? 'small' : 'default',
            simple: isMobile
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User mới'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please enter username' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Please enter họ và tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select vai trò' }]}
          >
            <Select>
              <Option value="admin">Administrator</Option>
              <Option value="sales_manager">Sales Manager</Option>
              <Option value="sales_staff">Sales Staff</Option>
              <Option value="customer_service">Customer Service</Option>
              <Option value="accountant">Accountant</Option>
              <Option value="warehouse_staff">Warehouse Staff</Option>
              <Option value="delivery_staff">Delivery Staff</Option>
              <Option value="director">Director</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Department"
            name="department"
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Status"
            name="isActive"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>No hoạt USDộng</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingUser ? 'Update' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
