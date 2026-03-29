import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, Input, message, Space, Descriptions, Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders } from '../store/slices/orderSlice';
import { orderService } from '../services/orderService';
import dayjs from 'dayjs';

const InvoiceForm = ({ initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { list: orders } = useSelector(state => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit: 100, status: 'approved' }));
  }, [dispatch]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null
      });
    }
  }, [initialValues, form]);

  const handleOrderChange = async (orderId) => {
    try {
      setLoading(true);
      const response = await orderService.getById(orderId);
      setSelectedOrder(response.data.data);
      
      // Auto-fill due date (30 days from now)
      form.setFieldsValue({
        dueDate: dayjs().add(30, 'days')
      });
    } catch (error) {
      message.error('Cannot load order information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const data = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        items: selectedOrder?.items || []
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="orderId"
        label="Order"
        rules={[{ required: true, message: 'Please select order' }]}
      >
        <Select
          placeholder="Select Order"
          onChange={handleOrderChange}
          loading={loading}
          showSearch
          optionFilterProp="children"
          disabled={!!initialValues}
        >
          {orders.map(order => (
            <Select.Option key={order.id} value={order.id}>
              {order.orderNumber} - {order.customer?.name} - {parseFloat(order.totalAmount).toLocaleString()} VND
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {selectedOrder && (
        <div style={{ marginBottom: 16, padding: 16, background: '#fafafa', borderRadius: 4 }}>
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="Customer">
              {selectedOrder.customer?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedOrder.customer?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Number of Products">
              {selectedOrder.items?.length || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              {parseFloat(selectedOrder.totalAmount).toLocaleString()} VND
            </Descriptions.Item>
          </Descriptions>

          <Table
            dataSource={selectedOrder.items}
            pagination={false}
            size="small"
            style={{ marginTop: 8 }}
            columns={[
              { title: 'Product', dataIndex: 'productName', key: 'productName' },
              { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 100 },
              { 
                title: 'Unit Price', 
                dataIndex: 'unitPrice', 
                key: 'unitPrice',
                width: 150,
                render: (val) => `${parseFloat(val).toLocaleString()} VND`
              },
              { 
                title: 'Total', 
                dataIndex: 'total', 
                key: 'total',
                width: 150,
                render: (val) => `${parseFloat(val).toLocaleString()} VND`
              }
            ]}
          />
        </div>
      )}

      <Form.Item
        name="dueDate"
        label="Payment Due Date"
        rules={[{ required: true, message: 'Please select payment due date' }]}
      >
        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
      </Form.Item>

      <Form.Item name="paymentTerms" label="Payment Terms">
        <Input.TextArea rows={2} placeholder="E.g.: Payment within 30 days" />
      </Form.Item>

      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" onClick={handleSubmit} disabled={!selectedOrder && !initialValues}>
            {initialValues ? 'Update' : 'Create Invoice'}
          </Button>
          <Button onClick={onCancel}>
            Cancel
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default InvoiceForm;
