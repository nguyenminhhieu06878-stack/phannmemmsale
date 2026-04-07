import React, { useState } from 'react'
import { Typography, Card, Descriptions, Tag, Button, Modal, Form, Input, message } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { EditOutlined, LockOutlined } from '@ant-design/icons'
import { changePassword } from '../store/slices/userSlice'
import useResponsive from '../hooks/useResponsive'

const { Title } = Typography

const Profile = () => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const { isMobile } = useResponsive()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordForm] = Form.useForm()

  const handleChangePassword = async (values) => {
    try {
      await dispatch(changePassword(values)).unwrap()
      message.success('Password changed successfully')
      setIsPasswordModalOpen(false)
      passwordForm.resetFields()
    } catch (error) {
      message.error(error || 'Failed to change password')
    }
  }

  const getRoleText = (role) => {
    const roleMap = {
      admin: 'Administrator',
      sales_manager: 'Sales Manager',
      sales_staff: 'Sales Staff',
      customer_service: 'Customer Service',
      warehouse_staff: 'Warehouse Staff',
      accountant: 'Accountant',
      delivery_staff: 'Delivery Staff',
      director: 'Director'
    }
    return roleMap[role] || role
  }

  const getRoleColor = (role) => {
    const colorMap = {
      admin: 'red',
      sales_manager: 'blue',
      sales_staff: 'green',
      customer_service: 'orange',
      warehouse_staff: 'purple',
      accountant: 'cyan',
      delivery_staff: 'magenta',
      director: 'gold'
    }
    return colorMap[role] || 'default'
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <Title level={2} style={{ margin: 0 }}>Personal Information</Title>
        <Button
          icon={<LockOutlined />}
          onClick={() => setIsPasswordModalOpen(true)}
          size={isMobile ? 'small' : 'middle'}
          style={{ flexShrink: 0 }}
        >
          {isMobile ? 'Change PWD' : 'Change Password'}
        </Button>
      </div>
      
      <Card>
        <Descriptions title="Info người dùng" bordered column={2}>
          <Descriptions.Item label="Full Name">
            {user?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {user?.username}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {user?.phone || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Role">
            <Tag color={getRoleColor(user?.role)}>
              {getRoleText(user?.role)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Department">
            {user?.department || 'Chưa cập nhật'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={user?.isActive ? 'green' : 'red'}>
              {user?.isActive ? 'Active' : 'No hoạt USDộng'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Last Login">
            {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US') : 'Not available'}
          </Descriptions.Item>
          <Descriptions.Item label="Created Date" span={2}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleString('en-US') : 'Not defined'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Change Password"
        open={isPasswordModalOpen}
        onCancel={() => {
          setIsPasswordModalOpen(false)
          passwordForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Password hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: 'Please enter password hiện tại' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Password mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Confirm mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Confirmation password does not match'))
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => {
                setIsPasswordModalOpen(false)
                passwordForm.resetFields()
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Change Password
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile